# Ticket 004a — Role-based Permissions Hardening (Public / User / Staff / Admin)

## Purpose

Harden and formalize **role-based access control (RBAC)** across the system to ensure:

- Clear separation of **public**, **user**, **staff**, and **admin** capabilities
- Backend-enforced security (frontend gating is secondary)
- A stable foundation for **Ticket 004 – Authority to Sell Workflow**

This ticket does **not** introduce new roles and does **not** change infrastructure.

---

## Canonical Role Model

### 1. public

- Not authenticated
- No account
- Can:
  - Browse property listings
  - View property details
  - View services (brokerage, appraisal, consultancy, etc.)
  - Initiate engagement flows (buy, sell, appraisal, consultancy)
- Cannot:
  - Manage any records
  - View private documents
  - List inquiries
- On engagement → must register → becomes `user`

---

### 2. user (registered)

- Authenticated
- May act as **buyer and/or seller** (persona, not a role)
- Can:
  - Submit buyer inquiries / expressions of interest
  - Submit property details for selling
  - Request appraisal or consultancy
  - View **own** submissions (where applicable)
- Cannot:
  - View other users’ inquiries
  - Manage properties globally
  - Upload/delete documents for system-managed modules
  - Perform administrative actions

---

### 3. staff

- Internal company users
- Can:
  - Create / update / delete properties
  - View and manage **all** buyer inquiries
  - Upload, view, and delete documents for:
    - PROPERTY
    - INQUIRY
  - Execute and manage Authority-to-Sell workflow steps
- Cannot:
  - Manage users
  - Override system-level constraints

---

### 4. admin

- Superset of staff
- Can:
  - Manage users
  - Override workflows
  - Perform all staff actions
  - System-level administration

---

## Scope of Hardening

### A. Properties

| Action                 | public | user | staff | admin |
| ---------------------- | ------ | ---- | ----- | ----- |
| List / view properties | ✅     | ✅   | ✅    | ✅    |
| Create / edit / delete | ❌     | ❌   | ✅    | ✅    |
| Change property status | ❌     | ❌   | ✅    | ✅    |

---

### B. Buyer Inquiries

| Action                | public | user | staff | admin |
| --------------------- | ------ | ---- | ----- | ----- |
| Create inquiry        | ✅     | ✅   | ✅    | ✅    |
| List all inquiries    | ❌     | ❌   | ✅    | ✅    |
| View inquiry details  | ❌     | ❌   | ✅    | ✅    |
| Update inquiry status | ❌     | ❌   | ✅    | ✅    |

_(User access to “own inquiry” views may be added later; not part of this ticket.)_

---

### C. Document Library (`/api/document-library`)

#### Module: PROPERTY

| Action      | public          | user            | staff | admin |
| ----------- | --------------- | --------------- | ----- | ----- |
| List / view | ✅ (PHOTO only) | ✅ (PHOTO only) | ✅    | ✅    |
| Upload      | ❌              | ❌              | ✅    | ✅    |
| Delete      | ❌              | ❌              | ✅    | ✅    |

#### Module: INQUIRY

| Action      | public | user | staff | admin |
| ----------- | ------ | ---- | ----- | ----- |
| List / view | ❌     | ❌   | ✅    | ✅    |
| Upload      | ❌     | ❌   | ✅    | ✅    |
| Delete      | ❌     | ❌   | ✅    | ✅    |

---

## Backend Requirements

### 1. Centralized Access Policy

Create a single policy helper (e.g. `accessPolicies.js`) that:

- Normalizes role (`public` if unauthenticated)
- Exposes helpers:
  - `isStaff(role)`
  - `isAdmin(role)`
  - `can(action, role, context)`
- Context includes:
  - module (PROPERTY, INQUIRY)
  - action (LIST, UPLOAD, DELETE, etc.)
  - category (PHOTO, ATTACHMENT)

All permission checks must reference this policy.

---

### 2. Route Enforcement

- Apply policy checks **inside routes**, before controller logic
- Return consistent errors:
  - `401 Unauthorized` → not logged in
  - `403 Forbidden` → logged in but insufficient rights
- Never rely solely on frontend hiding

---

### 3. Document Library Enforcement

- `/api/document-library`
  - Enforce access rules per module and role
  - Restrict PROPERTY public access to `category=PHOTO`
  - Restrict all INQUIRY access to staff/admin

---

## Frontend Requirements

### UI Gating (Secondary Safety)

- Hide upload/delete buttons for non-staff/admin
- Hide admin pages (inquiries list, user management) for non-authorized roles
- If a restricted route is accessed directly:
  - Show a friendly “Access denied” message

---

## Non-Goals

- ❌ No new roles
- ❌ No Docker / infra changes
- ❌ No workflow redesign
- ❌ No ownership-based access for users (future enhancement)

---

## Acceptance Criteria

- Public users cannot upload or view private documents
- Users cannot list or manage inquiries
- Staff/admin can fully manage properties, inquiries, and documents
- All restricted backend routes return clean 403 errors
- No regressions in existing working flows
- `/api/health` remains stable (no crash loops)

---

## Verification Checklist (Postman)

### Public (no token)

- GET `/api/properties` → 200
- GET `/api/document-library?module=PROPERTY&category=PHOTO` → 200
- POST `/api/document-library` → 403

### User (Bearer token)

- POST buyer inquiry → 201
- GET `/api/document-library?module=INQUIRY` → 403

### Staff/Admin

- POST `/api/document-library` (PROPERTY / INQUIRY) → 201
- GET `/api/document-library?module=INQUIRY` → 200
- DELETE `/api/document-library/:id` → 200

---

## Completion Definition

Role-based permissions are:

- Centralized
- Enforced on backend
- Consistent across modules
- Ready to support Ticket 004 (Authority to Sell Workflow)
