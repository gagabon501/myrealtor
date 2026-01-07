# Changelog

All notable changes to this project are documented here. Version numbers refer to the backend/frontend package.json versions at the time of the change when applicable.

## [Unreleased]
- Pending changes not yet tagged.

## [Backend 1.1.19 / Frontend 0.2.19] – Multi-image properties
- Allow up to 4 images per property (create/update).
- Property cards show primary image with clickable thumbnails; new/edit forms support multi-upload with previews.
- Apply flow already enforces registration before submitting applications.

## [Backend 1.1.20 / Frontend 0.2.20] – Property card polish
- Improved property card layout, spacing, and thumbnail presentation (up to 3 thumbs).
- Slightly enhanced properties page header and spacing.

## [Backend 1.1.21 / Frontend 0.2.21] – Property rendering fix
- Handle legacy properties whose `images` value is a single string to avoid render crashes and ensure cards always show.

## [Backend 1.1.22 / Frontend 0.2.22] – Branding polish
- Added a more prominent MyRealtor PH logo/wordmark in the top bar linking to home.

## [Backend 1.1.23 / Frontend 0.2.23] – Registration UX + welcome email
- Registration form now includes email/password confirmation and show/hide toggles.
- Registration enforces matching email/password before submit.
- Sends a welcome email to the user and CCs admin recipients when SMTP is configured.

## [Backend 1.1.24 / Frontend 0.2.24] – Persisted property images
- Store uploads under a persistent `/app/uploads` volume and serve from `/uploads`.
- Docker Compose mounts `uploads_data` to keep images across deploys.
- Property upload paths honor `UPLOADS_ROOT` when provided.

## [Backend 1.1.25 / Frontend 0.2.25] – Upload volume and bumps
- Persist uploads volume; version alignment.

## [Backend 1.1.26 / Frontend 0.2.26] – Property gallery polish
- Property cards layout tightened; thumbnail styling improved and grid stretches cards evenly.
- New/Edit property forms now keep up to 4 selected images at once (no need for multiple passes).
- Upload root still uses persistent volume configuration.

## [Backend 1.1.27 / Frontend 0.2.27] – Property details on cards
- Property cards now show the description/comments added during creation.

## [Backend 1.1.28 / Frontend 0.2.28] – Property grid tweak
- Properties page now uses two columns; a single property spans full width.

## [Backend 1.1.29 / Frontend 0.2.29] – Responsive two-column layout
- Properties page now uses a CSS grid to enforce two columns on medium screens and above, single column on small screens.

## [Backend 1.1.30 / Frontend 0.2.30] – Landing footer
- Added a copyright notice for Gilberto Gabon on the landing page.

## [Backend 1.1.31 / Frontend 0.2.31] – Mobile polish
- Landing hero centered and button stacks improved on mobile; footer retained.
- Property cards get responsive image heights; filter fields now full width on small screens.
- Properties grid continues responsive layout (2 columns on md+, 1 on small).

## [Backend 1.1.32 / Frontend 0.2.32] – Build warning fix
- Resolved duplicate `sx` prop on property card media to fix Vite/JSX warnings.

## [Backend 1.1.33 / Frontend 0.2.33] – Responsive tweaks
- Property cards forced full width with responsive thumbnails.
- Top bar wraps actions on small screens.
- Properties container capped to `lg` with responsive filters and grid.

## [Backend 1.1.34 / Frontend 0.2.34] – CTA polish
- Enhanced “Start an application” button styling on the landing page with a premium gradient and hover state.

## [Backend 1.1.35 / Frontend 0.2.35] – CTA label
- Shortened the apply CTA label to one line (“Start Application”).

## [Backend 1.1.36 / Frontend 0.2.36] – Services PRD coverage (initial)
- Added models and endpoints for brokerage interest, appraisal, titling, and consultancy requests.
- Property supports earnest money flag and buyer interest capture.
- Services page with forms for appraisal, titling/transfer, and consultancy.
- Added property interest flow and services nav link.

## [Backend 1.1.37 / Frontend 0.2.37] – Housekeeping
- Added gitignore entry for local rules file; version alignment.

## [Backend 1.1.18 / Frontend 0.2.18] – Landing refresh and auth gating
- Redesigned landing page with a more engaging hero and prominent browse/apply CTAs.
- Property apply flow now forces registration for unauthenticated users (redirects to register).

## [Backend 1.1.16 / Frontend 0.2.16] – Compose updates
- Compose/deploy tweaks for current infrastructure.

## [Backend 1.1.39 / Frontend 0.2.39] – Property status enum
- Property status enum expanded: DRAFT, AVAILABLE, RESERVED, UNDER_NEGOTIATION, SOLD, ARCHIVED (default AVAILABLE).

