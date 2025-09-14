#!/usr/bin/env python
"""Utility to create (or reconcile) LIVE Stripe Prices for all plans.

Usage examples:

  # Dry run (shows what would be created)
  python backend/utils/scripts/create_live_prices.py --live-key sk_live_xxx

  # Actually create monthly & credit prices
  python backend/utils/scripts/create_live_prices.py --live-key sk_live_xxx --apply

  # Include yearly & commitment plans too
  python backend/utils/scripts/create_live_prices.py --live-key sk_live_xxx --include-yearly --include-commitment --apply

  # Override product id
  python backend/utils/scripts/create_live_prices.py --live-key sk_live_xxx --product-id prod_ABC123 --apply

The script prints a JSON mapping you can copy into config constants after creation.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Dict, List

try:
    import stripe  # type: ignore
except ImportError:
    # Keep message on a single physical line to avoid accidental editor wraps creating syntax errors
    print("ERROR: stripe package not installed. Install with: uv pip install stripe", file=sys.stderr)
    sys.exit(1)

# ---- Plan Specification ----------------------------------------------------

# Base monthly tiers (hours / monthly price USD)
MONTHLY_PLANS = [
    ("tier_2_20_monthly",    "2h/$20 monthly",    2000),
    ("tier_6_50_monthly",    "6h/$50 monthly",    5000),
    ("tier_12_100_monthly",  "12h/$100 monthly", 10000),
    ("tier_25_200_monthly",  "25h/$200 monthly", 20000),
    ("tier_50_400_monthly",  "50h/$400 monthly", 40000),
    ("tier_125_800_monthly", "125h/$800 monthly", 80000),
    ("tier_200_1000_monthly","200h/$1000 monthly",100000),
]

# Yearly prepaid (12 * monthly * 0.85) — amounts in cents
YEARLY_PLANS = [
    ("tier_2_20_yearly",    "2h/$204/year",     20400),
    ("tier_6_50_yearly",    "6h/$510/year",    51000),
    ("tier_12_100_yearly",  "12h/$1020/year", 102000),
    ("tier_25_200_yearly",  "25h/$2040/year", 204000),
    ("tier_50_400_yearly",  "50h/$4080/year", 408000),
    ("tier_125_800_yearly", "125h/$8160/year", 816000),
    ("tier_200_1000_yearly","200h/$10200/year",1020000),
]

# Yearly commitment (monthly billed w/ discount) amounts in cents per month
COMMITMENT_PLANS = [
    ("tier_2_17_yearly_commitment",  "2h/$17/month (yearly)",    1700),
    ("tier_6_42_yearly_commitment",  "6h/$42.50/month (yearly)", 4250),
    ("tier_25_170_yearly_commitment","25h/$170/month (yearly)", 17000),
]

# Credit one-time packages (amount in dollars -> cents)
CREDIT_PACKAGES = [
    ("credits_10",  "Credits $10",   1000),
    ("credits_25",  "Credits $25",   2500),
    ("credits_50",  "Credits $50",   5000),
    ("credits_100", "Credits $100", 10000),
    ("credits_250", "Credits $250", 25000),
    ("credits_500", "Credits $500", 50000),
]


def gather_specs(include_yearly: bool, include_commitment: bool, include_credits: bool) -> List[Dict]:
    specs: List[Dict] = []
    for code, nickname, amount in MONTHLY_PLANS:
        specs.append({
            "lookup_key": code,
            "nickname": nickname,
            "unit_amount": amount,
            "recurring": {"interval": "month"},
            "type": "recurring",
            "metadata": {"app_plan_code": code, "plan_family": "monthly"},
        })
    if include_yearly:
        for code, nickname, amount in YEARLY_PLANS:
            specs.append({
                "lookup_key": code,
                "nickname": nickname,
                "unit_amount": amount,
                "recurring": {"interval": "year"},
                "type": "recurring",
                "metadata": {"app_plan_code": code, "plan_family": "yearly"},
            })
    if include_commitment:
        for code, nickname, amount in COMMITMENT_PLANS:
            specs.append({
                "lookup_key": code,
                "nickname": nickname,
                "unit_amount": amount,
                "recurring": {"interval": "month"},
                "type": "recurring",
                "metadata": {"app_plan_code": code, "plan_family": "yearly_commitment"},
            })
    if include_credits:
        for code, nickname, amount in CREDIT_PACKAGES:
            specs.append({
                "lookup_key": code,
                "nickname": nickname,
                "unit_amount": amount,
                "type": "one_time",
                "metadata": {"app_plan_code": code, "plan_family": "credits"},
            })
    return specs


def find_existing_live_price(live_prices, spec) -> str | None:
    for p in live_prices.auto_paging_iter():  # type: ignore
        if p.get("lookup_key") == spec["lookup_key"]:
            return p["id"]
        # Fallback: match nickname + amount + interval
        same_amount = p.get("unit_amount") == spec["unit_amount"]
        same_nick = (p.get("nickname") or "").strip() == spec["nickname"].strip()
        if spec["type"] == "recurring" and p.get("type") == "recurring":
            interval = (p.get("recurring") or {}).get("interval")
            spec_interval = spec["recurring"]["interval"]
            if same_amount and same_nick and interval == spec_interval:
                return p["id"]
        elif spec["type"] == "one_time" and p.get("type") == "one_time":
            if same_amount and same_nick:
                return p["id"]
    return None


def main():
    parser = argparse.ArgumentParser(description="Create LIVE Stripe prices for plans.")
    parser.add_argument("--live-key", dest="live_key", help="sk_live_... key (or STRIPE_LIVE_SECRET_KEY env)")
    parser.add_argument("--product-id", dest="product_id", default=os.environ.get("STRIPE_LIVE_PRODUCT_ID"), help="Existing LIVE product id (omit to auto-create with --create-product-if-missing)")
    parser.add_argument("--create-product-if-missing", action="store_true", help="Create the product if the provided product id does not exist")
    parser.add_argument("--product-name", dest="product_name", default="Xera Subscription", help="Name to use when creating product (with --create-product-if-missing)")
    parser.add_argument("--include-yearly", action="store_true", help="Include yearly prepaid plans")
    parser.add_argument("--include-commitment", action="store_true", help="Include yearly commitment monthly-billed plans")
    parser.add_argument("--include-credits", action="store_true", help="Include credit one-time prices")
    parser.add_argument("--apply", action="store_true", help="Actually create (otherwise dry-run)")
    parser.add_argument("--json", action="store_true", help="Output only JSON mapping on success")
    args = parser.parse_args()

    live_key = args.live_key or os.environ.get("STRIPE_LIVE_SECRET_KEY")
    # Fallback: use STRIPE_SECRET_KEY if it appears to be a live key
    if not live_key:
        candidate = os.environ.get("STRIPE_SECRET_KEY")
        if candidate and candidate.startswith("sk_live_"):
            live_key = candidate
    if not live_key:
        print("ERROR: Provide --live-key or set STRIPE_LIVE_SECRET_KEY (or STRIPE_SECRET_KEY with sk_live_ prefix)", file=sys.stderr)
        sys.exit(1)

    stripe.api_key = live_key

    # Validate product exists (create option could be added later)
    product = None
    if args.product_id:
        try:
            product = stripe.Product.retrieve(args.product_id)
        except Exception as e:  # noqa: BLE001
            if not args.create_product_if_missing:
                print(f"ERROR: Could not retrieve product {args.product_id}: {e}", file=sys.stderr)
                print("Hint: omit --product-id and add --create-product-if-missing to auto-create, or supply an existing product id.", file=sys.stderr)
                sys.exit(1)

    if product is None:
        # Need to (maybe) create product
        if args.create_product_if_missing:
            if not args.apply:
                print(f"(dry-run) Would create product named '{args.product_name}'")
                product = type("ProductStub", (), {"id": "(pending_product)", "get": lambda self, k: args.product_name})()
            else:
                try:
                    product = stripe.Product.create(name=args.product_name)
                    print(f"Created product {product.id} ('{product.name}')")
                except Exception as ce:  # noqa: BLE001
                    print(f"ERROR: Failed to create product: {ce}", file=sys.stderr)
                    sys.exit(1)
        else:
            print("ERROR: No product_id supplied and --create-product-if-missing not set.", file=sys.stderr)
            sys.exit(1)

    specs = gather_specs(args.include_yearly, args.include_commitment, args.include_credits)

    # Fetch existing live prices for that product
    live_prices = stripe.Price.list(product=product.id, limit=100, expand=["data.product"])

    mapping = {}
    to_create = []
    for spec in specs:
        existing_id = find_existing_live_price(live_prices, spec)
        if existing_id:
            mapping[spec["lookup_key"]] = existing_id
        else:
            to_create.append(spec)

    if not args.json:
        print("Product:", product.id, product.get("name"))
        print(f"Existing matching prices: {len(mapping)}")
        print(f"To create: {len(to_create)}")
        if to_create:
            for spec in to_create:
                if spec["type"] == "recurring":
                    print(f"  - {spec['lookup_key']} {spec['nickname']} {spec['unit_amount']}c interval={spec['recurring']['interval']}")
                else:
                    print(f"  - {spec['lookup_key']} {spec['nickname']} {spec['unit_amount']}c one_time")

    if args.apply and to_create:
        for spec in to_create:
            create_params = {
                "product": product.id,
                "unit_amount": spec["unit_amount"],
                "currency": "usd",
                "nickname": spec["nickname"],
                "lookup_key": spec["lookup_key"],
                "metadata": spec.get("metadata", {}),
            }
            if spec["type"] == "recurring":
                create_params["recurring"] = spec["recurring"]
            price = stripe.Price.create(**create_params)
            mapping[spec["lookup_key"]] = price.id
            if not args.json:
                print(f"Created {spec['lookup_key']} -> {price.id}")
    elif not args.apply and to_create and not args.json:
        print("(dry-run) Use --apply to create the above prices.")

    # Final JSON mapping output
    print(json.dumps({"product_id": product.id, "prices": mapping}, indent=2))

    # Exit non-zero if apply requested but some still missing (should not happen)
    if args.apply and len(mapping) < len(specs):
        missing = {s["lookup_key"] for s in specs if s["lookup_key"] not in mapping}
        print(f"WARNING: Missing after apply: {missing}", file=sys.stderr)


if __name__ == "__main__":
    main()
