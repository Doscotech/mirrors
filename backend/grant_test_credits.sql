-- Find and grant maximum credits to test@xera.cc
-- Run this in Supabase SQL Editor or via psql

-- Step 1: Find the account ID
SELECT 
    account_id, 
    email,
    'Found account for test@xera.cc' as status
FROM basejump.billing_customers 
WHERE email = 'test@xera.cc';

-- Step 2: Check current credit balance
SELECT 
    account_id,
    balance as current_balance,
    tier,
    trial_status
FROM credit_accounts
WHERE account_id = (
    SELECT account_id 
    FROM basejump.billing_customers 
    WHERE email = 'test@xera.cc'
    LIMIT 1
);

-- Step 3: Grant $1000 non-expiring credits
-- First, update the balance
UPDATE credit_accounts
SET balance = balance + 1000,
    lifetime_purchased = lifetime_purchased + 1000
WHERE account_id = (
    SELECT account_id 
    FROM basejump.billing_customers 
    WHERE email = 'test@xera.cc'
    LIMIT 1
)
RETURNING account_id, balance as new_balance, tier;

-- Step 4: Add ledger entry
INSERT INTO credit_ledger (
    account_id,
    amount,
    balance_after,
    type,
    description,
    is_expiring,
    created_at
)
SELECT 
    ca.account_id,
    1000,
    ca.balance,
    'admin_grant',
    'Test account - Maximum credits grant (via SQL)',
    false,
    NOW()
FROM credit_accounts ca
WHERE ca.account_id = (
    SELECT account_id 
    FROM basejump.billing_customers 
    WHERE email = 'test@xera.cc'
    LIMIT 1
)
RETURNING account_id, amount, balance_after, description;

-- Step 5: Verify the update
SELECT 
    ca.account_id,
    bc.email,
    ca.balance as total_balance,
    ca.tier,
    ca.trial_status,
    ca.lifetime_purchased,
    ca.lifetime_used
FROM credit_accounts ca
JOIN basejump.billing_customers bc ON bc.account_id = ca.account_id
WHERE bc.email = 'test@xera.cc';
