# CLAUDE.md (MyRealtor PH / Goshen Realty)

## Project Context

- **Stack:** React 19 (Vite 7), MUI 7 | Express 5, MongoDB 7 (Mongoose 8), Node 22
- **Structure:** `frontend/` (React SPA), `backend/` (Express API), `deploy/` (Docker), `.docs/` (Tickets/Source of Truth)
- **Roles:** `user`, `staff`, `admin` (JWT in localStorage)

## Execution Commands

- **Frontend (5173):** `cd frontend && npm run dev` | Build: `npm run build`
- **Backend (5000):** `cd backend && npm run dev`
- **Full Stack:** `cd deploy && docker compose up --build`

## Non-Negotiables

- **Rules:** Read ticket in `.docs/tickets/` before coding. No large refactors.
- **Workflow:** Auth to Sell (ATS) → Publish → Interest → SOLD.
- **Statuses:** DRAFT | AVAILABLE | RESERVED | NEGOTIATION | SOLD | ARCHIVED.
- **Strict:** Server-side enforcement. No DRAFT/ARCHIVED on public endpoints. PDFs are immutable.
- **Scope:** V0 only. Offline: Payments, notarization, govt submissions.

## Core Patterns

- **Backend:** Models: `/models/` | Routes: `/routes/` (express-validator) | Controllers: `/controllers/`
- **Frontend:** Pages: `/pages/` | API: `/api/client.js` | Auth: `AuthContext`
- **Middleware:** `authenticate()`, `authorizeRoles()`

## Handoff Guide

- Refer to `@.docs/` for detailed domain intent and secondary service logic (Appraisal/Titling).
- Use concise diffs. Do not touch `deploy/` or `nginx` unless asked.
