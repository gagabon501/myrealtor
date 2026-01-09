## Ticket 004g — Buyer Interest / Apply workflow

Implemented:
- Interested lead de-dup on `(propertyId, emailLower)` with 409 handling and audit.
- Applications model with status enum, unique `(propertyId,userId)`, audits, RBAC endpoints.
- Frontend modals for Interested (public/user) and Apply (user) on Properties.
- Dashboard uses `/applications/mine`; staff Applications page for status updates; TopBar link added.
- Staff/Admin hidden CTAs; public/user see appropriate buttons.

Test plan (quick):
- POST `/services/brokerage/interest` twice same property/email -> second returns 409.
- POST `/applications` as user then repeat -> 409.
- GET `/applications/mine` (user) returns own; `/applications` (staff/admin) returns all; PATCH status works.
# Ticket 004g — Buyer Interest / Apply workflow (end-to-end) + de-duplication + staff pipeline

**Proposed filename:** `004g-buyer-apply-interest-workflow.md`

## Goal

Complete the buyer-side CTA flow on published Properties:

- Public can click **Interested** (lead capture) without logging in.
- Logged-in users (role=`user` / client) can click **Apply** (formal application) and track it in their Dashboard.
- Staff/Admin can view, update, and manage these records with clear statuses.
- Prevent duplicate records being created (same user + same property + same action).

**Important:** Must be enforced in backend (not only UI hiding).

---

## Current observations

- Property cards show CTAs: **APPLY** and **INTERESTED**.
- Staff/Admin must NOT see buyer CTAs (company users).

---

## Scope

### A) Backend

#### 1) Interested Buyer (Public lead capture)

- Endpoint (existing): `POST /api/services/brokerage/interest`
- Enforce de-duplication:
  - **Unique index** on `(propertyId, emailLower)` OR `(propertyId, email)` using lowercased storage.
  - Return `409 Conflict` with `{ message: "Interest already exists" }` (consistent style).
- Fields (minimum):
  - `propertyId`, `name`, `email`, `phone`, `notes`
  - `status: NEW | CONTACTED | CLOSED` (default `NEW`)
  - timestamps
- Add audit log:
  - `BROKERAGE_INTEREST_CREATED`
  - (optional) `BROKERAGE_INTEREST_STATUS_UPDATED` for future changes

#### 2) Applications (Authenticated formal Apply)

- New endpoints:
  - `POST /api/applications` (auth required, role=user only)
  - `GET /api/applications/mine` (auth required, role=user only)
  - `GET /api/applications` (staff/admin only)
  - `PATCH /api/applications/:id/status` (staff/admin only)
- Model `Application`:
  - `propertyId` (ref Property, required)
  - `userId` (ref User, required)
  - `notes` (optional string)
  - `status: SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED | WITHDRAWN` (default `SUBMITTED`)
  - timestamps
- Enforce strict de-duplication:
  - **Unique index** on `(propertyId, userId)`
  - Return `409 Conflict` with `{ message: "Application already exists" }`
- Add audit log:
  - `APPLICATION_CREATED`
  - `APPLICATION_STATUS_UPDATED` (include {id, from, to})

#### 3) Permission rules (backend enforced)

- Public: can create **Interested** lead only.
- Role `user`: can create/list **own** Applications only.
- Staff/Admin: can list all applications + update application status.
- Ensure staff endpoints return `403` for user/public.

---

### B) Frontend

#### 1) Role-based visibility on Properties card

- Public (no token): show **Interested** only
- Client/User: show **Apply** + **Interested**
- Staff/Admin: show neither (company users)

#### 2) Interested modal

- Public: requires at least `email` + `name` (phone optional, notes optional)
- User: prefill from profile (name/email/phone)
- Calls: `POST /api/services/brokerage/interest`
- UI behavior:
  - disable submit while pending
  - handle 409 -> “You already registered interest for this property.”

#### 3) Apply modal (user only)

- Capture optional notes/message
- Calls: `POST /api/applications` with `{ propertyId, notes }`
- UI behavior:
  - disable submit while pending (prevent double-submit)
  - on 201 -> snackbar + redirect to `/dashboard` (or refresh)
  - on 409 -> “You already applied for this property.”

#### 4) Client Dashboard

- Add “My Applications” section fed by `GET /api/applications/mine`
- Show: property title + status + created date (+ link to property optional)

#### 5) Staff/Admin Applications page

- Add route `/applications` (protected staff/admin)
- Table columns:
  - Created, Property, Applicant, Status, Notes
- Actions:
  - update status via `PATCH /api/applications/:id/status`

---

## Out of scope

- Payments / earnest money processing
- Email notifications
- Advanced search/filtering (basic list is enough)

---

## Acceptance Criteria

1. Public can submit **Interested** and sees success message.
2. Client can submit **Apply** and it appears in Client Dashboard.
3. Duplicate Apply (same user+property) returns **409**, UI shows “Already applied”.
4. Staff/Admin can view all applications and update status.
5. Staff/Admin do not see Apply/Interested CTAs on Properties.
6. Backend blocks unauthorized calls (not only UI).
7. Audit logs recorded for create + status updates.

