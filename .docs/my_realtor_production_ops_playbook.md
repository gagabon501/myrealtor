# MyRealtor – Production Operations Playbook

This document is the **single source of truth** for running MyRealtor safely on a VPS using **Docker + Traefik**.

It is written to ensure:
- predictable recovery after VPS reboot
- no more port 80/443 conflicts
- Traefik remains the sole public entrypoint
- zero data loss

---

## 1. Final Expected Architecture (DO NOT DEVIATE)

```
Internet
   ↓
Traefik (ports 80/443 ONLY)
   ↓  Docker network: root_default
---------------------------------
frontend  (no host ports)
api       (no host ports)
mongo     (internal network only)
```

**Hard rules**:
- Only Traefik binds host ports
- App containers NEVER expose ports
- Mongo is never public

---

## 2. Canonical Folder Layout

```
/apps
 ├── traefik
 │    ├── docker-compose.yml
 │    └── letsencrypt/
 │         └── acme.json
 └── myrealtor
      └── deploy
           └── docker-compose.yml
```

---

## 3. Docker Networks (Critical)

### External network required by Traefik + app stack

```bash
docker network create root_default
```

Verify:
```bash
docker network ls | grep root_default
```

---

## 4. Traefik Rules (Non‑Negotiable)

- Traefik **starts first**
- Traefik is attached to `root_default`
- Traefik is the ONLY container allowed to bind 80/443
- `acme.json` exists and is chmod 600

```bash
chmod 600 /apps/traefik/letsencrypt/acme.json
```

---

## 5. Correct Startup Order (Manual)

```bash
cd /apps/traefik
docker compose up -d

cd /apps/myrealtor/deploy
docker compose up -d
```

---

## 6. Systemd Auto‑Start (REQUIRED FOR REBOOTS)

Create systemd unit:

```bash
sudo nano /etc/systemd/system/myrealtor-stack.service
```

```ini
[Unit]
Description=MyRealtor Full Stack (Traefik + App)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/apps/traefik
ExecStart=/usr/bin/docker compose up -d
ExecStartPost=/bin/bash -c 'cd /apps/myrealtor/deploy && /usr/bin/docker compose up -d'
ExecStop=/bin/bash -c 'cd /apps/myrealtor/deploy && /usr/bin/docker compose down'
ExecStopPost=/bin/bash -c 'cd /apps/traefik && /usr/bin/docker compose down'
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable myrealtor-stack
sudo systemctl start myrealtor-stack
```

Verify:
```bash
systemctl status myrealtor-stack
```

---

## 7. One‑Command Health Check

```bash
echo "=== HOST PORTS ===" \
&& sudo ss -ltnp | grep -E ':(80|443)\s' \
&& echo "=== CONTAINERS ===" \
&& docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" \
&& echo "=== NETWORK ===" \
&& docker network ls | grep root_default
```

Expected:
- Traefik owns 80/443
- frontend/api show NO ports

---

## 8. Disaster Recovery (Fast Path)

```bash
sudo systemctl restart myrealtor-stack
```

If that fails:

```bash
sudo systemctl restart docker
cd /apps/traefik && docker compose up -d
cd /apps/myrealtor/deploy && docker compose up -d
```

---

## 9. TLS Recovery (Last Resort Only)

```bash
cd /apps/traefik
rm -f letsencrypt/acme.json
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
docker compose restart
```

---

## 10. Forbidden Production Actions

❌ docker system prune -a
❌ docker network prune
❌ exposing ports in app containers
❌ running multiple reverse proxies

---

## 11. Backup Requirements

Back up weekly:
- /apps/traefik
- /apps/myrealtor
- Docker volumes:
  - mongo_data
  - uploads_data

---

## 12. Final Status

✅ Reboot‑safe
✅ Deterministic startup
✅ TLS auto‑renewing
✅ Traefik‑first architecture

_Last validated: Jan 2026_

