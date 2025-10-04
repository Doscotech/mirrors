# Billing Architecture Analysis

**Date**: October 4, 2025  
**Issue**: Stripe Price ID Validation Errors Flooding Logs  
**Root Cause**: Environment Mismatch Between Configuration and Stripe Account

---

## Executive Summary

The backend is configured with `ENV_MODE=production` and `VALIDATE_STRIPE_PRICES=true`, causing it to validate **production Stripe price IDs** against your **test Stripe account** (using `sk_test_` key). Since the production price IDs don't exist in your test account, every worker process initialization triggers 24+ validation errors.

### Key Metrics
- **24 Price IDs** being validated (monthly, yearly, yearly-commitment, credit packages)
- **4 Worker Processes** × 4 threads = 16 concurrent workers
- **Each worker** validates all prices on startup
- **Result**: 384+ validation attempts per backend restart

---

## Architecture Overview

### 1. Billing Configuration System

```
┌─────────────────────────────────────────────────────────┐
│                  Configuration Flow                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  backend/.env                                            │
│  ├─ ENV_MODE=production                                 │
│  ├─ STRIPE_SECRET_KEY=sk_test_...  ← TEST KEY!          │
│  ├─ VALIDATE_STRIPE_PRICES=true                         │
│  └─ STRICT_STRIPE_PRICE_VALIDATION=false                │
│           ↓                                              │
│  core/utils/config.py (Configuration class)             │
│  ├─ Loads all STRIPE_*_ID_PROD constants                │
│  ├─ Calls _validate_stripe_prices() at startup          │
│  └─ Logs warnings (doesn't fail due to STRICT=false)    │
│           ↓                                              │
│  core/billing/config.py (TIERS dict)                    │
│  └─ Maps tier names to price_ids arrays                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. Subscription Tiers Structure

The system defines **8 subscription tiers** with **3 billing modes** each:

| Tier Name | Monthly Credits | Monthly Price | Yearly Price | Yearly Commitment |
|-----------|----------------|---------------|--------------|-------------------|
| `tier_2_20` | $20 | $2/mo | $20/yr (15% off) | $17/mo × 12 months |
| `tier_6_50` | $50 | $6/mo | $61/yr (15% off) | $42.50/mo × 12 months |
| `tier_12_100` | $100 | $12/mo | $122/yr (15% off) | - |
| `tier_25_200` | $200 | $25/mo | $255/yr (15% off) | $170/mo × 12 months |
| `tier_50_400` | $400 | $50/mo | $510/yr (15% off) | - |
| `tier_125_800` | $800 | $125/mo | $1,275/yr (15% off) | - |
| `tier_200_1000` | $1000 | $200/mo | $2,040/yr (15% off) | - |

**Total Subscription Price IDs**: 20 (8 monthly + 7 yearly + 5 yearly-commitment)

### 3. Credit Packages

One-time credit purchases for users who want to top-up:

| Package Amount | Price ID (Prod) |
|----------------|-----------------|
| $10 credits | `price_1S6M5AK1vBaPZ9xHzKWq6dEe` |
| $25 credits | `price_1S6M5AK1vBaPZ9xH57JIJer7` |
| $50 credits | `price_1S6M5AK1vBaPZ9xHw6sFhef3` |
| $100 credits | `price_1S6M5BK1vBaPZ9xHxTjKtzPA` |
| $250 credits | `price_1S6M5BK1vBaPZ9xHZsow43pM` |
| $500 credits | `price_1S6M5CK1vBaPZ9xHSWok1lMo` |

**Total Credit Price IDs**: 6

---

## Problem Breakdown

### Current Configuration State

```bash
# Your backend/.env
ENV_MODE=production                    # ← Using PRODUCTION price IDs
STRIPE_SECRET_KEY=sk_test_51S633A...  # ← But TEST Stripe key!
VALIDATE_STRIPE_PRICES=true            # ← Validation enabled
STRICT_STRIPE_PRICE_VALIDATION=false   # ← Warnings only (doesn't fail)
```

### The Validation Process

**File**: `backend/core/utils/config.py`  
**Function**: `_validate_stripe_prices()` (lines 517-593)

```python
def _validate_stripe_prices(self):
    stripe.api_key = self.STRIPE_SECRET_KEY  # Uses sk_test_ key
    
    price_ids = [
        # Gets PRODUCTION price IDs because ENV_MODE=production
        self.STRIPE_FREE_TIER_ID,      # → price_1RILb4G6l1KZGqIrK4QLrx9i
        self.STRIPE_TIER_2_20_ID,      # → price_1S6M51K1vBaPZ9xHerPEa3p8
        # ... 22 more production IDs
    ]
    
    for pid in price_ids:
        try:
            stripe.Price.retrieve(pid)  # ← Fails: prod ID not in test account!
            validated += 1
        except Exception as e:
            msg = f"Invalid or inaccessible Stripe price ID '{pid}': {e}"
            errors.append(msg)
            logger.warning(msg)  # ← This is what you're seeing!
