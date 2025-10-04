#!/bin/bash

echo "=========================================="
echo "PRODUCTION SERVER VERIFICATION"
echo "=========================================="
echo ""

# Test the trial endpoint
echo "1. Testing trial endpoint (should exist if deployed):"
echo "   POST https://xera.cc/api/billing/trial/start-without-payment"
echo ""
curl -X POST https://xera.cc/api/billing/trial/start-without-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "Request failed"

echo ""
echo "=========================================="
echo ""

# Check if the endpoint exists by looking at available routes
echo "2. Testing base API endpoint:"
echo "   GET https://xera.cc/api/"
echo ""
curl -X GET https://xera.cc/api/ \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "Request failed"

echo ""
echo "=========================================="
echo ""

# Check backend version/health
echo "3. Checking backend health:"
echo "   GET https://xera.cc/health"
echo ""
curl -X GET https://xera.cc/health \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "Request failed"

echo ""
echo "=========================================="
echo ""

# Check what git commit is deployed
echo "4. LOCAL GIT STATUS:"
echo ""
echo "Current branch:"
git branch --show-current

echo ""
echo "Latest local commit:"
git log --oneline -1

echo ""
echo "Latest commit on origin/main:"
git log origin/main --oneline -1

echo ""
echo "Latest commit on upstream/main:"
git log upstream/main --oneline -1

echo ""
echo "Latest commit on upstream/PRODUCTION:"
git log upstream/PRODUCTION --oneline -1

echo ""
echo "=========================================="
echo ""

# Check if our changes exist in different branches
echo "5. CHECKING IF TRIAL ENDPOINT EXISTS IN BRANCHES:"
echo ""

echo "Local (current branch):"
grep -q "start-without-payment" backend/core/billing/api.py && echo "✅ EXISTS" || echo "❌ NOT FOUND"

echo ""
echo "origin/main:"
git show origin/main:backend/core/billing/api.py 2>/dev/null | grep -q "start-without-payment" && echo "✅ EXISTS" || echo "❌ NOT FOUND"

echo ""
echo "upstream/main:"
git show upstream/main:backend/core/billing/api.py 2>/dev/null | grep -q "start-without-payment" && echo "✅ EXISTS" || echo "❌ NOT FOUND"

echo ""
echo "upstream/PRODUCTION:"
git show upstream/PRODUCTION:backend/core/billing/api.py 2>/dev/null | grep -q "start-without-payment" && echo "✅ EXISTS" || echo "❌ NOT FOUND"

echo ""
echo "=========================================="
echo ""

echo "6. DEPLOYMENT SOURCE CHECK:"
echo ""
echo "Question: Where does xera.cc deploy from?"
echo "Options:"
echo "  A) Doscotech/mirrors (your fork)"
echo "  B) kortix-ai/suna upstream/main"
echo "  C) kortix-ai/suna upstream/PRODUCTION"
echo ""
echo "To find out, check:"
echo "  - GitHub Actions in the repository"
echo "  - Deployment configuration (Vercel/Railway/Docker)"
echo "  - Or ask the team"
echo ""

echo "=========================================="
echo ""

echo "7. NEXT STEPS:"
echo ""
echo "If trial endpoint NOT in production:"
echo "  → Need to merge your changes to the branch that deploys to xera.cc"
echo ""
echo "If trial endpoint EXISTS in production but getting 404:"
echo "  → Backend might not be running or routing is misconfigured"
echo ""
echo "If endpoint returns 403:"
echo "  → Endpoint works! User already used trial (expected behavior)"
echo ""
