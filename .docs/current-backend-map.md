# Backend Map (current)

## Server entry & route mounting
- `src/server.js`: loads env, connects Mongo via `connectDB`, starts Express on `PORT` (default 5000).
- `src/app.js`: middleware (helmet, CORS, morgan, body parsers), serves static `/uploads` from `UPLOADS_ROOT` or `uploads/`. Routes:
  - `/api/auth` (authRoutes)
  - `/api/properties` (propertyRoutes)
  - `/api/applications` (applicationRoutes)
  - `/api/documents` (documentRoutes)
  - `/api/payments` (paymentRoutes)
  - `/api/audit` (auditRoutes)
  - `/api/compliance` (complianceRoutes)
  - `/api/users` (userRoutes)
  - `/api/services` (serviceRoutes: brokerage/appraisal/titling/consultancy)
  - Health: `/api/health`, `/health`

## Models (src/models)
- `User.js`, `Property.js`, `Application.js`, `Document.js`, `Payment.js`, `AuditLog.js`
- `ComplianceTask.js`, `InterestedBuyer.js`, `AppraisalRequest.js`, `TitlingRequest.js`, `ConsultancyRequest.js`

## Property routes/controllers (key logic)
- Routes: `routes/propertyRoutes.js`
  - GET `/` list with filters (location, search keyword, status, min/max price)
  - GET `/:id` fetch single
  - POST `/` (staff/admin, multer array up to 4 images) create property; supports `earnestMoneyRequired`
  - PUT `/:id` (staff/admin, multer array up to 4 images) updates fields and merges images (max 4)
  - DELETE `/:id` (staff/admin) remove property (best-effort image cleanup)
- Controller: `controllers/propertyController.js`
  - Normalizes `earnestMoneyRequired`; handles image path creation/merge; audit logs on create/update/delete.

## Inquiry / application endpoints
- Brokerage interest: `routes/serviceRoutes.js` POST `/services/brokerage/interest` creates `InterestedBuyer` for a property (uses property flag for earnest money).
- Applications: `routes/applicationRoutes.js`
  - POST `/` create application for a property (auth)
  - GET `/me` user’s applications; GET `/` staff/admin listing; GET `/:id`; PUT `/:id/stage` workflow updates.
- Compliance tasks: `routes/complianceRoutes.js` list/create/update tasks (staff/admin create/update; owner/staff can list).
- Documents: `routes/documentRoutes.js` POST upload doc to application (auth), GET list by application, PUT status (staff/admin).
- Payments: `routes/paymentRoutes.js` POST record payment (auth), GET list by application, PUT status (staff/admin).
- Services:
  - Appraisal: POST `/services/appraisal` accepts booking + docs, calculates rate (land 10k, building +10k + 5k/floor beyond first), stores `AppraisalRequest`.
  - Titling/transfer: POST `/services/titling` with docs stored in `TitlingRequest`.
  - Consultancy: POST `/services/consultancy` creates `ConsultancyRequest`.

## Upload handling
- `app.js` static `/uploads` served from `process.env.UPLOADS_ROOT` or `uploads/` (created if missing).
- Properties: multer storage to `UPLOADS_ROOT/properties` or `uploads/properties` (`propertyRoutes.js`).
- Documents: multer storage to `src/uploads` (`documentRoutes.js`) with filenames timestamped.
- Services: multer storage to `uploads/services` or `UPLOADS_ROOT/services` for appraisal/titling docs (`serviceRoutes.js`).