```

### When Validation Runs

1. **API Server Startup**: `uv run api.py`
   - 4 worker processes spawn
   - Each imports `core.utils.config`
   - Each runs validation → **4 × 24 = 96 warnings**

2. **Dramatiq Worker Startup**: `uv run dramatiq --processes 4 --threads 4 run_agent_background`
   - 16 workers spawn
   - Each imports config module
   - Each runs validation → **16 × 24 = 384 warnings**

3. **Total per Backend Restart**: **480 validation warnings**

---

## Why This Exists

### Design Intent

The validation system was designed to:

1. **Catch configuration drift** - Detect when price IDs get out of sync with Stripe
2. **Prevent production incidents** - Fail fast if critical price IDs are deleted
3. **Support multi-environment** - Validate staging prices vs prod prices separately
4. **Development flexibility** - Allow disabling via `VALIDATE_STRIPE_PRICES=false`

### The Problem

The system assumes you're using **matching environments**:
- `ENV_MODE=production` → Use `sk_live_` key → Validate prod price IDs ✅
- `ENV_MODE=staging` → Use `sk_test_` key → Validate staging price IDs ✅
- `ENV_MODE=local` → Skip validation or use test prices ✅

**Your setup**: `ENV_MODE=production` + `sk_test_` key = ❌

---

## Price ID Mapping by Environment

### Production Price IDs (Current Use)
These are **live Stripe prices** from the Xera production account:

```python
# All start with price_1S6M* or price_1RILb4
STRIPE_TIER_2_20_ID_PROD = 'price_1S6M51K1vBaPZ9xHerPEa3p8'
# ... 23 more
```

**Stripe Account**: Live mode (`sk_live_` key required)  
**Created**: September 12, 2025 (per comment in `.env`)

### Staging Price IDs (Not Used)
These are **test mode prices** that exist in your test account:

```python
# All start with price_1RIG*, price_1RIK*, price_1ReG*, price_1RqY*, price_1Rx*
STRIPE_TIER_2_20_ID_STAGING = 'price_1RIGvuG6l1KZGqIrCRu0E4Gi'
# ... 23 more
```

**Stripe Account**: Test mode (`sk_test_` key compatible)

---

## Code Flow: How Tiers Use Price IDs

### 1. Tier Definition (`backend/core/billing/config.py`)

```python
TIERS: Dict[str, Tier] = {
    'tier_2_20': Tier(
        name='tier_2_20',
        price_ids=[
            config.STRIPE_TIER_2_20_ID,           # Monthly
            config.STRIPE_TIER_2_20_YEARLY_ID,    # Yearly
            config.STRIPE_TIER_2_17_YEARLY_COMMITMENT_ID  # Commitment
        ],
        monthly_credits=Decimal('20.00'),
        display_name='Starter',
        can_purchase_credits=True,
        models=['all'],
        project_limit=100
    ),
    # ... 7 more tiers
}
```

### 2. Price ID Resolution (`backend/core/utils/config.py`)

```python
@property
def STRIPE_TIER_2_20_ID(self) -> str:
    if self.ENV_MODE == EnvMode.STAGING:
        return self.STRIPE_TIER_2_20_ID_STAGING  # test mode price
    return self.STRIPE_TIER_2_20_ID_PROD         # live mode price
