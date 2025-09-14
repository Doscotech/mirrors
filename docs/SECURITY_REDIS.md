# Redis Security Hardening

This document explains how to secure the Redis instance used by this project for production deployments and how to remediate a public exposure finding (e.g. DigitalOcean / Shadowserver scan reporting TCP/6379 open to the Internet).

## 1. Understand the Risk
If Redis is reachable from the public Internet and no ACL/password/TLS is enforced, anyone can:
- Read/write application cache or pub/sub channels
- Potentially craft data that misleads workers / background tasks
- Exhaust memory or cause eviction policies to purge legitimate data

Redis should be considered an internal infrastructure component—expose it only to trusted private networks or localhost.

## 2. Immediate Containment Checklist (Run Now)
1. Add a firewall rule (cloud firewall / iptables / ufw) to restrict 6379 to trusted sources only (e.g. your app servers, VPN jumpbox).
2. Add a password (requirepass / ACL) and rotate environment variables / secrets for all services.
3. Restart dependent services to pick up the new credentials.
4. Audit logs (if any) or enable basic monitoring to look for abnormal command volume since exposure.

## 3. Docker / Compose Configuration Changes
Prior versions of the compose file exposed Redis via `"6379:6379"`. The default compose in this repo now omits any host port mapping for Redis. For production you have options:
- Remove the port mapping entirely (containers resolve `redis` on the internal Docker network)
- Or bind only to localhost: `"127.0.0.1:6379:6379"` if colocated services need host access
- Or use a private overlay network / VPC bridge with no host publishing.

Example hardened service in `docker-compose.yaml` (showing how you would expose only to localhost if really needed):
```yaml
  redis:
    image: redis:7-alpine
    # REMOVE or restrict host exposure in production
    # ports:
    #   - "6379:6379"          # Comment out to prevent public exposure
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
    volumes:
      - redis_data:/data
      - ./backend/services/docker/redis.conf:/usr/local/etc/redis/redis.conf:ro
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "$REDIS_PASSWORD", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
```

## 4. Secure redis.conf
Create / extend `backend/services/docker/redis.conf`:
```conf
bind 127.0.0.1 ::1
# If using Docker internal networking only, you can also bind 0.0.0.0 but rely on *no* published host port + firewall
protected-mode yes
port 6379
# Require auth (classic)
requirepass ${REDIS_PASSWORD}
# Or preferably ACLs (Redis 6+):
# aclfile /usr/local/etc/redis/users.acl
# rename potentially dangerous commands (optional defense-in-depth)
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command SHUTDOWN ""
# Persistence policies as needed
save 60 1000
appendonly yes
```

If you use ACLs, generate a file like:
```text
user default on >${REDIS_PASSWORD} allcommands allkeys
```
Mount it via volume and reference with `aclfile` directive.

## 5. Add Environment Variable & Strong Secret
In deployment secrets / `.env` (never commit real secrets):
```
REDIS_PASSWORD=change_to_strong_random_value
```
Rotate regularly and after exposure concerns.

## 6. Update Application Configuration
Confirm services read password:
- `backend/services/redis.py` uses `REDIS_PASSWORD` (empty now). Set it.
- Compose `environment:` already has `REDIS_PASSWORD=` — populate via env/secret.

Ensure code passes password in connection pool (already supported). No app code changes required beyond setting env var.

## 7. TLS (Optional Advanced)
If deploying across untrusted networks (different hosts, public routing):
- Place Redis behind stunnel or use Redis with TLS build (e.g. `redis:7-alpine` compiled with TLS support, or use `bitnami/redis` with `ALLOW_EMPTY_PASSWORD=no`).
- Terminate with NGINX stream proxy + mutual mTLS for highest assurance.

## 8. Firewalling
DigitalOcean Cloud Firewall (example):
- Inbound rule: TCP 6379 allow from droplet tags `app-backend`, `app-worker`
- Deny all others (implicit)

UFW host example:
```bash
ufw deny 6379/tcp
ufw allow from 10.116.0.0/16 to any port 6379 proto tcp   # your private VPC range
```

Iptables example snippet:
```bash
iptables -A INPUT -p tcp --dport 6379 -s 10.116.0.0/16 -j ACCEPT
iptables -A INPUT -p tcp --dport 6379 -j DROP
```

## 9. Validation Steps
1. Run: `telnet <host> 6379` (should fail / timeout externally)
2. Inside an allowed container: `redis-cli -a $REDIS_PASSWORD ping` returns `PONG`
3. From disallowed source: connection refused or hangs.
4. Check logs: no unauthenticated commands post-change.

## 10. Incident Review (If Exposure Confirmed)
- Rotate all API keys / secrets potentially cached in Redis.
- Invalidate any session or token material stored there.
- Review unusual memory spikes (`INFO memory`) and keyspace stats.
- Consider flush ONLY if data poisoning suspected (rare; disruptive).

## 11. Ongoing Monitoring
- Enable `INFO` scraping via metrics (Prometheus exporter). Alert on:
  - Connected clients surge
  - Evictions
  - Keyspace hits ratio dropping
- Periodic security scan to confirm port not exposed

## 12. Quick Hardening Script (Illustrative)
```bash
#!/usr/bin/env bash
set -euo pipefail
if [[ -z "${REDIS_PASSWORD:-}" ]]; then echo "Set REDIS_PASSWORD env"; exit 1; fi
cat > backend/services/docker/redis.conf <<'CONF'
bind 127.0.0.1 ::1
protected-mode yes
port 6379
requirepass ${REDIS_PASSWORD}
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command SHUTDOWN ""
save 60 1000
appendonly yes
CONF
echo "Redis hardening file written. Remove host port exposure & restart." 
```
(Adjust for production; template uses literal variable expansion only if processed through envsubst.)

## 13. Summary Checklist
- [ ] Remove/limit host port mapping for Redis
- [ ] Add password or ACLs
- [ ] Enable protected mode & bind loopback (or private network only)
- [ ] Firewall restrict 6379
- [ ] Optional: command renames & TLS
- [ ] Validate external access blocked
- [ ] Rotate cached sensitive data if exposure suspected

---
If you intentionally run a public Redis (rarely justified), document justification and comp controls (auth + TLS + network ACL). Otherwise treat public exposure as misconfiguration.
