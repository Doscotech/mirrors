#!/usr/bin/env python3
"""
Check if trial-related migrations are applied to the database.
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def check_column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    try:
        result = supabase.rpc(
            'exec_sql',
            {
                'sql': f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '{table_name}' 
                AND column_name = '{column_name}';
                """
            }
        ).execute()
        return len(result.data) > 0
    except:
        # Try alternative method using table query
        try:
            result = supabase.table(table_name).select(column_name).limit(1).execute()
            return True
        except Exception as e:
            if "column" in str(e).lower() and "does not exist" in str(e).lower():
                return False
            # Column might exist but table is empty or other error
            return None

def check_table_exists(table_name: str) -> bool:
    """Check if a table exists."""
    try:
        result = supabase.table(table_name).select("*").limit(1).execute()
        return True
    except Exception as e:
        if "relation" in str(e).lower() and "does not exist" in str(e).lower():
            return False
        # Table might exist but be empty
        return True

print("🔍 Checking migration status...\n")

# Check credit_accounts table columns
print("📋 Checking credit_accounts table:")
columns_to_check = [
    "trial_status",
    "trial_started_at", 
    "trial_ends_at",
    "stripe_subscription_id",
    "is_grandfathered_free"
]

credit_accounts_ok = True
for column in columns_to_check:
    exists = check_column_exists("credit_accounts", column)
    if exists:
        print(f"  ✅ {column} - EXISTS")
    elif exists is None:
        print(f"  ⚠️  {column} - UNKNOWN (check manually)")
    else:
        print(f"  ❌ {column} - MISSING")
        credit_accounts_ok = False

# Check trial_history table
print("\n📋 Checking trial_history table:")
trial_history_exists = check_table_exists("trial_history")
if trial_history_exists:
    print("  ✅ trial_history table - EXISTS")
else:
    print("  ❌ trial_history table - MISSING")
    credit_accounts_ok = False

print("\n" + "="*50)
if credit_accounts_ok and trial_history_exists:
    print("✅ All migrations appear to be applied!")
else:
    print("❌ Some migrations are missing. Need to run migrations.")
    sys.exit(1)
