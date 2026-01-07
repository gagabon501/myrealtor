# Ticket 004 — Authority to Sell (ATS) workflow (Brokerage V0)

## Goal

Digitize seller onboarding and authority-to-sell process so the brokerage can publish verified listings.

## Seller Flow (public)

- Page: /sell
- Form collects:
  - sellerName (required)
  - sellerAddress (required)
  - sellerPhone (required)
  - sellerEmail (required)
  - propertyTitle (required)
  - propertyLocation (required)
  - askingPrice (required, number)
  - description (optional)
  - earnestMoneyRequired (boolean)
- Upload docs (multi-file):
  - title (PDF/JPG)
  - taxDeclaration (PDF/JPG)
  - sketchPlan (PDF/JPG)
  - vicinityMap (PDF/JPG)
  - photos (up to 10)
- Submit creates an ATSRequest with status DRAFT
- System generates Authority-to-Sell PDF using the provided doc template (V0 can store generated PDF path)
- Seller can upload signed ATS PDF later

## Backend

### Model: ATSRequest

- seller: { name, address, phone, email }
- propertyDraft: { title, location, price, description, earnestMoneyRequired }
- documents: array of { label, path, mimeType, uploadedAt }
- generatedAtsPdfPath (optional)
- signedAtsPdfPath (optional)
- status: DRAFT | SUBMITTED | APPROVED | REJECTED
- timestamps

### Routes

- POST /api/ats (public) create request + uploads
- GET /api/ats (staff/admin) list + filter by status
- GET /api/ats/:id (staff/admin) details
- PATCH /api/ats/:id/status (staff/admin) approve/reject
- POST /api/ats/:id/signed (public) upload signed PDF

## Admin UI

- Page: /admin/ats
- List ATS requests with seller name, property title, status, created date
- View details + downloads for docs
- Approve/Reject actions
- "Create Listing" button (for approved requests) that creates Property entry from propertyDraft

## Notes

- V0 signature is offline upload (no e-sign).
- Future ticket can add web signing and audit trail.
