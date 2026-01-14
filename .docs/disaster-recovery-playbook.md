Perfect 👍
Below are **THREE production-grade `.md` files**, ready to drop straight into your `.docs` folder.
They complement each other and together form a **complete ops playbook**.

I’ll give you:

1. **Disaster Recovery Playbook**
2. **VPS Hardening Checklist**
3. **One-Command Health Check Script (with explanation)**

---

# 📄 1️⃣ `.docs/disaster-recovery-playbook.md`

````md
# Disaster Recovery Playbook

**MyRealtor Production – VPS & Docker**

This playbook defines the **authoritative recovery steps** for MyRealtor in case of:

- VPS reboot
- Docker corruption
- Port conflicts (80/443)
- Traefik failure
- Accidental container/network deletion

---

## 1. Incident Categories

### A. Website down / Connection refused

- Traefik not running
- Traefik restarting due to config error
- Ports 80/443 not bound

### B. Containers running but site inaccessible

- Wrong Docker network
- Traefik not attached to `root_default`
- Labels not applied

### C. Data loss risk

- Volumes removed
- `acme.json` deleted

---

## 2. Immediate Triage (2 minutes)

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
````

Expected:

- `traefik` → ports 80/443
- frontend/api → **NO host ports**

Check host ports:

```bash
sudo ss -ltnp | grep -E ':(80|443)\s'
```

If ports are missing → Traefik issue
If ports owned by non-Traefik → rogue container

---

## 3. Safe Full Stack Restart (Preferred)

```bash
sudo systemctl restart myrealtor-stack
```

If this succeeds → STOP here.

---

## 4. Manual Recovery (If Stack Service Fails)

### Step 1 – Ensure Docker is clean

```bash
sudo systemctl restart docker
```

### Step 2 – Ensure external network exists

```bash
docker network ls | grep root_default || docker network create root_default
```

### Step 3 – Start Traefik FIRST

```bash
cd /apps/traefik
docker compose up -d
```

Verify:

```bash
docker ps | grep traefik
```

### Step 4 – Start App Stack

```bash
cd /apps/myrealtor/deploy
docker compose up -d
```

---

## 5. TLS Recovery (Last Resort)

⚠️ Only do this if certificates are broken.

```bash
cd /apps/traefik
rm -f letsencrypt/acme.json
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
docker compose restart
```

---

## 6. Data Safety Rules

❌ NEVER delete Docker volumes unless restoring from backup
❌ NEVER prune Docker networks in production
❌ NEVER expose ports in app containers

---

## 7. Recovery Success Criteria

- Website loads via HTTPS
- API responds
- No Traefik restart loops
- `acme.json` present

---

_Last reviewed: Jan 2026_

````

---

# 📄 2️⃣ `.docs/vps-hardening-checklist.md`

```md
# VPS Hardening Checklist
**MyRealtor Production Environment**

This checklist ensures the VPS remains stable, secure, and predictable.

---

## 1. System Services

```bash
sudo systemctl enable docker
sudo systemctl enable containerd
sudo systemctl enable myrealtor-stack
````

Verify:

```bash
systemctl is-enabled docker containerd myrealtor-stack
```

Expected:

```
enabled
```

---

## 2. Firewall (UFW)

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Verify:

```bash
sudo ufw status
```

---

## 3. Docker Safety

### Networks

```bash
docker network ls | grep root_default
```

### Volumes

```bash
docker volume ls | grep -E 'mongo_data|uploads_data'
```

---

## 4. Traefik Safety

- `acme.json` exists
- Permissions = `600`
- Mounted as volume
- Traefik is ONLY container with ports

```bash
ls -l /apps/traefik/letsencrypt/acme.json
```

---

## 5. App Container Rules

✅ frontend: no ports
✅ api: no ports
✅ mongo: internal network only

❌ NEVER add `ports:` to app containers

---

## 6. OS Maintenance

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

After reboot:

```bash
sudo systemctl status myrealtor-stack
```

---

## 7. Backup Minimum Set

Back up weekly:

- `/apps/traefik`
- `/apps/myrealtor`
- Docker volumes:

  - mongo_data
  - uploads_data

---

## 8. Forbidden Commands (Production)

❌ `docker system prune -a`
❌ `docker network prune`
❌ `rm -rf /var/lib/docker`

---

## Status

✅ VPS hardened
✅ Predictable startup
✅ Traefik protected

_Last reviewed: Jan 2026_

````

---

# 📄 3️⃣ `.docs/one-command-health-check.md`

```md
# One-Command Health Check
**MyRealtor Production**

This command verifies the **entire production stack** in seconds.

---

## The Command

```bash
echo "=== HOST PORTS ===" \
&& sudo ss -ltnp | grep -E ':(80|443)\s' \
&& echo "=== CONTAINERS ===" \
&& docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" \
&& echo "=== NETWORKS ===" \
&& docker network ls | grep root_default \
&& echo "=== TRAEFIK LOG (last 10) ===" \
&& docker logs --tail 10 traefik
````

---

## Expected Output

### Ports

- 80/443 owned by `docker-proxy` (Traefik)

### Containers

- traefik → ports exposed
- frontend/api → NO ports
- mongo → internal only

### Network

- `root_default` exists

### Logs

- No repeating errors
- No config decode failures

---

## Failure Interpretation

| Symptom            | Cause                 |
| ------------------ | --------------------- |
| No 80/443          | Traefik down          |
| Traefik restarting | Config error          |
| App has ports      | Misconfigured compose |
| No root_default    | Network deleted       |

---

## Action

If any check fails:
➡️ Follow **Disaster Recovery Playbook**

---

_Last reviewed: Jan 2026_

```

---

## ✅ What you now have

✔ Production-safe architecture
✔ Reboot-persistent startup
✔ Deterministic recovery
✔ Zero guesswork ops

If you want next:
- **CI/CD deployment notes**
- **Blue-green Traefik rollout**
- **Production monitoring stack (Prometheus/Grafana)**

Just say the word 🚀
```
