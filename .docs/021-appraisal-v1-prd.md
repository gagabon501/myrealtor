# 021 — Property Appraisal V1.1 (PRD)

⚠️ This PRD defines the FIRST post-V0 feature.
Brokerage V0 MUST NOT be modified.

---

## 1. Objective

Provide a **standalone Property Appraisal service** that allows clients to:

- Request an appraisal
- Upload required documents
- Book an appointment
- Receive an appraisal report

This service does NOT publish properties and does NOT interact with Brokerage lifecycle.

---

## 2. In-Scope (V1.1)

### Client Capabilities

- Submit appraisal request:
  - Name
  - Email
  - Phone
  - Property location
  - Property type (Land / Building)
  - Floor area (if building)
  - Year built (if building)
  - Last major renovation date (optional)
- Upload documents:
  - Title
  - Tax Declaration
  - Property photos
- Book an appointment (calendar)
- View request status
- Download final appraisal report

---

### Staff/Admin Capabilities

- View all appraisal requests
- Review documents
- Confirm / reschedule appointments
- Upload appraisal report (PDF)
- Mark appraisal as completed

---

## 3. Out of Scope (Explicit)

- Publishing properties
- Auto-conversion to Brokerage
- Online payments
- Auto-pricing or AI valuation
- Government submissions

---

## 4. Workflow (Authoritative)

Client submits appraisal request
→ Uploads documents
→ Books appointment
→ Staff confirms appointment
→ Appraisal conducted OFFLINE
→ Staff uploads report
→ Client notified
→ Request marked COMPLETED

---

## 5. Status Model

`AppraisalRequest.status`:

- DRAFT
- SUBMITTED
- APPOINTMENT_CONFIRMED
- IN_PROGRESS
- REPORT_READY
- COMPLETED
- CANCELLED

Status changes are staff-controlled after submission.

---

## 6. Data Model (New, Isolated)

### AppraisalRequest

- id
- client details
- property details
- status
- appointmentId (optional)
- createdAt / updatedAt

### AppraisalReport

- appraisalRequestId
- documentId (PDF)
- preparedBy
- preparedAt

---

## 7. Documents

Uses **Document Library** with:

- module = APPRAISAL
- ownerType = AppraisalRequest
- ownerId = appraisalRequest.id

All documents require description.

---

## 8. Permissions

- Public: ❌ none
- User:
  - Create appraisal request
  - View own requests
- Staff/Admin:
  - View all
  - Upload reports
  - Change status

---

## 9. Acceptance Criteria

- Appraisal requests do not affect Brokerage
- No property status changes occur
- No listing is created automatically
- All document access is RBAC-enforced
- Appraisal lifecycle is fully auditable

---

## 10. V0 Protection Clause

If any implementation:

- modifies Brokerage routes
- modifies Property lifecycle
- modifies ATS logic

STOP and re-evaluate.

This PRD is invalid if Brokerage V0 is impacted.
