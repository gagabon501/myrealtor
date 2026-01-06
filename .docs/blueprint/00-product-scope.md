# Goshen Realty ABCD — V0 Scope

## Product statement

A client-facing website and internal admin dashboard that digitizes Goshen Realty ABCD’s property listings and service requests (Brokerage, Appraisal, Titling/Transfer, Consultancy), including document intake, appointment booking, and status tracking.

AI is used only for drafting text and generating documents; it does not make legal or pricing decisions.

## V0 goals

1. Centralize property listings (photos, location, price, status).
2. Capture buyer interest and route it to staff/admin.
3. Capture seller property submissions and generate an Authority-to-Sell document.
4. Capture service requests (Appraisal / Titling / Consultancy) with document uploads + appointments.
5. Allow admin/staff to manage statuses and generate finalized PDFs with an audit trail.

## In scope (V0)

### Public site

- View property listings (default show AVAILABLE only).
- View listing details and images.
- Buyer interest submission for a property.
- Service request forms:
  - Property appraisal request
  - Land titling / title transfer request (unlimited titled document uploads)
  - Consultancy appointment booking
- Appointment booking (request a slot).

### Admin/staff dashboard

- Create/update property listings (including `earnestMoneyRequired` and `status`).
- Mark property status lifecycle (AVAILABLE → UNDER_NEGOTIATION/RESERVED → SOLD).
- Review buyer inquiries and update inquiry status (NEW → CONTACTED → CLOSED).
- Review seller submissions and finalize Authority-to-Sell PDF.
- Create/finalize Earnest Money Agreement PDF (when required).
- Review service requests, view documents, manage appointment status.
- Draft/finalize appraisal report and release to client.

### Documents

- Authority to Sell and Negotiate (template-based PDF)
- Earnest Money Agreement (template-based PDF)
- Appraisal report (structured content → PDF)

## Out of scope (V0)

- Online payments / payment gateways / escrow
- E-notary / digital notarization
- Government integrations (BIR/LRA/etc.)
- Full CRM, pipeline automation, commission accounting
- Multi-company SaaS / multi-tenancy
- AI-generated pricing/valuation decisions (AI may help draft text only)
- Mobile native apps

## Definition of done (V0)

- Public can browse AVAILABLE listings.
- Admin/staff can publish and manage listings + statuses.
- Buyer inquiries are captured and visible in admin.
- Seller submission produces an Authority-to-Sell record and a finalized PDF.
- Earnest money requirement is visible on listings; agreement can be generated.
- Appraisal/titling/consultancy requests + document uploads + appointment requests work end-to-end.
- Audit logs exist for key actions (create/update/finalize/release/status change).
