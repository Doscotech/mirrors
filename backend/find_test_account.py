#!/usr/bin/env python
"""Find test@xera.cc account ID"""
import asyncio
from core.services.supabase import DBConnection

async def find_user():
    db = DBConnection()
    client = await db.client
    
    # Search in basejump billing_customers
    result = await client.schema('basejump').from_('billing_customers').select('account_id, email').eq('email', 'test@xera.cc').execute()
    
    if result.data:
        print(f'Account ID: {result.data[0]["account_id"]}')
        print(f'Email: {result.data[0]["email"]}')
        return result.data[0]["account_id"]
    else:
        print('Account not found in billing_customers, checking auth.users...')
        # Try rpc to get user by email
        try:
            auth_result = await client.rpc('get_account_by_email', {'p_email': 'test@xera.cc'}).execute()
            if auth_result.data:
                print(f'Found: {auth_result.data}')
                return auth_result.data
        except Exception as e:
            print(f'RPC failed: {e}')
    
    return None

if __name__ == '__main__':
    account_id = asyncio.run(find_user())
    if account_id:
        print(f'\n✅ Use this account ID: {account_id}')
    else:
        print('\n❌ Account not found. Please provide the account ID manually.')