```

**Current behavior**: `ENV_MODE=production` → Always returns `_PROD` price IDs

### 3. Subscription Creation Flow

```
User clicks "Subscribe to Starter" ($2/month)
           ↓
Frontend: POST /api/billing/subscription/create
           {
             "price_id": "price_1S6M51K1vBaPZ9xHerPEa3p8"  ← From frontend/src/lib/config.ts
           }
           ↓
Backend: subscription_service.py::create_subscription()
           ↓
Stripe API: stripe.checkout.Session.create(
             line_items=[{
               "price": "price_1S6M51K1vBaPZ9xHerPEa3p8"  ← Must exist in Stripe!
             }]
           )
           ↓
ERROR: No such price (if using test key with prod price ID)
```

---

## Impact Analysis

### Current State (With Errors)

✅ **System still works** - Validation warnings don't crash the app  
❌ **Logs are polluted** - 480+ warnings per restart make debugging difficult  
⚠️ **Potential confusion** - Developers might think Stripe integration is broken  
⚠️ **Performance hit** - 24 API calls per worker × 20 workers = 480 network requests on startup

### If Using Production Key

If you switched to `sk_live_` key:
- ✅ Validation would pass (prices exist)
- ⚠️ Risk of creating real charges during development
- ⚠️ Need to handle webhooks from live Stripe events
- ⚠️ Test data mixing with production data

---

## Solutions

### Option 1: Disable Validation (Quick Fix) ⭐ **RECOMMENDED FOR LOCAL DEV**

**Change in `backend/.env`:**
```bash
VALIDATE_STRIPE_PRICES=false  # ← Change from true to false
```

**Pros**:
- ✅ Immediate fix - no more warnings
- ✅ Safe for local development
- ✅ No code changes needed

**Cons**:
- ❌ Won't catch outdated price IDs during development
- ❌ Must re-enable for staging/production deployments

---

### Option 2: Use Staging Environment (Proper Fix) ⭐ **RECOMMENDED FOR CONSISTENT SETUP**

**Change in `backend/.env`:**
```bash
ENV_MODE=staging  # ← Change from production to staging
# Keep VALIDATE_STRIPE_PRICES=true
```

**Pros**:
- ✅ Validation passes (staging prices exist in test account)
- ✅ Catches configuration errors
- ✅ Matches test key with test prices

**Cons**:
- ⚠️ Requires staging price IDs to exist in your Stripe dashboard
- ⚠️ Need to verify `STRIPE_*_ID_STAGING` constants are correct

**Verification needed**:
```bash
# Check if staging prices exist in your test account
stripe prices list --limit 30
# Look for price_1RIG*, price_1RIK*, etc.
```

---

### Option 3: Create Local Price IDs (Advanced)

**Add to `backend/core/utils/config.py`:**
```python
# Local development price IDs (in your test account)
STRIPE_TIER_2_20_ID_LOCAL: str = 'price_YOUR_TEST_PRICE_ID'
# ... create test prices for each tier

@property
def STRIPE_TIER_2_20_ID(self) -> str:
    if self.ENV_MODE == EnvMode.LOCAL:
        return self.STRIPE_TIER_2_20_ID_LOCAL  # ← New
    if self.ENV_MODE == EnvMode.STAGING:
        return self.STRIPE_TIER_2_20_ID_STAGING
    return self.STRIPE_TIER_2_20_ID_PROD
