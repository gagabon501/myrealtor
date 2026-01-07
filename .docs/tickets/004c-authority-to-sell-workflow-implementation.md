# Ticket 004c — Authority to Sell Workflow (Brokerage Intake → Listing → Sold)

## Goal

Implement the end-to-end **Brokerage / Authority to Sell** workflow in the app:

- Seller submits property + documents
- Staff/admin review and approve
- Authority to Sell (ATS) is generated and signed
- Listing becomes active and visible
- Buyer interest capture + earnest money (optional)
- Sale completion → mark listing SOLD and archive workflow

This ticket focuses on a **workable V1** (no e-sign provider). “Sign in website” uses typed name + checkbox + timestamp + IP.

---

## Roles & Permissions (uses 004a/004b)

- public: can browse properties and submit brokerage interest
- user: can submit a property for listing (seller persona)
- staff/admin: review, approve, publish, manage ATS and status transitions
- admin: can override and manage users

---

## Workflow Stages

### Stage A — Seller Intake

1. Seller (role=user) submits a **Property Listing Request**:

   - property details (title, location, price, description, tags)
   - indicates if earnest money is required (boolean)
   - uploads documents/photos (Document Library module = PROPERTY_REQUEST or PROPERTY? see Design below)

2. Staff/admin reviews the request:
   - approve -> converts to Property listing
   - reject -> returns with notes

### Stage B — Authority to Sell (ATS)

3. ATS is generated using provided form template:
   - Use existing doc template: AUTHORITY TO SELL - FORM.docx as content reference
4. Seller signs ATS in-app:
   - typed name, checkbox, date/time, IP (audit trail)
5. Staff marks ATS as “Accepted”

### Stage C — Listing Published

6. Once ATS accepted:
   - Property status becomes AVAILABLE
   - Listing is public in /properties
   - Documents remain private to staff/admin (per 004a)

### Stage D — Buyer Interest + Earnest Money (optional)

7. Public/user submits interest via existing /services/brokerage/interest
8. Staff/admin can mark inquiry as:
   - RECEIVED → CONTACTED → VIEWING → NEGOTIATION → RESERVED → SOLD (configurable)
9. If listing requires earnest money:
   - generate Earnest Money Agreement from template
   - collect acknowledgement (typed sign) + upload proof of payment (optional)
   - mark as RESERVED once earnest received

### Stage E — Sold

10. Staff/admin marks property SOLD:

- Property status = SOLD
- remove from public listings (or show SOLD if desired)
- audit log entry

---

## Data Model / Design (V1)

### Option 1 (recommended): PropertyListingRequest model

Create a new collection:

- PropertyListingRequest:
  - createdBy (User)
  - propertyDraft fields
  - status: SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED | ATS_PENDING | ATS_SIGNED | PUBLISHED
  - reviewerNotes
  - linkedPropertyId (once approved)

Documents for request:

- Document Library module: PROPERTY_REQUEST
- ownerType: PropertyListingRequest
- ownerId: requestId

After approval:

- Create Property record and link it.

---

## UI Deliverables

### Seller

- /sell (wizard form):
  - create property listing request
  - upload documents with description (doc lib)
  - view request status

### Staff/Admin

- /staff/listing-requests:
  - list all requests
  - view details
  - approve/reject with notes
  - generate ATS
  - view ATS signature status
  - publish listing

### ATS Signing

- /sell/requests/:id/authority-to-sell
  - seller can sign
  - staff can view signature record

---

## Audit Logging

Record these actions:

- PROPERTY_REQUEST_SUBMITTED
- PROPERTY_REQUEST_APPROVED / REJECTED
- ATS_GENERATED
- ATS_SIGNED
- LISTING_PUBLISHED
- EARNEST_REQUESTED / EARNEST_RECEIVED (optional)
- PROPERTY_MARKED_SOLD

---

## Acceptance Criteria (V1)

- A user can submit a property listing request with docs.
- Staff/admin can approve the request and publish the property.
- ATS can be signed in-app with stored signature fields (typed name + timestamp + IP).
- Properties appear in public listings only after publish.
- Property status can be set SOLD by staff/admin.
- Audit logs exist for all key transitions.

---

## Out of Scope (future tickets)

- External e-sign provider integration
- Payment gateway integration
- Complex multi-party signing flows
- Full PDF rendering of signed documents
