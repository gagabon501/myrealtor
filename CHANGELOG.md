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

## [Backend 1.1.18 / Frontend 0.2.18] – Landing refresh and auth gating
- Redesigned landing page with a more engaging hero and prominent browse/apply CTAs.
- Property apply flow now forces registration for unauthenticated users (redirects to register).

## [Backend 1.1.16 / Frontend 0.2.16] – Compose updates
- Compose/deploy tweaks for current infrastructure.

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