## [Backend 1.1.40 / Frontend 0.2.40] – Admin property listing
- Added GET `/api/properties/admin` protected for staff/admin, reusing property listing logic.

## [Backend 1.1.41 / Frontend 0.2.41] – Public-safe listing defaults
- Public property listing defaults to AVAILABLE when status is omitted and rejects DRAFT/ARCHIVED requests.
- Status query normalized to uppercase; admin listing remains unrestricted.

## [Backend 1.1.42 / Frontend 0.2.42] – Listing rules housekeeping
- Retained public/admin listing rules; version alignment.

## [Backend 1.1.43 / Frontend 0.2.43] – Status validation
- Property create/update now normalizes and validates status against the enum; invalid values return 400.

## [Backend 1.1.44 / Frontend 0.2.44] – Card status gating
- Property cards restrict Apply/Interested to AVAILABLE and show friendly status labels; versions aligned.

## [Backend 1.1.45 / Frontend 0.2.45] – Card UX polish
- Refined status gating on property cards with consistent messaging and friendly labels.

## [Backend 1.1.46 / Frontend 0.2.46] – Card gating tweak
- Final adjustments to property action gating and version alignment.

## [Backend 1.1.47 / Frontend 0.2.47] – Docs housekeeping
- Updated tickets/docs; version alignment.

## [Backend 1.1.48 / Frontend 0.2.48] – Buyer inquiry model
- Added `BuyerInquiry` model for Ticket 002 with property ref, buyer details, notes, and status enum.

## [Backend 1.1.49 / Frontend 0.2.49] – Inquiry controller
- Added inquiry controller with create/list/update status handlers and audit events for Ticket 002.

## [Backend 1.1.50 / Frontend 0.2.50] – Inquiry routes
- Added inquiry routes with validation and role protection for Ticket 002.

## [Backend 1.1.51 / Frontend 0.2.51] – Inquiry route mount
- Mounted inquiry routes at `/api/inquiries`; version alignment.

## [Backend 1.1.52 / Frontend 0.2.52] – Property interest form update
- Interest page now posts to `/inquiries`, shows property details, success snackbar, and redirects to properties.

## [Backend 1.1.53 / Frontend 0.2.53] – Admin inquiries page
- Added admin/staff inquiries table with status updates and routing.

## [Backend 1.1.54 / Frontend 0.2.54] – Buyer inquiry schema update
- BuyerInquiry model now nests buyer details (name, address, phone, email) under `buyer` and retains status enum.

## [Backend 1.1.55 / Frontend 0.2.55] – Inquiry controller rewrite
- Inquiry controller now uses nested buyer fields, supports filters and search, populates properties, and audits status changes.

## [Backend 1.1.56 / Frontend 0.2.56] – Inquiry route validations
- Inquiry routes now validate nested buyer fields and status for Ticket 002; versions aligned.

## [Backend 1.1.57 / Frontend 0.2.57] – Property interest payload fix
- Property interest form now sends nested buyer payload to `/inquiries` with required fields; versions aligned.

## [Backend 1.1.58 / Frontend 0.2.58] – Admin inquiries UX
- Admin inquiries table now shows created date, property title, buyer contact, and supports optimistic status updates with feedback.

## [Backend 1.1.59 / Frontend 0.2.59] – Nav link for inquiries
- Added Buyer Inquiries nav button for staff/admin roles.

## [Backend 1.1.60 / Frontend 0.2.60] – Document model
- Added Document model with module/owner fields, file metadata, and indexes.

## [Backend 1.1.61 / Frontend 0.2.61] – Upload utils
- Added shared upload utilities for storage paths, directory ensure, disk storage, and document record builder.

## [Backend 1.1.62 / Frontend 0.2.62] – Document library routes
- Added document library controller/routes and mounted at `/api/documents/library`.

## [Backend 1.1.63 / Frontend 0.2.63] – Document model fix
- Removed duplicate legacy Document schema and cleaned library mount path.

## [Backend 1.1.64 / Frontend 0.2.64] – Import cleanup
- Removed duplicate documentLibraryRoutes import causing nodemon crash; versions aligned.

## [Backend 1.1.65 / Frontend 0.2.65] – Library mount tweak
- Aligned document library mount; version bump.

## [Backend 1.1.67 / Frontend 0.2.67] – Document uploader cleanup
- Consolidated DocumentUploader to a single implementation (description-required per file), aligned with `/document-library` API; includes document list component.

## [Backend 1.1.68 / Frontend 0.2.68] – DocumentUploader deduped
- Removed lingering duplicate component definitions; single uploader remains.

## [Backend 1.1.69 / Frontend 0.2.69] – Document UI polish
- Updated DocumentUploader with categories, removal, and stronger validation; DocumentList retained.

