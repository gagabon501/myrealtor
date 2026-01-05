MyRealtor PH – Real Property Management Platform
================================================

End-to-end sample implementation for the PRD: property listings, client applications, document uploads, payments (mocked), and audit logging with RBAC.

Stack
-----
- Frontend: React + Vite + Material UI, Axios, React Router
- Backend: Node.js + Express + MongoDB + Mongoose, JWT auth, multer uploads, audit logs
- Deployment: Dockerfiles per app, `deploy/docker-compose.yml` for Mongo + API + frontend preview

Getting Started (native, no Docker)
-----------------------------------
Prereqs: Node >= 20.19 (recommended 22.x) and local MongoDB running on `mongodb://localhost:27017`.

1. **Backend**
   - Copy `backend/example.env` to `backend/.env` (defaults use localhost Mongo).
   - Run: `cd backend && npm install && npm run dev`
   - API: http://localhost:5000/api
2. **Frontend**
   - Copy `frontend/example.env` to `frontend/.env` (defaults to API above).
   - Run: `cd frontend && npm install && npm run dev -- --host --port 5173`
   - App: http://localhost:5173

Docker Compose (VPS / optional local)
-------------------------------------
```
cd deploy
docker compose up --build
```
- Frontend preview: http://localhost:4173 (build arg `VITE_API_URL` defaults to `http://localhost:5000/api`)
- Backend: http://localhost:5000/api (uploads persisted via volume to `backend/src/uploads`)
- Mongo: localhost:27017 (volume `mongo-data`)
- Node base image: 22-alpine (meets Vite/Express engine requirements); only needed when building Docker images.

Key Backend Endpoints (JWT protected where noted)
-------------------------------------------------
- `POST /api/auth/register` – client registration
- `POST /api/auth/login`
- `GET /api/auth/me` – current user (auth)
- `GET /api/properties` – public listings
- `POST /api/properties` – create (staff/admin)
- `PUT /api/properties/:id` – update (staff/admin)
- `POST /api/applications` – create application (client)
- `GET /api/applications/me` – my applications (client)
- `GET /api/applications` – all (staff/admin)
- `PUT /api/applications/:id/stage` – update stage (staff/admin)
- `POST /api/documents` – upload document (auth, multipart)
- `GET /api/documents/:applicationId` – list documents (auth)
- `POST /api/payments` – record mock payment (auth)
- `GET /api/payments/:applicationId` – list payments (auth)
- `GET /api/audit` – audit logs (admin)

Frontend Flows
--------------
- Public listing browser with apply button.
- Client auth, dashboard with application status, payment trigger, and document upload form.
- Top navigation with login/logout and dashboard link.

Notes and Limitations
---------------------
- Payments are mocked; integrate a real gateway for production.
- File uploads store on local disk under `backend/src/uploads`; move to secure storage for production.
- RBAC is role-based via JWT; seed staff/admin users manually in Mongo.
