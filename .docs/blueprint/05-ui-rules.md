# UI Rules (V0)

## Roles

- Public user (unauthenticated): browse listings, submit interest, submit service requests, request appointments.
- Registered user (authenticated): may submit “application/interest” if your current flow requires login.
- Staff/Admin: manage properties, requests, documents, appointments, generate PDFs.

---

## Public Listings

### Default listing behavior

- Public properties page must show only:
  - status = AVAILABLE
- Public list should NOT show:
  - DRAFT
  - ARCHIVED
- SOLD listings should be hidden by default. (Optional: show if user filters explicitly later.)

### Property card UI

- Always show:
  - title, location, price, main image
  - status chip (human-friendly label)
- Show "Earnest Money Required" chip if `earnestMoneyRequired === true`.

### Action buttons (public)

- Only actionable when status is AVAILABLE.
- When status != AVAILABLE:
  - Disable Apply/Inquire/Interested actions.
  - Show helper: "This listing is not accepting inquiries."

### Status label mapping (display)

- AVAILABLE -> "Available"
- RESERVED -> "Reserved"
- UNDER_NEGOTIATION -> "Under negotiation"
- SOLD -> "Sold"
- DRAFT -> "Draft" (admin only)
- ARCHIVED -> "Archived" (admin only)

---

## Admin/Staff Listings

### Admin list

- Admin list view should show all statuses:
  - DRAFT, AVAILABLE, RESERVED, UNDER_NEGOTIATION, SOLD, ARCHIVED
- Admin actions:
  - Edit property details
  - Upload images (max 4)
  - Toggle `earnestMoneyRequired`
  - Change status
  - Delete (optional)

### Recommended admin status transitions

- DRAFT -> AVAILABLE (publish)
- AVAILABLE -> RESERVED or UNDER_NEGOTIATION (optional)
- RESERVED/UNDER_NEGOTIATION -> SOLD (sale completed)
- SOLD -> ARCHIVED (optional for cleanup)
- AVAILABLE -> ARCHIVED (if listing withdrawn)

---

## Buyer Interest / Applications UI

### Current system compatibility

- If current flow uses /applications and requires login:
  - Keep it in V0 for backward compatibility.
  - UI label may be changed later from "Apply" to "Inquire".

### Interest submission rules

- If property.status !== AVAILABLE:
  - block submission client-side
  - server-side should also enforce (future hardening)

---

## Documents UI (V0)

### Authority to Sell (ATS)

Public:

- Seller submission form
- Document uploads

Admin:

- Review submission
- Approve/reject
- Finalize PDF (immutable, versioned)

### Earnest Money Agreement (EMA)

Admin-only:

- Create from buyer inquiry + property
- Finalize PDF (immutable, versioned)

### Appraisal Report

Admin-only:

- Structured editor
- Finalize PDF
- Release to client (download link shown in client portal or emailed)

---

## Appointments UI (V0)

Public:

- Request appointment slot

Admin:

- Confirm/cancel
- Email confirmation
