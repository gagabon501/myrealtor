# Production Docker + Traefik Persistence Guide

**MyRealtor VPS – Post-Incident Hardening**

This document describes the **final, stable production configuration** for Traefik and the MyRealtor application stack, and the steps required to ensure the system **survives VPS reboots** without port conflicts, container restarts, or certificate issues.

---

## 1. Target Architecture (Authoritative)

This is the **expected and correct final architecture**:
Internet
|
| 80 / 443
|
Traefik (ONLY container with host ports)
|
Docker network: root_default (external)
|
| frontend (no host ports) |
| api (no host ports) |
| |
| mongo (internal-only network) |

---

**Rules:**

- ONLY Traefik binds `80:80` and `443:443`
- App containers **must never publish host ports**
- All public access flows through Traefik

---

## 2. Docker Restart Persistence

Ensure Docker and containerd always start on boot:

```bash
sudo systemctl enable docker
sudo systemctl enable containerd

Verify:

systemctl is-enabled docker
systemctl is-enabled containerd

Expected:

enabled

---
3. Deterministic Startup Order (Traefik FIRST)

Docker does not guarantee container startup order by default.

To prevent port conflicts and race conditions, we use a systemd unit to:

Start Traefik

Start the MyRealtor app stack
---
4. systemd Unit (Recommended & Stable)

Create the service:

sudo nano /etc/systemd/system/myrealtor-stack.service

Paste:

[Unit]
Description=Traefik + MyRealtor Docker Compose Stack
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/apps/traefik
ExecStart=/usr/bin/docker compose up -d
ExecStart=/usr/bin/docker compose -f /apps/myrealtor/deploy/docker-compose.yml up -d
ExecStop=/usr/bin/docker compose -f /apps/myrealtor/deploy/docker-compose.yml down
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start it:

sudo systemctl daemon-reload
sudo systemctl enable myrealtor-stack
sudo systemctl start myrealtor-stack

Check status:

## systemctl status myrealtor-stack --no-pager

5. Traefik TLS Persistence (CRITICAL)

Traefik certificates must survive reboots.

Ensure this file exists:

/apps/traefik/letsencrypt/acme.json

Permissions must be exactly 600:

chmod 600 /apps/traefik/letsencrypt/acme.json

If this file is lost:

-Traefik will re-request certificates
-You may hit Let’s Encrypt rate limits

---

6. External Docker Network (root_default)

The application stack expects this external network.

Verify:

docker network ls | grep root_default

If missing:

docker network create root_default

Do NOT prune Docker networks in production unless you recreate this.

---

7. Health Checks After Reboot

Run these after any VPS restart:

Containers & ports

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Expected:

traefik → 0.0.0.0:80->80, 0.0.0.0:443->443

frontend/api → no host ports

Host ports

sudo ss -ltnp | grep -E ':(80|443)\s'

Expected:

Owned by docker-proxy (Traefik only)

Traefik logs

docker logs --tail 50 traefik

Expected:

-No repeating errors
-No config decode failures
-No port bind errors

8. Restart Order (Manual)

If you ever need to restart manually:

cd /apps/traefik
docker compose up -d

cd /apps/myrealtor/deploy
docker compose up -d

---

9. Backup Checklist (Minimum)

Back up these files/directories:

/apps/traefik/docker-compose.yml

/apps/traefik/letsencrypt/acme.json

/apps/myrealtor/deploy/docker-compose.yml

/apps/myrealtor/deploy/.env.prod

Docker volumes:

mongo_data

uploads_data

---

10. Key Rules (Do Not Break)

❌ Do NOT publish ports in app containers
❌ Do NOT let frontend/api bind 80 or 443
❌ Do NOT delete acme.json
❌ Do NOT prune Docker networks blindly

✅ Traefik is the only public entry point
✅ All traffic flows via labels + root_default

---

Status

✅ Production hardened
✅ Reboot-safe
✅ TLS persistent
✅ Traefik-first startup guaranteed

Last verified: 14 Jan 2026
