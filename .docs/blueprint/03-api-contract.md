# API Contract (REST) — V0

Base URL: /api

## Auth

- POST /auth/login
- POST /auth/register (if enabled)
- GET /auth/me

## Properties (public)

- GET /properties
  - Query params: search, location, minPrice, maxPrice
  - Optional: status (public allowed only: AVAILABLE/RESERVED/UNDER_NEGOTIATION/SOLD)
  - Default behavior: if no status provided, return AVAILABLE only.
- GET /properties/:id

## Properties (admin)

- GET /properties/admin (staff/admin)
  - Query params: search, location, minPrice, maxPrice, status (any)
- POST /properties (staff/admin)
- PUT /properties/:id (staff/admin)
- DELETE /properties/:id (staff/admin)
- Optional: PATCH /properties/:id/status (staff/admin)

## Buyer inquiries

Option A (new endpoint):

- POST /public/properties/:id/inquiries
  Option B (existing “applications” flow):
- POST /applications { propertyId }

Admin:

- GET /inquiries (or existing admin view)
- PATCH /inquiries/:id/status

## Authority to Sell

- POST /authority-to-sell (public submit or staff create)
- GET /authority-to-sell/:id (staff/admin)
- PATCH /authority-to-sell/:id (staff/admin)
- POST /authority-to-sell/:id/approve (staff/admin)
- POST /authority-to-sell/:id/finalize (staff/admin) -> creates immutable PDF

## Earnest Money Agreement

- POST /earnest-money (staff/admin)
- PATCH /earnest-money/:id (staff/admin)
- POST /earnest-money/:id/finalize (staff/admin) -> creates immutable PDF

## Service Requests

Public:

- POST /services/requests (type = APPRAISAL|TITLING|CONSULTANCY)
- POST /services/requests/:id/documents (if allowing public uploads)
- POST /services/appointments (request slot)

Admin:

- GET /services/requests?type=&status=
- PATCH /services/requests/:id/status
- GET /services/appointments?status=
- PATCH /services/appointments/:id/confirm
- PATCH /services/appointments/:id/cancel

## Appraisal Reports

- POST /appraisals (staff/admin) (create for a serviceRequestId)
- PATCH /appraisals/:id (staff/admin)
- POST /appraisals/:id/finalize (staff/admin) -> PDF immutable
- POST /appraisals/:id/release (staff/admin) -> client can download

## Health

- GET /health
- GET /api/health