---

## Test Plan (Postman)

### Public (no token)

- `POST /api/services/brokerage/interest`
  - body: `{ propertyId, name, email, phone, notes }`
  - expect: `201`
- Repeat same `(propertyId,email)` -> `409`

### Client (Bearer token role=user)

- `POST /api/applications`
  - body: `{ propertyId, notes }`
  - expect: `201`
- Repeat same `(propertyId,userId)` -> `409`
- `GET /api/applications/mine` -> `200` array

### Staff/Admin (Bearer token)

- `GET /api/applications` -> `200` array
- `PATCH /api/applications/:id/status` -> `200` updated
- Verify user/public cannot access staff endpoints -> `403`

---

## Files likely touched

### Backend

- `backend/src/models/Application.js` (new or update)
- `backend/src/models/InterestedBuyer.js` (ensure unique index)
- `backend/src/routes/applicationRoutes.js` (new)
- `backend/src/controllers/applicationController.js` (new)
- `backend/src/routes/serviceRoutes.js` (add de-dup handling)
- `backend/src/middleware/auth.js` (reuse authorizeRoles / role helpers)
- `backend/src/utils/audit.js` (reuse recordAudit)

### Frontend

- `frontend/src/pages/Properties.jsx` (CTAs + modals)
- `frontend/src/pages/Dashboard.jsx` (My Applications list)
- `frontend/src/pages/Applications.jsx` (new, staff/admin)
- `frontend/src/components/TopBar.jsx` (menu link for staff/admin)
- `frontend/src/api/*` (add application API helpers)

---

## Cursor Prompt (copy/paste)

You are implementing Ticket 004g: Buyer Interest / Apply workflow end-to-end with backend enforcement and de-duplication.

### Context

Roles:

- public: no account
- user/client: registered buyer/seller
- staff/admin: company users

Properties cards show APPLY/INTERESTED but workflows need to be completed and hardened.

### Objectives

1. PUBLIC “Interested” lead capture

- Use existing endpoint: POST /api/services/brokerage/interest
- Enforce de-dup by propertyId + email (case-insensitive) using a unique index (guarantee no duplicates even under race conditions)
- Return 409 Conflict with consistent JSON `{ message: "Interest already exists" }`
- Persist fields: propertyId, name, email, phone, notes, status=NEW, timestamps
- Record audit log: BROKERAGE_INTEREST_CREATED

2. AUTH “Apply” application (user role only)

- Implement:
  - POST /api/applications (auth required; role=user only)
  - GET /api/applications/mine (auth required; role=user only)
  - GET /api/applications (staff/admin only)
  - PATCH /api/applications/:id/status (staff/admin only)
- Create Application model with:
  - propertyId (ref Property, required)
  - userId (ref User, required)
  - notes optional
  - status enum SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED | WITHDRAWN (default SUBMITTED)
  - timestamps
- De-dup strict unique index on (propertyId, userId). On duplicates return 409 `{ message: "Application already exists" }`
- Audit logs: APPLICATION_CREATED and APPLICATION_STATUS_UPDATED (include from/to)

3. Frontend role-based CTAs on Properties card

- public: show Interested only
- user: show Apply + Interested
- staff/admin: show neither
- Must match role logic already used in TopBar role menu visibility.

4. Interested modal

- For public: require email + name at minimum; phone/notes optional
- For user: prefill name/email/phone from profile
- Call POST /api/services/brokerage/interest
- Disable submit while pending; handle 409 with user-friendly message

5. Apply modal

- user only
- optional notes
- Call POST /api/applications { propertyId, notes }
- Disable submit while pending; prevent double submits
- On 201: toast + redirect to /dashboard or refresh list
- On 409: “You already applied for this property.”

6. Client Dashboard

- Add “My Applications” section using GET /api/applications/mine
- Show property title + status + created date

7. Staff/Admin Applications page

- New route /applications (protected staff/admin)
- Table listing of all applications
- Status update action calling PATCH /api/applications/:id/status

### Constraints

- Do NOT break ATS/listing workflows.
- Backend must enforce permissions even if UI hides actions.
- Keep error response style consistent with existing routes.
- Use model-level unique indexes to guarantee de-dup.

### Deliverables

- Working endpoints + models + indexes
- Updated Properties CTAs + modals
- Client Dashboard “My Applications”
- Staff/Admin Applications page
- Notes on how to test (Postman payloads + expected codes)

Start by:

1. Search for InterestedBuyer model + POST /services/brokerage/interest route; add de-dup + unique index + 409 handling.
2. Implement Application model + routes + controllers with role checks.
3. Wire frontend API calls, role-based CTAs, and modals.
4. Add Dashboard and staff/admin Applications page + minimal TopBar link.

Return:

- list of changed files
- test steps
