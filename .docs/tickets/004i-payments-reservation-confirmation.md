# Ticket 004i — Payments & Reservation Confirmation (Next)

## Status
- Draft / To Do

## Objective
Implement reservation payment capture/confirmation for buyer applications, ensuring:
- Role-based access (client vs staff/admin)
- Clear payment status tied to an application
- No duplicate payment records for the same application/reservation step

## Scope
### Included
- Payment intent/record creation for an Application
- Basic statuses: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- Staff/admin ability to view and mark payments
- Client ability to view their payment status

### Excluded
- Real payment gateway integration (mock/stub only)
- E-signatures / contracts
- Multi-currency or tax computations

## Roles & Permissions
- **Client (user)**: can initiate a payment for their own application; view status.
- **Staff/Admin**: can view all payments; can update status (e.g., confirm, refund); cannot pay as a client.
- **Public**: no access.

## Endpoints (proposed)
- `POST /api/payments` (auth user) — create payment record for application
- `GET /api/payments/mine` (auth user) — list own payments
- `GET /api/payments` (staff/admin) — list all
- `PATCH /api/payments/:id/status` (staff/admin) — update status

## Data Model (proposed)
- `applicationId` (ref Application, required, unique per active payment)
- `userId` (ref User, required)
- `amount` (number)
- `status` enum: `PENDING|PAID|FAILED|REFUNDED`
- `gateway` (string, optional/mock)
- `reference` (string)
- timestamps
- Unique constraint: `(applicationId, status in ['PENDING','PAID'])` to prevent duplicates.

## Validation & Rules
- Auth required; role=user for create; staff/admin for list/update.
- 409 if duplicate active payment for same application.
- 403 if staff/admin tries to create.
- 401 if unauthenticated.

## UI (future)
- Client Dashboard: show payment status per application; CTA “Pay reservation” when allowed.
- Staff/Admin: table of payments with status update control.

## Definition of Done
- Backend endpoints with role enforcement and duplicate prevention.
- Basic mock payment flow working locally.
- Payments linked to applications and visible on dashboards.

