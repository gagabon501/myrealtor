# Ticket 001 — Property status + Earnest Money flag (Repo-aligned)

## Why

Align property lifecycle with the brokerage workflow and enforce correct public behavior:

- public lists AVAILABLE by default
- SOLD/RESERVED/UNDER_NEGOTIATION not actionable
- DRAFT/ARCHIVED hidden from public

Your repo already has:

- Property model with `earnestMoneyRequired`
- Property controller with list/create/update/delete
- Public routes for GET, protected routes for write

---

## Backend changes

### 1) Property model enum expansion

File:

- backend/src/models/Property.js

Change:

- Expand `status` enum to include:
  - DRAFT
  - UNDER_NEGOTIATION
  - ARCHIVED
- Keep existing values:
  - AVAILABLE
  - RESERVED
  - SOLD
- Keep default "AVAILABLE"

Final enum:

- DRAFT | AVAILABLE | RESERVED | UNDER_NEGOTIATION | SOLD | ARCHIVED

### 2) Add admin listing endpoint (new route)

File:

- backend/src/routes/propertyRoutes.js

Add (before "/:id"):

- GET /admin
  - authenticate
  - authorizeRoles("staff","admin")
  - listProperties

Expected URL:

- GET /api/properties/admin

### 3) Public-safe listProperties defaults

File:

- backend/src/controllers/propertyController.js

Rules:

- Public GET /api/properties:
  - If no `status` query provided: default to AVAILABLE
  - If `status` query provided: allow only AVAILABLE/RESERVED/UNDER_NEGOTIATION/SOLD
  - Reject DRAFT/ARCHIVED for public filtering
- Admin GET /api/properties/admin:
  - Allow any of the full enum values
- Normalize status query param to uppercase

### 4) Validate status on create/update

File:

- backend/src/controllers/propertyController.js

Rules:

- If req.body.status exists:
  - normalize to uppercase
  - validate enum
  - if invalid -> 400 with message "Invalid status"

### 5) Optional: validators in routes

File:

- backend/src/routes/propertyRoutes.js

Add optional validators:

- body("status").optional().isIn([...full enum...])
- body("earnestMoneyRequired").optional().isBoolean().toBoolean()

---

## Frontend changes

### 6) PropertyCard actions enforce status

File:

- frontend/src/components/PropertyCard.jsx

Rules:

- Show friendly status label:
  - UNDER_NEGOTIATION -> "Under negotiation"
- Apply button:
  - enabled only when status is AVAILABLE
  - if disabled, show status label instead of "Apply"
- Interested button:
  - disabled or hidden when status is not AVAILABLE
- "Earnest money required" chip remains (already implemented)

---

## Acceptance criteria

- Public GET /api/properties returns AVAILABLE only by default.
- Public cannot retrieve DRAFT/ARCHIVED via query.
- Admin can list all properties via GET /api/properties/admin.
- Create/update supports new statuses with normalization.
- UI disables Apply/Interested when property is not AVAILABLE.
- No Docker/deploy config changes required.