```

**Pros**:
- ✅ Full validation in local development
- ✅ Isolated from production/staging
- ✅ Can test full billing flow locally

**Cons**:
- ❌ Requires creating 24 test prices in Stripe dashboard
- ❌ Maintenance overhead (3 sets of price IDs to manage)
- ❌ Code changes required

---

### Option 4: Conditional Validation (Smart Approach)

**Change in `backend/core/utils/config.py`:**
```python
# Around line 461
if self.VALIDATE_STRIPE_PRICES and self.STRIPE_SECRET_KEY:
    # Only validate if key matches environment
    is_test_key = self.STRIPE_SECRET_KEY.startswith('sk_test_')
    should_validate = (
        (self.ENV_MODE == EnvMode.PRODUCTION and not is_test_key) or
        (self.ENV_MODE in [EnvMode.STAGING, EnvMode.LOCAL] and is_test_key)
    )
    
    if should_validate:
        try:
            self._validate_stripe_prices()
        except Exception as e:
            # ... existing error handling
    else:
        logger.info(f"Skipping Stripe validation: key type mismatch (env={self.ENV_MODE.value}, test_key={is_test_key})")
```

**Pros**:
- ✅ Auto-detects environment mismatch
- ✅ Prevents validation errors
- ✅ Provides helpful log message
- ✅ Works for all developers automatically

**Cons**:
- ⚠️ Requires code change
- ⚠️ Silent skip might hide configuration issues

---

## Recommendation

For **immediate local development**, use **Option 1**:
```bash
VALIDATE_STRIPE_PRICES=false
```

For **proper long-term setup**, use **Option 2**:
```bash
ENV_MODE=staging  # Switch to staging environment
```

For **production-like local testing**, use **Option 4** (implement smart validation).

---

## Related Files

### Configuration
- `backend/.env` - Environment variables (line 78: `VALIDATE_STRIPE_PRICES=true`)
- `backend/core/utils/config.py` - Configuration class (lines 46-103: price IDs, lines 517-593: validation)

### Billing Logic
- `backend/core/billing/config.py` - Tier definitions (lines 28-134: TIERS dict)
- `backend/core/billing/subscription_service.py` - Subscription creation
- `backend/core/billing/payment_service.py` - Payment processing
- `backend/core/billing/webhook_service.py` - Stripe webhooks

### Frontend
- `frontend/src/lib/config.ts` - Frontend price ID config (mirrors backend)

---

## Testing the Fix

After applying **Option 1** (disable validation):

```bash
# 1. Update .env
echo "VALIDATE_STRIPE_PRICES=false" >> backend/.env

# 2. Restart backend
cd backend
uv run api.py
# Should see: No more "Invalid or inaccessible Stripe price ID" warnings

# 3. Restart workers
uv run dramatiq --processes 4 --threads 4 run_agent_background
# Should see: Clean startup with only missing API key warnings
```

After applying **Option 2** (use staging):

```bash
# 1. Update .env
sed -i '' 's/ENV_MODE=production/ENV_MODE=staging/' backend/.env

# 2. Verify staging prices exist
stripe prices list --limit 30 | grep "price_1RIG"

# 3. Restart backend and check logs
cd backend
uv run api.py
# Should see: "Stripe price validation summary: validated=24, errors=0"
```

---

## Next Steps

1. **Choose a solution** based on your use case
2. **Update `backend/.env`** with chosen configuration
3. **Restart backend services** to clear logs
4. **Update `BACKEND_FIXES_SUMMARY.md`** with section 6
5. **(Optional) Create staging prices** in Stripe dashboard if using Option 2
6. **(Future) Implement Option 4** for automatic environment detection

---

## Additional Notes

### Why ENV_MODE=production in Local Dev?

Looking at your `.env`, it appears you're using production mode locally to test against the production database schema. This is common when:
- Developing features that need production-like data
- Testing migrations before production deployment  
- Debugging production-specific issues

### Alternative: Multi-Environment Setup

Consider using multiple `.env` files:
```
backend/.env.local       → ENV_MODE=local, VALIDATE_STRIPE_PRICES=false
backend/.env.staging     → ENV_MODE=staging, staging price IDs
backend/.env.production  → ENV_MODE=production, live keys (never committed)
```

Load via: `export $(cat .env.local | xargs) && uv run api.py`

