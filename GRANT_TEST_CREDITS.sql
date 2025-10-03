-- Quick script to find and grant credits to test@xera.cc
-- Copy this entire script and run it in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/mngxeznzvdwckclwspcn/sql/new

-- Step 1: Find the account
DO $$
DECLARE
    v_account_id UUID;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Get account ID
    SELECT account_id INTO v_account_id
    FROM basejump.billing_customers 
    WHERE email = 'test@xera.cc'
    LIMIT 1;
    
    IF v_account_id IS NULL THEN
        RAISE NOTICE '❌ Account not found for test@xera.cc';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Found account: %', v_account_id;
    
    -- Get current balance
    SELECT balance INTO v_current_balance
    FROM credit_accounts
    WHERE account_id = v_account_id;
    
    RAISE NOTICE '💰 Current balance: $%', v_current_balance;
    
    -- Grant $1000
    UPDATE credit_accounts
    SET 
        balance = balance + 1000,
        lifetime_purchased = lifetime_purchased + 1000
    WHERE account_id = v_account_id
    RETURNING balance INTO v_new_balance;
    
    RAISE NOTICE '💸 Granted $1000';
    RAISE NOTICE '💰 New balance: $%', v_new_balance;
    
    -- Add ledger entry
    INSERT INTO credit_ledger (
        account_id,
        amount,
        balance_after,
        type,
        description,
        is_expiring,
        created_at
    ) VALUES (
        v_account_id,
        1000,
        v_new_balance,
        'admin_grant',
        'Test account - Maximum credits grant',
        false,
        NOW()
    );
    
    RAISE NOTICE '📝 Ledger entry created';
    RAISE NOTICE '✨ Done! Account now has $% in credits', v_new_balance;
END $$;

-- Verify the result
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
