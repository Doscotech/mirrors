# Quick Guide: Grant Credits to test@xera.cc

## ✅ Easiest Method: Use Supabase SQL Editor

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/mngxeznzvdwckclwspcn/sql/new
   ```

2. **Copy and paste the entire contents of:**
   ```
   GRANT_TEST_CREDITS.sql
   ```

3. **Click "Run"**

4. **Check the output** - You should see:
   ```
   ✅ Found account: <account-id>
   💰 Current balance: $X
   💸 Granted $1000
   💰 New balance: $X+1000
   📝 Ledger entry created
   ✨ Done! Account now has $X+1000 in credits
   ```

5. **Verify** - The result table at the bottom will show the updated account details

## That's it! 🎉

The script will:
- ✅ Find the account ID automatically
- ✅ Show current balance
- ✅ Grant $1000 non-expiring credits
- ✅ Add proper ledger entry
- ✅ Display verification results

## Alternative: If you want to see the account ID first

Run this query first in Supabase SQL Editor:
```sql
SELECT account_id, email, created_at 
FROM basejump.billing_customers 
WHERE email = 'test@xera.cc';
```

Then you can use the Python script:
```bash
cd backend
python grant_test_credits.py <account-id>
```

## Already Granted?

If you run the script again, it will just add another $1000. To check current balance first:
```sql
SELECT 
    bc.email,
    ca.balance,
    ca.lifetime_purchased
FROM credit_accounts ca
JOIN basejump.billing_customers bc ON bc.account_id = ca.account_id
WHERE bc.email = 'test@xera.cc';
```
