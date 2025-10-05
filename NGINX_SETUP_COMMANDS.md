# Nginx Setup Commands for xera.cc

## 1. Check Current Nginx Status

```bash
# Check if nginx is running
sudo systemctl status nginx

# Check nginx configuration for errors
sudo nginx -t

# View nginx error logs
sudo tail -f /var/log/nginx/error.log

# View nginx access logs
sudo tail -f /var/log/nginx/access.log
```

## 2. Create/Update Nginx Configuration for xera.cc

```bash
# Create or edit the site configuration
sudo nano /etc/nginx/sites-available/xera.cc
```

## 3. Recommended Nginx Configuration

Paste this into `/etc/nginx/sites-available/xera.cc`:

```nginx
upstream frontend {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream backend {
    server 127.0.0.1:8000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name xera.cc www.xera.cc;
    
    return 301 https://$host$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name xera.cc www.xera.cc;

    # SSL Configuration (adjust paths to your certificates)
    ssl_certificate /etc/letsencrypt/live/xera.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xera.cc/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Increase client body size for file uploads
    client_max_body_size 100M;
    
    # Fix for "upstream sent too big header" error (Supabase auth cookies)
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    large_client_header_buffers 4 32k;
    
    # Timeout settings
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
    send_timeout 600s;

    # Logging
    access_log /var/log/nginx/xera.cc-access.log;
    error_log /var/log/nginx/xera.cc-error.log;

    # Backend API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Disable buffering for SSE/streaming
        proxy_buffering off;
        proxy_cache off;
    }

    # Auth callback route - critical for OAuth
    location /auth/callback {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    # All other routes - Next.js frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Next.js specific
        proxy_redirect off;
        proxy_buffering off;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 4. Enable the Site Configuration

```bash
# Remove old symlink if exists
sudo rm -f /etc/nginx/sites-enabled/xera.cc

# Create new symlink
sudo ln -s /etc/nginx/sites-available/xera.cc /etc/nginx/sites-enabled/

# Remove default site if it's interfering
sudo rm -f /etc/nginx/sites-enabled/default
```

## 5. Test and Reload Nginx

```bash
# Test configuration for syntax errors
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Or restart if reload doesn't work
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## 6. Verify Services Are Running

```bash
# Check if frontend (Next.js) is running on port 3000
curl http://localhost:3000

# Check if backend (API) is running on port 8000
curl http://localhost:8000/api/health

# Check from outside (should work after nginx is configured)
curl https://xera.cc/health
```

## 7. Check Docker Services

```bash
# Navigate to your project directory
cd /path/to/mirrors

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart if needed
docker-compose restart frontend
docker-compose restart backend
```

## 8. Debug 502 Errors

If you still get 502 errors:

```bash
# Check nginx error logs in real-time
sudo tail -f /var/log/nginx/error.log

# Check if upstream is accessible
curl -v http://localhost:3000/auth/callback?code=test

# Check SELinux (if enabled)
sudo getenforce
# If it says "Enforcing", you might need to allow nginx to connect:
sudo setsebool -P httpd_can_network_connect 1

# Check firewall
sudo ufw status
sudo ufw allow 'Nginx Full'
```

## 9. Supabase Configuration

Make sure in your Supabase project settings:

```bash
# Go to: Authentication > URL Configuration
# Add these redirect URLs:
https://xera.cc/auth/callback
https://www.xera.cc/auth/callback
http://localhost:3000/auth/callback (for local dev)
```

## 10. Environment Variables Check

```bash
# Check frontend environment variables
cat frontend/.env.local | grep NEXT_PUBLIC_URL

# Should be:
# NEXT_PUBLIC_URL=https://xera.cc
```

## Quick Fix Commands (Run These First)

```bash
# 1. Test nginx config
sudo nginx -t

# 2. Check if services are running
docker-compose ps

# 3. Restart everything
docker-compose restart
sudo systemctl restart nginx

# 4. Watch logs for errors
sudo tail -f /var/log/nginx/error.log &
docker-compose logs -f frontend &
```

## Common Issues and Solutions

### Issue 1: "Connection refused" in nginx logs
**Solution:** Frontend container is not running or not accessible
```bash
docker-compose up -d frontend
netstat -tulpn | grep 3000
```

### Issue 2: "upstream timed out"
**Solution:** Increase timeout values in nginx config (already included above)

### Issue 3: SSL certificate errors
**Solution:** Generate/renew Let's Encrypt certificate
```bash
sudo certbot --nginx -d xera.cc -d www.xera.cc
```

### Issue 4: Port already in use
**Solution:** Kill the process using the port
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

## QUICK FIX FOR "upstream sent too big header" ERROR:

**This is your exact issue!** Run these commands:

```bash
# 1. Edit your nginx config
sudo nano /etc/nginx/sites-available/xera.cc

# 2. Add these lines INSIDE the server block (after ssl configuration):
# 
#     proxy_buffer_size 128k;
#     proxy_buffers 4 256k;
#     proxy_busy_buffers_size 256k;
#     large_client_header_buffers 4 32k;

# 3. Test the config
sudo nginx -t

# 4. Reload nginx
sudo systemctl reload nginx

# 5. Test auth again
# The error should be gone!
```

---

## Run These Commands in Order:

```bash
# 1. Create nginx config (copy the config above into this file)
sudo nano /etc/nginx/sites-available/xera.cc

# 2. Enable it
sudo ln -sf /etc/nginx/sites-available/xera.cc /etc/nginx/sites-enabled/

# 3. Test nginx
sudo nginx -t

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Check docker services
cd /path/to/mirrors
docker-compose ps

# 6. If containers are down, start them
docker-compose up -d

# 7. Monitor logs
sudo tail -f /var/log/nginx/error.log
```
