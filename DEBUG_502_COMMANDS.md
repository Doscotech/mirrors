# Debug Commands - Run These NOW

## 1. Check if containers are actually running
```bash
docker-compose ps
```

**Expected output:** Both `frontend` and `backend` should show "Up" status

If they're not running:
```bash
docker-compose up -d
```

## 2. Check if frontend is responding on port 3000
```bash
curl -I http://localhost:3000
```

**Expected:** Should return HTTP 200 or 3xx, not connection refused

## 3. Check if the auth callback route works locally
```bash
curl -v http://localhost:3000/auth/callback?code=test123
```

**Expected:** Should return a redirect (3xx), not an error

## 4. Check nginx error logs RIGHT NOW (in real-time)
```bash
sudo tail -f /var/log/nginx/xera.cc-error.log
```

**Then try logging in again and watch what error appears**

## 5. Check if nginx config was actually reloaded
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 6. If nginx test fails, check the main nginx.conf
```bash
sudo nano /etc/nginx/nginx.conf
```

**Add these lines in the `http` block (NOT in server block):**
```nginx
http {
    # ... existing config ...
    
    # Add these for large headers
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    large_client_header_buffers 4 32k;
    
    # ... rest of config ...
}
```

## 7. Check Docker logs for frontend errors
```bash
docker-compose logs -f frontend
```

**Look for errors when you try to access /auth/callback**

## 8. Nuclear option - Full restart
```bash
# Restart everything
docker-compose restart
sudo systemctl restart nginx

# Wait 10 seconds
sleep 10

# Check status
docker-compose ps
sudo systemctl status nginx
```

## 9. Verify environment variable
```bash
cat frontend/.env.local | grep NEXT_PUBLIC_URL
```

**Should be:** `NEXT_PUBLIC_URL=https://xera.cc`

## 10. Test direct connection (bypass nginx)
```bash
# Forward port 3000 to your local machine, then visit:
# http://YOUR_SERVER_IP:3000/auth/callback?code=test
```

If this works but nginx doesn't, it's definitely an nginx config issue.

---

## Most Likely Issues (in order):

### Issue 1: Frontend container is not running
```bash
docker-compose ps
# If frontend is down:
docker-compose up -d frontend
docker-compose logs -f frontend
```

### Issue 2: Nginx config wasn't reloaded properly
```bash
sudo systemctl restart nginx  # Use restart, not reload
```

### Issue 3: Buffer settings in wrong location
The buffer settings need to be in BOTH:
- Main nginx.conf (http block)
- Site config (server block)

### Issue 4: Next.js app is crashing on auth callback
```bash
docker-compose logs frontend | grep -i error
```

---

## Quick Test Script - Copy and run this:

```bash
#!/bin/bash
echo "=== Testing xera.cc setup ==="
echo ""
echo "1. Docker containers:"
docker-compose ps
echo ""
echo "2. Frontend health:"
curl -I http://localhost:3000 2>&1 | head -5
echo ""
echo "3. Auth callback test:"
curl -I http://localhost:3000/auth/callback?code=test 2>&1 | head -5
echo ""
echo "4. Nginx status:"
sudo systemctl status nginx | head -10
echo ""
echo "5. Latest nginx errors:"
sudo tail -20 /var/log/nginx/xera.cc-error.log
echo ""
echo "6. Latest frontend logs:"
docker-compose logs --tail=20 frontend
```

Save this as `debug.sh`, run `chmod +x debug.sh`, then `./debug.sh`

Send me the output!
