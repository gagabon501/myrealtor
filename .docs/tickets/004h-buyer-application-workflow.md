# Ticket 004h — Buyer Application / Inquiry Workflow (Client & Staff)

## Status

**In Progress / Ready for Verification**

---

## Objective

Implement and validate the **Buyer Application (Apply / Interested)** workflow end-to-end, ensuring:

- Correct role-based access (Client vs Staff/Admin)
- No duplicate application records
- Proper status transitions
- Correct synchronization between **Applications** and **Properties**
- Clear visibility for both Client and Staff dashboards

This ticket focuses on **functional correctness and data integrity**.

---

## Scope

### Included

- Client “Apply / Interested” flow
- Application creation and validation
- Client Dashboard application visibility
- Staff/Admin application review and status changes
- Property status synchronization (Published → Reserved → Sold)
- Duplicate-prevention logic

### Excluded

- Payments
- Contract signing
- Compliance documents beyond application creation

---

## User Roles & Permissions

### Client

- Can view **Published** properties
- Can apply to a property **once**
- Can view own applications
- Cannot approve, reject, or reserve

### Staff / Admin

- Can view all applications
- Can update application status
- Cannot create buyer applications
- Cannot trigger duplicate records

### Public (Not logged in)

- Can browse properties
- Cannot apply (redirect to login)

---

## Workflow Overview

### 1. Property Listing (Public / Client)

- Only properties with `published = true` are visible
- Apply / Interested CTA visible **only to Clients**

---

### 2. Application Creation (Client)

**Endpoint**
POST /api/applications

**Rules**

- One application per `(propertyId + buyerId)`
- Backend must enforce uniqueness
- Frontend must prevent double submit

**Expected Backend Behavior**

- If application exists → return **409 Conflict**
- If role ≠ client → return **403 Forbidden**

---

### 3. Client Dashboard

Client can see:

- Property title
- Location and price
- Application status:
  - Submitted
  - Under Review
  - Reserved
  - Approved
  - Rejected

Client **cannot**:

- Modify status
- Create duplicate applications

---

### 4. Staff/Admin Dashboard

Staff can:

- View all buyer applications
- See buyer + property linkage
- Update application status:
  - Approve
  - Reject
  - Mark Reserved

Staff **cannot**:

- Create applications
- Trigger property duplication

---

### 5. Application → Property Sync Rules

| Application Status | Property Effect            |
| ------------------ | -------------------------- |
| Submitted          | No change                  |
| Approved           | Optional: mark Reserved    |
| Reserved           | Property = Reserved        |
| Rejected           | No change                  |
| Withdrawn          | Property remains Published |

**Important**

- Property updates must be **idempotent**
- One status change → one property update

---

## Data Integrity Rules

### Duplicate Prevention

- Backend must check existing records before insert
- Unique index or query guard on:

(propertyId, buyerId)

- UI must disable submit after first click

---

## Validation Checklist

### Client

- [ ] Can apply only once per property
- [ ] Receives clear error if re-applying
- [ ] Sees correct application status
- [ ] Cannot apply to Reserved / Sold properties

### Staff/Admin

- [ ] Can see all applications
- [ ] Status updates do not create new records
- [ ] Property state updates once per action

### Backend

- [ ] No duplicate application records
- [ ] Role checks enforced server-side
- [ ] Idempotent update logic

---

## Known Failure Modes (Prevented by This Ticket)

- Duplicate application records
- Staff accidentally creating applications
- Property status updated multiple times
- Client seeing Apply CTA when forbidden
- Silent failures without feedback

---

## Definition of Done (DoD)

This ticket is considered **DONE** when:

- No duplicate buyer applications can be created
- Backend rejects duplicate or unauthorized requests
- Client and Staff views are consistent
- Property and Application states remain synchronized
- All checks pass in local and deployed environments

---

## Related Tickets

- 004f — Publish listing after ATS approval
- 004g — Apply / Reservation access rules
- 004i — Payments & Reservation confirmation (next)

---

## Notes

This ticket emphasizes **backend correctness over UI hacks**.  
All critical protections must exist server-side.

If you want, next I can:

✅ Create 004i.md

✅ Generate a full workflow diagram

✅ Convert all tickets (004a–004h) into a single release checklist

Just tell me 👍
