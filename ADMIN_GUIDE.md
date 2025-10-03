# Admin Account Management Guide

## Overview
You can manage user accounts, credits, and upgrades through the admin API endpoints located in `/backend/core/billing/admin.py` and `/backend/core/admin/users_admin.py`.

## ✅ Merge Conflicts - RESOLVED
Both remaining conflicts were "added by us" files (not in upstream):
- ✅ `backend/core/projects.py` - Resolved
- ✅ `backend/core/utils/scripts/create_live_prices.py` - Resolved

## How to Upgrade an Account to Pro

### Option 1: Grant Credits Directly (Recommended for Quick Upgrade)

**Endpoint:** `POST /admin/billing/credits/grant`

**Request:**
```json
{
  "account_ids": ["user-account-id-here"],
  "amount": 100,
  "reason": "Upgraded to Pro tier manually",
  "is_expiring": false,
  "notify_users": true
}
```

**Example cURL:**
```bash
curl -X POST https://your-api.com/admin/billing/credits/grant \
  -H "Authorization: Bearer YOUR_ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "account_ids": ["abc-123-def"],
    "amount": 100,
    "reason": "Manual Pro tier upgrade",
    "is_expiring": false,
    "notify_users": true
  }'
```

**Response:**
```json
{
  "results": [
    {
      "account_id": "abc-123-def",
      "success": true,
      "new_balance": 100.00
    }
  ],
  "summary": {
    "total_users": 1,
    "successful": 1,
    "failed": 0
  }
}
```

### Option 2: Adjust Individual User Credits

**Endpoint:** `POST /admin/billing/credits/adjust`

**Request:**
```json
{
  "account_id": "user-account-id-here",
  "amount": 100,
  "reason": "Pro tier upgrade",
  "is_expiring": false,
  "notify_user": true
}
```

**Notes:**
- Use positive amounts to add credits
- Use negative amounts to remove credits
- `is_expiring: false` gives non-expiring credits (good for upgrades)
- `is_expiring: true` gives credits that expire at end of billing cycle
- Adjustments over $1000 require `super_admin` role

### Option 3: Manual Tier Update (Advanced)

If you need to update the tier field directly in the database:

**Endpoint:** You'll need to use Supabase directly or create a custom endpoint

**SQL Command:**
```sql
UPDATE credit_accounts 
SET tier = 'tier_25_200'
WHERE account_id = 'user-account-id-here';
```

**Available Tier Values:**
- `free` - Free tier
- `tier_2_20` - 2h/$20 monthly
- `tier_6_50` - 6h/$50 monthly
- `tier_12_100` - 12h/$100 monthly
- `tier_25_200` - 25h/$200 monthly (Pro)
- `tier_50_400` - 50h/$400 monthly
- `tier_125_800` - 125h/$800 monthly
- `tier_200_1000` - 200h/$1000 monthly

## Finding User Account IDs

### Search by Email
**Endpoint:** `POST /admin/users/search/advanced`

**Request:**
```json
{
  "email_contains": "user@example.com",
  "page": 1,
  "page_size": 20
}
```

**Response:**
```json
{
  "items": [
    {
      "id": "abc-123-def",
      "email": "user@example.com",
      "tier": "free",
      "credit_balance": 5.00,
      "trial_status": "active"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### List All Users
**Endpoint:** `GET /admin/users/list?page=1&page_size=20`

## Complete Pro Upgrade Workflow

1. **Find the user:**
```bash
curl -X POST https://your-api.com/admin/users/search/advanced \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"email_contains": "user@example.com"}'
```

2. **Grant Pro tier credits (e.g., $200):**
```bash
curl -X POST https://your-api.com/admin/billing/credits/grant \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "account_ids": ["USER_ID_FROM_STEP_1"],
    "amount": 200,
    "reason": "Manual upgrade to Pro tier (25h/$200)",
    "is_expiring": false,
    "notify_users": true
  }'
```

3. **Verify the change:**
```bash
curl -X GET https://your-api.com/admin/billing/user/USER_ID/summary \
  -H "Authorization: Bearer ADMIN_JWT"
```

## Authentication Requirements

All admin endpoints require authentication with either:
- **`require_admin`** - For standard admin operations (credit adjustments under $1000)
- **`require_super_admin`** - For sensitive operations (large adjustments, refunds)

Your JWT token must have the appropriate role in the claims.

## Admin API Endpoints Summary

### Billing Admin (`/admin/billing`)
- `POST /credits/adjust` - Add/remove credits for a single user
- `POST /credits/grant` - Grant credits to multiple users at once
- `POST /refund` - Process refunds (with optional Stripe refund)
- `GET /user/{account_id}/summary` - Get detailed user credit summary
- `GET /stats` - Get billing system statistics

### Users Admin (`/admin/users`)
- `GET /list` - List all users with pagination
- `POST /search/advanced` - Advanced user search with filters
- `GET /{account_id}/detail` - Get detailed user information
- `POST /credits/adjust` - Adjust user credits (also available here)

## Examples of Common Tasks

### Give someone a free Pro account for a month
```json
{
  "account_ids": ["user-id"],
  "amount": 200,
  "reason": "Promotional Pro tier - 1 month free",
  "is_expiring": true,
  "notify_users": true
}
```

### Give permanent Pro credits
```json
{
  "account_ids": ["user-id"],
  "amount": 200,
  "reason": "Permanent Pro upgrade",
  "is_expiring": false,
  "notify_users": true
}
```

### Refund a user
```json
{
  "account_id": "user-id",
  "amount": 50,
  "reason": "Service issue refund",
  "is_expiring": false,
  "stripe_refund": true,
  "payment_intent_id": "pi_xxxxx"
}
```

## Logging & Audit Trail

All admin actions are logged:
- Credit adjustments create entries in `credit_ledger` table with `admin_adjustment` type
- Actions are logged in `admin_audit_log` table
- All operations include the admin's account ID and reason

## Notes

- Non-expiring credits (`is_expiring: false`) don't reset monthly - best for permanent upgrades
- Expiring credits (`is_expiring: true`) expire at the end of the billing cycle - best for trials/promotions
- The `tier` field in `credit_accounts` is informational - actual credits control access
- Monthly subscription tiers automatically grant credits on renewal via Stripe webhooks
