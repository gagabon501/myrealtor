# Changelog

All notable changes to this project are documented here. Version numbers refer to the backend/frontend package.json versions at the time of the change when applicable.

## [Unreleased]
- Pending changes not yet tagged.

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

