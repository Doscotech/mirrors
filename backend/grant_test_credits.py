#!/usr/bin/env python
"""
Grant maximum credits to test@xera.cc account
Usage: python grant_test_credits.py <account_id>
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_grant():
    import asyncio
    from core.billing.credit_manager import credit_manager
    from decimal import Decimal
    from datetime import datetime, timezone, timedelta
    
    # Check for account ID argument
    if len(sys.argv) < 2:
        print("❌ Usage: python grant_test_credits.py <account_id>")
        print("\nTo find the account ID for test@xera.cc, run:")
        print("  psql <your-db-url> -c \"SELECT account_id, email FROM basejump.billing_customers WHERE email='test@xera.cc';\"")
        print("\nOr from Supabase SQL editor:")
        print("  SELECT account_id, email FROM basejump.billing_customers WHERE email='test@xera.cc';")
        sys.exit(1)
    
    account_id = sys.argv[1]
    
    async def grant_credits():
        print(f"🎁 Granting maximum credits to account: {account_id}")
        print(f"   Email: test@xera.cc")
        print(f"   Amount: $1000 (non-expiring)")
        
        try:
            result = await credit_manager.add_credits(
                account_id=account_id,
                amount=Decimal('1000'),
                is_expiring=False,
                description="Test account - Maximum credits grant",
                type='admin_grant'
            )
            
            if result.get('duplicate_prevented'):
                balance_info = await credit_manager.get_balance(account_id)
                new_balance = balance_info.get('total', 0)
                print(f"\n⚠️  Duplicate prevented - credits already granted")
                print(f"✅ Current balance: ${new_balance}")
            else:
                new_balance = result.get('total_balance', 0)
                print(f"\n✅ Credits granted successfully!")
                print(f"💰 New balance: ${new_balance}")
                print(f"⏰ Expiring: No (permanent credits)")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error granting credits: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    success = asyncio.run(grant_credits())
    if success:
        print("\n🎉 Done! The test account now has maximum credits.")
    else:
        print("\n❌ Failed to grant credits. Check the error above.")
        sys.exit(1)

if __name__ == '__main__':
    run_grant()
