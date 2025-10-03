#!/usr/bin/env python3
"""
Check if trial-related migrations are applied to the database.
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    print("❌ Missing SUPABASE_URL")
    sys.exit(1)

# Extract project ref from URL
# Format: https://PROJECT_REF.supabase.co
project_ref = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "")

# Construct database URL
# For Supabase: postgresql://postgres:[YOUR-PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres
print(f"📍 Project: {project_ref}")
print("\n🔐 To check migrations, you'll need the database password.")
print(f"   You can find it in your Supabase dashboard under Project Settings > Database")
print(f"\n   Or run this command with your DB password:")
print(f"   PGPASSWORD=<your-password> psql -h db.{project_ref}.supabase.co -U postgres -d postgres -c \"\\d credit_accounts\"")
print(f"\n   To check trial_history table:")
print(f"   PGPASSWORD=<your-password> psql -h db.{project_ref}.supabase.co -U postgres -d postgres -c \"\\d trial_history\"")
print("\n💡 Alternatively, you can use the Supabase CLI:")
print(f"   cd /Users/macbookpro/mirrors/backend")
print(f"   supabase link --project-ref {project_ref}")
print(f"   supabase db pull  # This will show you the current schema")