## [Backend 1.1.70 / Frontend 0.2.70] – Inquiry documents dialog
- Added Documents CTA in admin inquiries with dialog combining DocumentUploader and DocumentList for inquiry attachments (module INQUIRY / owner BuyerInquiry).

## [Backend 1.1.71 / Frontend 0.2.71] – Uploads cleanup
- Removed committed uploads artifacts and ignored `backend/uploads/`.

## [Backend 1.1.72 / Frontend 0.2.72] – Document registry
- Added shared document registry constants (modules/ownerTypes/categories) backend/frontend, meta endpoint, and validation hardening for document library.

## [Backend 1.1.73 / Frontend 0.2.73] – Document policy enforcement
- Document library routes now enforce role-based policies (PROPERTY public can only list photos; other actions staff/admin; INQUIRY staff/admin). Added registry validation and module-required checks.

## [Backend 1.1.74 / Frontend 0.2.74] – Inquiry policy guard
- Inquiry create now checks policy; list/status remain staff/admin; versions aligned.

## [Backend 1.1.75 / Frontend 0.2.75] – Frontend gating for docs
- DocumentUploader gated to staff/admin; public/user property lists restricted to PHOTO; admin inquiries now shows access denied for non-staff/admin.

## [Backend 1.1.76 / Frontend 0.2.76] – RBAC hardening for documents
- Document library LIST/UPLOAD/DELETE now staff/admin only; uploader/list hidden for non-staff on frontend; admin inquiries view blocked for non-staff/admin.

## [Backend 1.1.77 / Frontend 0.2.77] – RBAC alignment update
- Document library policy clarified: PROPERTY/INQUIRY list/upload/delete staff/admin only; module required; frontend doc components staff/admin only.

## [Backend 1.1.78 / Frontend 0.2.78] – Service docs ownership (004b)
- Added service modules (APPRAISAL/TITLING/CONSULTANCY) to registry; document library enforces user ownership for service docs (list/upload) and staff/admin delete; service requests now require auth and store createdBy; added MyServiceDocuments page for users.

## [Backend 1.1.66 / Frontend 0.2.66] – Document UI components
- Added DocumentUploader (requires per-file descriptions) and DocumentList with delete for staff/admin.

## [Backend 1.1.15 / Frontend 0.2.15] – Compose updates
- Additional docker-compose adjustments.

## [Backend 1.1.14 / Frontend 0.2.14] – Compose updates
- Minor compose changes and version alignment.

## [Backend 1.1.13 / Frontend 0.2.13] – Compose updates
- Further compose updates and version alignment.

## [Backend 1.1.12 / Frontend 0.2.12] – Server env and CORS
- Server now honors `MONGODB_URI`.
- CORS handling tightened/updated; versions aligned.

## [Backend 1.1.11 / Frontend 0.2.11] – Preflight fix
- Fixed Express 5 preflight regex that caused path-to-regexp crashes.

## [Backend 1.1.10 / Frontend 0.2.10] – Health endpoint
- Added `/api/health` endpoint and documented it.

## [Backend 1.1.9 / Frontend 0.2.9] – CORS loosening
- Made CORS reflective/permissive with preflight support.

## [Backend 1.1.8 / Frontend 0.2.8] – CORS configuration
- Added configurable `CORS_ORIGINS`; credentials allowed; redeploy required.

## [Backend 1.1.7 / Frontend 0.2.7] – Compose and version bump
- Compose adjustments; version sync.

## [Backend 1.1.6 / Frontend 0.2.6] – Compose and version bump
- Compose adjustments; version sync.

## [Backend 1.1.5 / Frontend 0.2.5] – Compose and version bump
- Compose adjustments; version sync.

## [Backend 1.1.4 / Frontend 0.2.4] – Compose and version bump
- Compose adjustments; version sync.

## [Backend 1.1.3 / Frontend 0.2.3] – Deployment artifacts
- Compose/traefik deployment updates; version sync.

## [Backend 1.1.2 / Frontend 0.2.2] – Admin management and media fixes
- Added admin user management with role updates.
- Added property media display/management; staff/admin edit/delete; image click-through.
- Various workflow enhancements.

## [Backend 1.1.1 / Frontend 0.2.1] – Staff/internal workflows
- Compliance task tracking, regulatory status, document approvals, payment confirmations.
- Property filters, staff dashboard, client dashboard enhancements.

## [Backend 1.1.0 / Frontend 0.1.0] – Initial feature set
- Core models: users, properties, applications, documents, payments, audit logs.
- JWT auth, RBAC, audit logging, document upload, mocked payments.
- Client apply flow, dashboards, property listing, role-protected routes.
- Dockerfiles and compose scaffolding.

## [Initial commits]
- `8c52b30` first commit.
- `5587dbd` test deploy.

