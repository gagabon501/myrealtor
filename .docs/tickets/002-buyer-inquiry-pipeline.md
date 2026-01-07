# Ticket 002 — Buyer Inquiry pipeline (Interested)

## Goal

Capture buyer inquiries from public users and allow staff/admin to manage them.

## Public UX

- From PropertyCard: “Interested” leads to /properties/:id/interest
- Form fields:
  - name (required)
  - address (required)
  - phone (required)
  - email (required)
  - notes (optional)
- Submit creates an inquiry linked to propertyId
- Show success message after submit

## Backend

- Create new model: BuyerInquiry
  - propertyId (ref Property)
  - buyer: { name, address, phone, email }
  - notes
  - status: NEW | CONTACTED | CLOSED (default NEW)
  - timestamps
- Routes:
  - POST /api/inquiries (public): create inquiry
    - body includes propertyId + buyer fields
    - validate required fields
  - GET /api/inquiries (staff/admin): list inquiries (filter by status, propertyId)
  - PATCH /api/inquiries/:id/status (staff/admin): update status

## Admin UI

- Add admin page: /admin/inquiries
- Table listing:
  - created date, property title, buyer name, phone, email, status
- Ability to update status via dropdown
- Ability to open property details link

## Audit

- Record audit logs:
  - INQUIRY_CREATED
  - INQUIRY_STATUS_UPDATED
