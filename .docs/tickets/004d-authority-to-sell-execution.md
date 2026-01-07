# Ticket 004d — Authority to Sell (ATS) Workflow Execution

## Goal

Implement the full Authority to Sell (ATS) workflow that governs whether a property listing request can be approved and published.

This ensures legal compliance and enforces that **no property can go live without an approved Authority to Sell document**.

---

## Scope (Backend + Frontend)

### 1. Property Listing Request lifecycle

Extend `PropertyListingRequest` with ATS-aware status handling.

#### Status flow:

- DRAFT
- SUBMITTED
- ATS_PENDING
- ATS_APPROVED
- ATS_REJECTED

Rules:

- Property cannot be published unless status = `ATS_APPROVED`
- ATS document upload is mandatory before approval

---

### 2. Authority to Sell document handling

Reuse the **Document Library** system.

#### Module

- module = `PROPERTY_REQUEST`
- ownerType = `PropertyListingRequest`
- category = `ATTACHMENT`

Requirements:

- At least **one document** with description is required
- Only the request owner (seller) can upload ATS docs
- Staff/Admin can view all ATS documents

---

### 3. Backend changes

#### Model updates

- `PropertyListingRequest`
  - `status` enum extended
  - Optional:
    - `atsApprovedBy`
    - `atsApprovedAt`
    - `atsRejectedReason`

#### Controller logic

- Prevent approval if no ATS document exists
- Approval endpoint:
  - Staff/Admin only
  - Validates ATS docs
  - Updates status + audit log

---

### 4. API Endpoints

#### Seller

- `POST /api/listing-requests` (existing)
- `GET /api/listing-requests/mine`
- `POST /api/document-library`
  - module=PROPERTY_REQUEST
  - ownerId=<listingRequestId>

#### Staff/Admin

- `GET /api/listing-requests`
- `POST /api/listing-requests/:id/approve`
- `POST /api/listing-requests/:id/reject`

---

### 5. Frontend changes

#### Seller UI

- “My Listing Requests” page
- Status badge
- ATS document upload panel when status = `ATS_PENDING`
- Clear messaging: “Authority to Sell required before approval”

#### Admin/Staff UI

- Listing Requests table
- View ATS documents
- Approve / Reject actions
- Optional rejection reason modal

---

### 6. Permissions

- Public: ❌ no access
- Seller (owner):
  - Can upload ATS docs
  - Can view own docs
- Staff/Admin:
  - Full access
  - Approve / reject

---

### 7. Audit Logging

Log:

- ATS document upload
- Approval
- Rejection (with reason)

---

## Acceptance Criteria

- Property listing cannot be published without ATS approval
- ATS document is required and validated
- Role-based access enforced
- UI reflects status accurately
- All actions auditable

---

## Postman Tests

### Upload ATS document (seller)

POST `/api/document-library`
form-data:

- module=PROPERTY_REQUEST
- ownerId=<listingRequestId>
- category=ATTACHMENT
- description=Signed Authority to Sell
- files=<pdf>

Expect: `201`

---

### Approve listing (staff/admin)

POST `/api/listing-requests/:id/approve`
Authorization: Bearer <staff_token>

Expect:

- status = ATS_APPROVED
- audit log entry created

---

### Reject listing (staff/admin)

POST `/api/listing-requests/:id/reject`
JSON:

```json
{
  "reason": "Invalid or unsigned ATS document"
}
```
