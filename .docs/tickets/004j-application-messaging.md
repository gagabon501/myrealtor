## Ticket 004j — Application Messaging (Buyer ↔ Staff/Admin)

### Summary
- Added `ApplicationMessage` model and buyer/staff messaging endpoints.
- Embedded `lastMessageAt` and activity entry `MESSAGE_SENT` on send.
- Notifications fire on staff replies to buyer (type `APPLICATION_MESSAGE_RECEIVED`).
- UI pages for buyer and staff to view/send messages per application.

### Models
- `ApplicationMessage`: application, sender, senderRole, recipientRole, body, isInternal, timestamps. Index on application + createdAt.
- `Application`: added `lastMessageAt` (if used) and activity logs reused.

### Endpoints
- Buyer: `GET /api/applications/:id/messages`, `POST /api/applications/:id/messages` (auth user + ownership enforced).
- Staff/Admin: `GET /api/applications/admin/:id/messages`, `POST /api/applications/admin/:id/messages` (auth staff/admin).
- Notifications: staff reply triggers `APPLICATION_MESSAGE_RECEIVED` to buyer.

### Frontend
- New API helper `applicationMessagesApi`.
- New page `/applications/:id/messages` (buyer) and `/admin/applications/:id/messages` (staff/admin).
- Links from buyer Dashboard and Admin Applications table to the messages page.
- Navbar badge already present from 004i; buyer receives notification on staff reply.

### Security & Validation
- Server-side ownership checks for buyer; role checks for staff/admin.
- Message body trimmed and capped (2000 chars).
- Internal notes visible to staff/admin only.

### Testing notes
- Buyer can view/send on own applications; cannot access others.
- Staff can view/send on any application; buyer gets notification on staff reply.
- No duplicate sends on double click (UI disables while sending).

