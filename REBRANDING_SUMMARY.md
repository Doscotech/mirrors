# Frontend Rebranding & Test Account Setup

## ✅ Completed Changes

### User-Facing Text Updates (Suna/Kortix → Xera)

The following user-visible text has been updated from "Suna" and "Kortix" to "Xera":

1. **Trial Activation Page** (`frontend/src/app/activate-trial/page.tsx`)
   - ✅ "Welcome to Suna" → "Welcome to Xera"

2. **Subscription Page** (`frontend/src/app/subscription/page.tsx`)
   - ✅ "using Suna AI" → "using Xera"
   - ✅ "using Suna" → "using Xera"
   - ✅ support@kortix.ai → support@xera.cc

3. **Onboarding** (`frontend/src/components/onboarding/steps/user-type-step.tsx`)
   - ✅ "Welcome to Kortix" → "Welcome to Xera"

4. **Agent Cards** (`frontend/src/components/ui/unified-agent-card.tsx`)
   - ✅ "Kortix" badge → "Xera" badge

### Not Changed (Internal/Technical References)

The following were intentionally left unchanged as they are internal code references, not user-facing:
- Variable names: `isSunaAgent`, `is_suna_default`, `isSunaDefault`, `is_kortix_team`
- Component names: `KortixLogo`, `KortixEnterpriseModal`
- File names and imports
- localStorage keys: `suna_upgrade_dialog_displayed`, `suna-model-selection-v3`
- Database field names
- API endpoints
- Environment variables: `KORTIX_ADMIN_API_KEY`
- Function names: `installSunaForNewUser`, `checkAndInstallSunaAgent`

These are fine to keep as-is since users never see them. Changing these would require extensive refactoring across the codebase.

## 💳 Grant Credits to test@xera.cc

You have **3 options** to grant maximum credits:

### Option 1: SQL Script (Fastest ⚡)

Run this in your Supabase SQL Editor:

```bash
# Open the file
cat backend/grant_test_credits.sql
```

Then copy and paste into Supabase SQL editor. This will:
1. Find the account ID
2. Check current balance
3. Grant $1000 non-expiring credits
4. Add ledger entry
5. Verify the update

### Option 2: Python Script

**First, find the account ID:**
```bash
# Via Supabase SQL editor:
SELECT account_id, email FROM basejump.billing_customers WHERE email='test@xera.cc';

# Or via psql:
psql <your-db-url> -c "SELECT account_id, email FROM basejump.billing_customers WHERE email='test@xera.cc';"
```

**Then run the Python script:**
```bash
cd backend
python grant_test_credits.py <account-id-from-above>
```

### Option 3: Admin API Endpoint

If you have an admin JWT token:

```bash
# 1. Find the account ID
curl -X POST https://your-api.com/admin/users/search/advanced \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"email_contains": "test@xera.cc"}'

# 2. Grant credits
curl -X POST https://your-api.com/admin/billing/credits/grant \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "account_ids": ["ACCOUNT_ID_FROM_STEP_1"],
    "amount": 1000,
    "reason": "Test account - Maximum credits",
    "is_expiring": false,
    "notify_users": false
  }'
```

## 📋 Summary

### User-Facing Changes
- 6 text updates from Suna/Kortix → Xera
- 1 email update from kortix.ai → xera.cc
- All changes are in user-visible UI text only

### Test Account Setup
- Account: test@xera.cc
- Credits to grant: $1000 (non-expiring)
- Scripts created for easy credit granting
- Multiple options provided (SQL, Python, API)

## Next Steps

1. ✅ Test the frontend changes locally:
   ```bash
   cd frontend
   npm run dev
   ```

2. ⏭️ Grant credits to test@xera.cc using one of the 3 options above

3. ⏭️ Test the trial flow with the test account

4. ⏭️ If you want to change more references, we can do a more comprehensive rename of:
   - Component names (KortixLogo → XeraLogo)
   - Internal variable names
   - Database fields
   - But this is optional - the current changes cover all user-facing text

## Files Modified

```
frontend/src/app/activate-trial/page.tsx
frontend/src/app/subscription/page.tsx
frontend/src/components/onboarding/steps/user-type-step.tsx
frontend/src/components/ui/unified-agent-card.tsx
backend/grant_test_credits.py (new)
backend/grant_test_credits.sql (new)
```
