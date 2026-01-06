# Environment & Configuration (V0)

This document defines the required and optional environment variables for
Goshen Realty ABCD (V0), based on the current Express + MongoDB + Docker setup.

All variables should be supplied via `.env` files or container environment
configuration (Docker Compose / Hostinger VPS).

---

## Core Application

### NODE_ENV

- Description: Application environment
- Values: development | staging | production
- Required: Yes
- Example:
  NODE_ENV=production

### PORT

- Description: Backend server port
- Required: Yes
- Example:
  PORT=5000

---

## Database (MongoDB)

### MONGO_URI

- Description: MongoDB connection string
- Required: Yes
- Example:
  MONGO_URI=mongodb://localhost:27017/goshen_realty

Notes:

- Use MongoDB Atlas or self-hosted MongoDB on VPS.
- Enable authentication in production.

---

## Authentication (JWT)

### JWT_SECRET

- Description: Secret used to sign JWT tokens
- Required: Yes
- Example:
  JWT_SECRET=super-long-random-secret-string

### JWT_EXPIRES_IN (optional)

- Description: Token expiry duration
- Required: No (default handled in code if not set)
- Example:
  JWT_EXPIRES_IN=7d

---

## CORS

### CORS_ORIGINS

- Description: Comma-separated list of allowed frontend origins
- Required: No (fallback allows all origins)
- Example:
  CORS_ORIGINS=https://myrealtor.nodesafe.cloud,https://www.myrealtor.nodesafe.cloud

Notes:

- In production, restrict this list.
- In development, allow localhost.

---

## File Uploads & Storage

### UPLOADS_ROOT

- Description: Root directory for uploaded and generated files
- Required: No (defaults to `<project_root>/uploads`)
- Example:
  UPLOADS_ROOT=/var/www/myrealtor/uploads

### Upload subfolders (created automatically)

- uploads/properties
- uploads/documents
- uploads/generated/authority-to-sell
- uploads/generated/earnest-money
- uploads/generated/appraisal

Notes:

- Ensure filesystem permissions allow write access.
- In V0, filesystem storage is acceptable.
- Future versions may replace this with object storage (S3-compatible).

---

## Email (Notifications)

Used for:

- Appointment confirmations
- Service request confirmations
- Admin notifications (optional)

### SMTP_HOST

- Description: SMTP server hostname
- Required: Optional (email disabled if missing)
- Example:
  SMTP_HOST=smtp.gmail.com

### SMTP_PORT

- Description: SMTP server port
- Required: Optional
- Example:
  SMTP_PORT=587

### SMTP_SECURE

- Description: Use TLS
- Required: Optional
- Values: true | false
- Example:
  SMTP_SECURE=false

### SMTP_USER

- Description: SMTP username
- Required: Optional
- Example:
  SMTP_USER=noreply@goshenrealty.com

### SMTP_PASS

- Description: SMTP password
- Required: Optional
- Example:
  SMTP_PASS=app-specific-password

### MAIL_FROM

- Description: Default sender address
- Required: Optional
- Example:
  MAIL_FROM="Goshen Realty ABCD <noreply@goshenrealty.com>"

Notes:

- If SMTP variables are missing, email sending should fail gracefully.
- Email is helpful but not required for V0 acceptance.

---

## Frontend (Vite)

### VITE_API_BASE_URL

- Description: Base URL for backend API
- Required: Yes
- Example:
  VITE_API_BASE_URL=https://myrealtor.nodesafe.cloud/api

Notes:

- Used by `frontend/src/api/client.js`.
- Must match backend public URL.

---

## Security & Hardening (Recommended)

### TRUST_PROXY

- Description: Enable when running behind reverse proxy (nginx)
- Required: Optional
- Example:
  TRUST_PROXY=1

### RATE_LIMIT_ENABLED (future)

- Description: Toggle API rate limiting
- Required: No (future hardening)
- Example:
  RATE_LIMIT_ENABLED=true

---

## Logging & Monitoring

### LOG_LEVEL (future)

- Description: Control log verbosity
- Required: No
- Example:
  LOG_LEVEL=info

---

## Sample `.env.production`

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb://localhost:27017/goshen_realty
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
CORS_ORIGINS=https://myrealtor.nodesafe.cloud

UPLOADS_ROOT=/var/www/myrealtor/uploads

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@goshenrealty.com
SMTP_PASS=change-me
MAIL_FROM="Goshen Realty ABCD <noreply@goshenrealty.com>"

VITE_API_BASE_URL=https://myrealtor.nodesafe.cloud/api
```
