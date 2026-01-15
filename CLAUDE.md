# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyRealtor PH (Goshen Realty ABCD V0) is a real property management platform with a React frontend and Express backend. The platform digitizes property listings, brokerage workflows, and service requests (Appraisal, Titling, Consultancy).

## Repository Structure

```
backend/     Express 5 + MongoDB (Mongoose) API server
frontend/    Vite + React 19 + Material UI SPA
deploy/      Docker Compose and infrastructure configs
.docs/       Blueprint and tickets (SOURCE OF TRUTH)
```

## Development Commands

### Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev          # Start dev server with HMR
npm run build        # Production build
npm run lint         # ESLint
```

### Backend (port 5000)
```bash
cd backend
npm install
npm run dev          # Start with nodemon auto-reload
npm start            # Production start
```

### Docker (Full Stack)
```bash
cd deploy
docker compose up --build
# Frontend: http://localhost:4173
# API: http://localhost:5000/api
# MongoDB: localhost:27017
```

## Tech Stack

- **Frontend:** React 19, Vite 7, Material-UI 7, Axios, React Router
- **Backend:** Express 5, MongoDB 7, Mongoose 8, JWT auth, Multer uploads
- **Node.js:** Version 22 recommended (20.19+ minimum)

## Architecture

### Authentication
- JWT tokens stored in localStorage
- AuthContext manages user state via React Context
- Three roles: `user` (client), `staff`, `admin`
- Backend middleware: `authenticate()` → `authorizeRoles(...roles)`

### Key Backend Patterns
- Controllers in `backend/src/controllers/`
- Routes with express-validator in `backend/src/routes/`
- Mongoose models in `backend/src/models/`
- File uploads via Multer to `backend/src/uploads/`

### Key Frontend Patterns
- Pages in `frontend/src/pages/`
- Axios client in `frontend/src/api/client.js`
- ProtectedRoute component for role-based access
- MUI theme with custom component overrides

## Domain Rules (from .docs/000-domain-intent-and-boundaries.md)

### Primary Business Spine
```
Authority to Sell → Publish Property → Buyer Interest → (Optional Earnest Money) → SOLD
```

### Property Statuses
`DRAFT` | `AVAILABLE` | `RESERVED` | `UNDER_NEGOTIATION` | `SOLD` | `ARCHIVED`

### Non-Negotiable Constraints
- Properties MUST NOT be published without Authority to Sell (ATS) approval
- Public endpoints must NOT expose DRAFT or ARCHIVED properties
- PDFs are immutable once finalized
- Payments, notarization, and government submissions are handled OFFLINE in V0
- Server-side enforcement over UI-only rules

## Development Rules (from .cursorrules)

1. Do NOT modify Docker, nginx, or deploy configs unless explicitly asked
2. Keep changes backward compatible; do not break existing APIs or UI
3. Implement features strictly within V0 scope
4. Use minimal diffs; avoid large refactors
5. If requirements are unclear, add TODO comments instead of guessing

### When Implementing Tickets
- Read the ticket file in `.docs/tickets/` first
- Then modify only the relevant files

## Environment Setup

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myrealtor
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

Copy from `example.env` files in each directory.

## Secondary Services (Isolated Domains)

These are standalone workflows, NOT sub-flows of brokerage:
- **Appraisal:** Independent request/report lifecycle
- **Titling/Transfer:** Document-heavy, appointment-based
- **Consultancy:** Lead-generation, appointment booking only
