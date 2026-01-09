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

---

We are getting 403 Forbidden as soon as we open the “Authority to Sell Documents” modal.

Console shows:
GET https://apimyrealtor.nodesafe.cloud/api/document-library?module=PROPERTY_REQUEST&ownerId=<listingRequestId> -> 403

Fix backend routing/auth: document-library GET currently does NOT authenticate (or optional-auth), so req.user is undefined and role becomes public, causing canDocumentAccess() to deny LIST.

TASK:

1. In backend/src/routes/documentLibraryRoutes.js:
   - Apply optionalAuth middleware to GET "/" so that if Authorization: Bearer <token> is present, req.user is populated.
   - Make sure role is computed AFTER optionalAuth runs.
   - Keep behaviour: if module is USER_OWNED_MODULES and caller is not staff/admin, require auth + ownerId + ownership checks.
   - If no auth header, treat as public and return 403/401 as appropriate (public must not access documents).

Implementation detail:

- Ensure optionalAuth uses authenticate(req,res,next) when Bearer token exists.
- Update route signature like:
  router.get("/", optionalAuth, (req,res,next) => { ...existing logic... })

2. Also ensure POST "/" requires auth BEFORE evaluating permissions:

   - Add authenticate middleware to POST route (so req.user exists)
   - Example:
     router.post("/", authenticate, upload.array("files", 20), async (req,res,next)=>{ ... })

3. Re-test:
   - Logged-in client opens ATS modal -> LIST should return 200 with empty array (not 403).
   - Upload ATS doc -> POST should return 201.

Do NOT loosen permissions: public must still be blocked, client only sees own PROPERTY_REQUEST docs, staff/admin can see all.

---

## Ticket 004d (Frontend) — Seller UI for ATS workflow (My Listing Requests) - Sequence 1

Goal:
Implement seller-facing UX for Authority to Sell (ATS) workflow inside the "My Listing Requests" page.
Seller should clearly see ATS status, upload ATS docs when required, and see rejection reason if rejected.

Context:

- Listing request model now supports ATS states (backend already implemented).
- ATS document uploads use existing shared Document Library module:
  - module = PROPERTY_REQUEST
  - ownerType = PropertyListingRequest (already in registry)
  - ownerId = listingRequest.\_id
  - category must be "ATTACHMENT" for ATS
- Seller must be able to upload/list/delete OWN ATS documents for their own listing request (already fixed for 403).

Scope:
Frontend only (no infra).
Do not break admin/staff views.

### 1) Identify files

- Find page component for seller listing requests, likely:
  - frontend/src/pages/MyListingRequests.jsx (or similar)
- There is already a Documents modal/dialog component used for ATS docs:
  - frontend/src/components/ListingRequestDocumentsDialog.jsx (or similar)
    Use it (don’t duplicate document components).

### 2) ATS status mapping (seller-visible)

For each listing request card row, show a status chip/badge:

- ATS_PENDING -> label "ATS Pending"
- ATS_APPROVED -> label "ATS Approved"
- ATS_REJECTED -> label "ATS Rejected"
  Fallback if status missing: treat as ATS_PENDING.

Also show rejection reason text ONLY when ATS_REJECTED:

- display "Reason: <atsRejectedReason>" in a small Typography under the chip.
- If missing reason, show "Reason: Not provided".

### 3) Seller actions on the card

On each listing request card:

A) When status is ATS_PENDING:

- Show a prominent callout/alert at top of card:
  "Authority to Sell (ATS) document is required before approval."
- Show a CTA button: "Upload ATS Document"
  - Clicking opens the Documents dialog
  - The dialog must be pre-configured to ATS mode:
    - title: "Authority to Sell Documents"
    - module = PROPERTY_REQUEST
    - ownerType = "PropertyListingRequest" (or whatever constant is used)
    - ownerId = listingRequest.\_id
    - categories allowed: only ["ATTACHMENT"] (force category dropdown to ATTACHMENT and disable changing)
    - Optionally set default description/label placeholders like "ATS"

B) When status is ATS_REJECTED:

- Show callout alert (severity=error or warning):
  "ATS was rejected. Please upload a corrected ATS document and resubmit."
- Keep the same CTA button: "Re-upload ATS Document" (opens same dialog)
- Keep showing the rejection reason.

C) When status is ATS_APPROVED:

- Do NOT show upload callout.
- Still allow "View ATS Documents" (secondary button) so seller can view/download what was uploaded.

### 4) Documents dialog behavior

Ensure the seller dialog:

- Lists uploaded ATS docs for that listing request
- Allows upload and "delete own" (already in backend/policy)
- If your shared DocumentUploader supports category selection, hard-lock it:
  - category fixed to "ATTACHMENT"
  - hide category dropdown OR disable it
- Ensure request parameters passed match API expectations:
  - list endpoint must call GET /api/document-library?module=PROPERTY_REQUEST&ownerId=<id>
  - upload must POST /api/document-library with form-data including:
    - module=PROPERTY_REQUEST
    - ownerType=PropertyListingRequest
    - ownerId=<id>
    - category=ATTACHMENT
    - descriptions[] etc + files[]
- On close, refresh that card’s documents list if needed (or rely on internal refreshKey).

### 5) UI consistency

- Use existing MUI components already used in other pages:
  - Chip, Alert, Button, Stack, Typography
- Keep layout clean:
  - Chip aligned right or under title
  - Callout above action buttons
- Do not change TopBar navigation in this ticket.

### 6) Acceptance criteria

- Seller sees ATS chip on each listing request card.
- If ATS_PENDING: sees callout + "Upload ATS Document" button.
- If ATS_REJECTED: sees callout + rejection reason + "Re-upload ATS Document".
- If ATS_APPROVED: sees "View ATS Documents" only.
- Clicking CTA opens the documents dialog and does NOT trigger 403.
- Seller can upload ATS doc (category forced to ATTACHMENT).
- Seller can see uploaded docs immediately in the dialog list.

### 7) Quick manual tests

- As user role:
  - Create a listing request
  - Confirm status renders as ATS_PENDING (or pending)
  - Upload a PDF in ATS dialog -> appears in list
- Simulate ATS_REJECTED (if you have a record): ensure reason displays
- Simulate ATS_APPROVED: ensure no upload callout

Deliverables:

- Updated seller listing requests page + any dialog prop adjustments to support "ATS mode".
- No breaking changes to admin/staff listing requests pages.

---

## Ticket 004d (Frontend) — Admin/Staff UI for ATS workflow (Listing Requests) - Sequence 2

Goal:
Implement Admin/Staff interface to process listing requests by:

1. Viewing ATS documents for a listing request
2. Approving ATS (sets status ATS_APPROVED)
3. Rejecting ATS (sets status ATS_REJECTED + requires reason)
   Also show current ATS status in the table/list.

Context:

- Backend endpoints exist:
  - GET /api/listing-requests (staff/admin list)
  - POST /api/listing-requests/:id/approve
  - POST /api/listing-requests/:id/reject body: { reason }
- ATS documents are stored in Document Library:
  - module=PROPERTY_REQUEST
  - ownerType=PropertyListingRequest
  - ownerId=<listingRequestId>
- Staff/Admin can view docs for any listing request.

Scope:
Frontend only. No infra changes. Keep seller pages intact.

### 1) Locate Staff/Admin page

Find the staff listing request management page, likely one of:

- frontend/src/pages/StaffListingRequests.jsx
- frontend/src/pages/AdminListingRequests.jsx
  or a shared component used by both.

### 2) Add ATS status column

In the table/list, add a column:

- "ATS Status" with a Chip:
  - ATS_PENDING -> "ATS Pending" (warning/info)
  - ATS_APPROVED -> "ATS Approved" (success)
  - ATS_REJECTED -> "ATS Rejected" (error)
    Fallback if empty -> treat as ATS_PENDING.

If ATS_REJECTED, optionally show tooltip or subtext: rejection reason.

### 3) Add row actions: Documents, Approve, Reject

For each row:
A) "Documents" button

- opens existing ListingRequestDocumentsDialog (reuse existing)
- configure dialog in ATS mode:
  - title "Authority to Sell Documents"
  - module=PROPERTY_REQUEST
  - ownerType=PropertyListingRequest
  - ownerId=row.\_id
  - category filter default ATTACHMENT (do NOT hard-lock for staff if you prefer, but recommended to default to ATTACHMENT)

B) "Approve ATS" button

- Enabled only when:
  - status is ATS_PENDING or ATS_REJECTED
- When clicked:
  - Call POST /api/listing-requests/:id/approve
  - On success: refresh list + show snackbar "ATS approved"

C) "Reject ATS" button

- Enabled only when:
  - status is ATS_PENDING or ATS_REJECTED
- When clicked:
  - Open a modal/dialog that requires a reason (TextField required)
  - On submit:
    - Call POST /api/listing-requests/:id/reject with JSON { reason }
    - On success: refresh list + show snackbar "ATS rejected"

### 4) Guard rails (important)

- Before allowing Approve:

  - Best UX: check ATS document exists by listing documents first.
  - Implementation options: 1) Lightweight: when user clicks Approve, first GET document-library for ownerId; if empty -> block and show "ATS document required" 2) Better: show an inline indicator in row "Docs: N" by querying docs count (optional; only if easy)
    Do at least option (1).

- Reject must enforce non-empty reason (frontend validation).

### 5) Refresh strategy

After approve/reject:

- Refresh the listing requests list from API (refetch)
- Keep loading state per-row to avoid UI freeze

### 6) Acceptance criteria

- Staff/Admin sees ATS status for each listing request.
- Staff/Admin can open ATS Documents dialog per row.
- Approve calls backend and updates row status to ATS_APPROVED.
- Reject requires reason and updates row status to ATS_REJECTED, showing reason.
- Approve is blocked if no ATS docs exist (clear error message).
- No changes to seller “My Listing Requests” behavior in this ticket.

### 7) Manual tests

- As staff/admin:
  - Open Listing Requests page, confirm list loads
  - Pick a listing with ATS doc:
    - Approve -> status becomes ATS_APPROVED
  - Reject:
    - Enter reason -> status becomes ATS_REJECTED
  - Approve with zero docs -> blocked with message

Deliverables:

- Updated Staff/Admin listing requests page with status chip + actions + reject modal.
- Uses existing document dialog components; no duplication.

---

## Ticket 004d (Backend) — Sequence 3: ATS workflow hardening + audit

Goal:
Harden the Authority-to-Sell (ATS) workflow in backend so it is enforced server-side (not only UI):

1. Seller can upload ATS doc ONLY for their own listing request
2. Staff/Admin can approve/reject ONLY if ATS doc exists (approve) and reason provided (reject)
3. Seller cannot bypass ATS by directly creating/activating a Property listing without ATS approval
4. Add audit log records for upload/approve/reject actions

Context:

- Listing request model: PropertyListingRequest
  - fields added earlier: atsApprovedBy, atsApprovedAt, atsRejectedReason, status (ATS_PENDING/ATS_APPROVED/ATS_REJECTED)
- Document Library:
  - module = PROPERTY_REQUEST
  - ownerType = PropertyListingRequest
  - ownerId = <listingRequestId>
  - ATS doc category should be ATTACHMENT (preferred)

Existing endpoints:

- POST /api/listing-requests (seller create)
- GET /api/listing-requests/mine
- GET /api/listing-requests (staff/admin)
- POST /api/listing-requests/:id/approve
- POST /api/listing-requests/:id/reject
- Document library routes already exist and have role/module checks (004b)

Constraints:

- No infra changes.
- Keep existing API response style (JSON).
- Keep role logic consistent with accessPolicies.js

---

### 1) Enforce seller ownership on ATS document uploads (server-side)

In documentLibraryRoutes.js (or the policy layer used by uploads):

- For module === MODULES.PROPERTY_REQUEST:
  - If role is NOT staff/admin:
    - Require ownerId
    - Find PropertyListingRequest by ownerId and ensure createdBy == req.user.id
    - If not owned -> 403

Also enforce ATS doc category:

- For module PROPERTY_REQUEST uploads (seller):
  - Allow only category = ATTACHMENT
  - If category missing, default to ATTACHMENT
  - If category != ATTACHMENT -> 400 with message "ATS must be uploaded as ATTACHMENT"

(Staff/Admin may upload any category; seller restricted.)

---

### 2) Approval endpoint validation

In listingRequestController approve handler:

- Require staff/admin role (existing)
- Before approving:
  - Verify listing request exists
  - Verify ATS document exists in Document collection:
    - module=PROPERTY_REQUEST
    - ownerType="PropertyListingRequest"
    - ownerId=<id>
    - category="ATTACHMENT" (ATS)
  - If none: return 400 { message: "ATS document is required before approval" }
- When approving:
  - status = "ATS_APPROVED"
  - atsApprovedBy=req.user.id
  - atsApprovedAt=now
  - clear atsRejectedReason (optional)
- record audit log:
  - action: "ATS_APPROVED"
  - actor: req.user.id
  - context: { listingRequestId }

---

### 3) Reject endpoint validation

In listingRequestController reject handler:

- Require staff/admin role
- Require reason in body (non-empty string, trim)
  - if missing -> 400 { message: "Rejection reason is required" }
- Update:
  - status="ATS_REJECTED"
  - atsRejectedReason=reason
  - (do NOT set atsApprovedBy/At)
- record audit log:
  - action: "ATS_REJECTED"
  - actor: req.user.id
  - context: { listingRequestId, reason }

---

### 4) Prevent bypass: property creation/publish must require ATS_APPROVED

Find any endpoint that creates a Property from listing request OR allows seller to "publish" / "convert" a request:

- If there is a route like POST /api/properties or POST /api/properties/from-request, etc:
  - If request-based: enforce that request.status === "ATS_APPROVED" before allowing publish/creation
  - else return 403 { message: "ATS approval required" }

If there is no conversion endpoint yet, add a TODO comment only. Do not invent new flows.

---

### 5) Add a helper function (clean)

Create a helper in backend/src/utils/ats.js or inside controller:

- async function hasATS(id) -> boolean
  - query Document collection as above
    Reuse in approve + (optional) other places.

---

### 6) Tests (manual / Postman)

As seller:

- Upload ATS doc for own request -> 201
- Upload ATS doc for another user’s request -> 403
- Upload ATS with category=PHOTO -> 400

As staff/admin:

- Approve without ATS doc -> 400
- Approve with ATS doc -> 200 + status becomes ATS_APPROVED
- Reject without reason -> 400
- Reject with reason -> 200 + status ATS_REJECTED

Deliverables:

- Updated documentLibrary upload enforcement for PROPERTY_REQUEST ownership + category.
- Updated listing request approve/reject endpoints with validations.
- Audit log entries for approve/reject (and upload if not already recorded).

---

## Sequence 1 — Regression guards for role-based UI + auth

Goal:
Prevent future regressions where:

- logged-in users render PUBLIC menus
- role is missing/unknown causing unpredictable UI behavior

### Frontend: TopBar + ProtectedRoute guard

Files:

- frontend/src/components/TopBar.jsx
- frontend/src/components/ProtectedRoute.jsx (or equivalent)
- frontend/src/context/AuthContext.jsx (if needed)

Implement:

1. Define allowed roles:
   const ALLOWED_ROLES = ["user","staff","admin"];

2. When user is present:

   - if role is missing OR not in ALLOWED_ROLES:
     - call logout()
     - navigate("/login")
     - show snackbar/toast: "Session invalid. Please log in again."
     - also console.warn with user object (for dev)

3. Ensure role-based menu rendering always uses:

   - role = user?.role ?? "public"
   - if role not allowed -> treat as invalid session (logout as above)
   - do NOT silently treat unknown role as public

4. ProtectedRoute:
   - If page requires auth and user exists but role invalid -> force logout + redirect to /login
   - If page has role restrictions (e.g. staff/admin pages), ensure:
     - user role is checked against allowed roles list passed in props.

### Backend: authenticate guard

File:

- backend/src/middleware/auth.js

Implement:

1. After loading user from DB:
   - validate user.role in ["user","staff","admin"]
   - if invalid -> return 401 { message: "Invalid role" }
2. Keep response consistent with existing auth errors.
3. Do NOT change JWT structure.

Acceptance tests:

- If DB user role is accidentally set to "weird", login token exists but any protected call returns 401.
- Frontend detects invalid role and logs user out, redirecting to /login with message.
- No regressions to normal user/staff/admin flows.

---

## Ticket 004e — Publish Listing After ATS Approval

(Convert PropertyListingRequest → Property + control public visibility)

### Goal

Enable staff/admin to **publish a property listing** ONLY after:

- ATS is approved (`status === ATS_APPROVED`)
- Listing request is converted into a real `Property`
- Property becomes publicly visible in `/properties`
  Prevent all bypasses.

This completes the Authority-to-Sell workflow end-to-end.

---

## Domain rules (strict)

1. A seller creates a PropertyListingRequest (draft).
2. Seller uploads ATS.
3. Staff/Admin approves ATS.
4. ONLY THEN:
   - Staff/Admin can publish the listing
   - A Property record is created
   - Listing becomes visible to public
5. Sellers can NEVER publish directly.

---

## Backend implementation

### 1) PropertyListingRequest model (if not yet)

Ensure it contains:

- status (ATS_PENDING / ATS_APPROVED / ATS_REJECTED)
- publishedPropertyId (ObjectId, ref Property, optional)
- publishedAt (Date, optional)

If already present, reuse — do not duplicate.

---

### 2) New endpoint: Publish listing

File:

- backend/src/routes/listingRequestRoutes.js
- backend/src/controllers/listingRequestController.js

Add endpoint:

POST /api/listing-requests/:id/publish

Middleware:

- authenticate
- authorizeRoles("staff","admin")

Controller logic:

1. Load listing request by id
   - if not found → 404
2. Validate:
   - status === "ATS_APPROVED"
   - publishedPropertyId is NOT already set
   - else → 400 with clear message
3. Create Property using data from listing request:
   - title
   - location
   - price
   - description
   - tags
   - earnestMoneyRequired (if applicable — staff-controlled)
   - status = "AVAILABLE"
   - metadata.source = "PROPERTY_REQUEST"
   - metadata.requestId = listingRequest.\_id
4. Save Property
5. Update listing request:
   - publishedPropertyId = property.\_id
   - publishedAt = now
6. Audit log:
   - action = "PROPERTY_PUBLISHED"
   - actor = req.user.id
   - context = { listingRequestId, propertyId }
7. Return created Property

---

### 3) Enforce backend safety

- If publish called before ATS_APPROVED → 403 or 400
- If already published → 409 Conflict
- Sellers (role=user) must NEVER pass this endpoint

---

## Frontend implementation (Admin/Staff)

### 4) Staff Listing Requests UI

File:

- frontend/src/pages/StaffListingRequests.jsx

For each listing request row:

- If status === ATS_APPROVED AND publishedPropertyId is empty:
  - Show primary CTA: "Publish Listing"
- If already published:
  - Show label "Published"
  - Disable publish button

On click:

- Confirm dialog:
  "This will publish the property and make it publicly visible. Continue?"
- Call:
  POST /api/listing-requests/:id/publish
- On success:
  - Show success snackbar
  - Refresh table
  - Optionally link to Property detail page

---

### 5) Public visibility rules

Ensure:

- `/api/properties` list shows ONLY:
  - Property.status === "AVAILABLE"
- Draft/unpublished listing requests NEVER appear publicly
- Public never sees PropertyListingRequest records

---

### 6) Optional (nice-to-have)

- When published:
  - Copy ATS documents to Property documents (optional, TODO comment allowed)
  - Or keep ATS docs attached only to request (acceptable)

---

## Acceptance criteria

Backend:

- Cannot publish without ATS approval
- Cannot publish twice
- Property is created correctly
- Audit log recorded

Frontend:

- Staff/Admin sees Publish CTA only when valid
- Publish works and updates UI
- Public can see new property immediately in /properties

Security:

- Seller cannot publish (403)
- Public cannot access publish endpoint

---

## Manual test checklist

1. Create listing request as seller
2. Upload ATS
3. Approve ATS as staff
4. Publish listing as staff
5. Open /properties (public) → listing visible
6. Attempt publish again → blocked
7. Attempt publish as seller → blocked

---

Deliverables:

- New publish endpoint
- Staff UI CTA
- Property creation wired correctly
- No regression to existing flows

---

## Ticket 004f — Add Photos to Create Listing Request (max 4) and carry over on Publish

### Problem

Published properties have no photos because Create Listing Request UI does not allow photo upload.
We must allow seller/user to upload up to 4 photos at listing-request stage, store them via existing Document Library, and then copy/link them to the created Property during publishing.

### Constraints

- Reuse existing Document Library module (no new upload system).
- Photos must be visible to: request owner (seller) + staff/admin.
- Public must NOT see request documents.
- When publishing (004e), the Property should show these photos.
- Max 4 photos per listing request.

---

# Backend changes

## A) Document library constants

File: backend/src/constants/documentLibrary.js

- Ensure MODULES includes PROPERTY_REQUEST (already exists)
- Ensure CATEGORIES.PROPERTY_REQUEST includes "PHOTO" (already exists)
- Ensure REGISTRY[PROPERTY_REQUEST] allows ownerType PROPERTY_REQUEST + category PHOTO.

## B) Enforce max 4 photos (PROPERTY_REQUEST)

File: backend/src/routes/documentLibraryRoutes.js OR controller/policy layer
Add validation before uploadDocuments:

- If module === "PROPERTY_REQUEST" and category === "PHOTO":
  - count existing docs for (module, ownerId, category="PHOTO")
  - plus req.files.length must be <= 4
  - else return 400 with message: "Maximum 4 photos allowed for listing request"

(Use Document model query.)

---

# Frontend changes

## C) Create Listing Request page: add photo uploader

File: frontend/src/pages/CreateListingRequest.jsx

1. After successful POST /api/listing-requests (create request),
   capture returned request id: listingRequest.\_id

2. Add a "Photos (max 4)" section:

   - Use existing shared DocumentUploader and DocumentList components (already used elsewhere)
   - Configure them for:
     module="PROPERTY_REQUEST"
     ownerType="PropertyListingRequest" (or whatever your OWNER_TYPES uses for PROPERTY_REQUEST)
     ownerId=<listingRequestId>
     category="PHOTO"
     Require description per file (existing behavior ok)
   - Limit file selector to accept images only:
     accept="image/\*"
   - UI should prevent selecting >4 total:
     show remaining slots: (4 - existingCount)
     disable upload when count reached 4

3. UX flow:
   - Step 1: create request (title/location/price/desc/tags)
   - Step 2: show photo upload section once request is created
   - Allow user to upload now or later from "My Listing Requests" page

---

## D) My Listing Requests page: add "Photos" CTA (same as ATS docs pattern)

File: frontend/src/pages/MyListingRequests.jsx

- Add button per request: "Photos"
- Opens dialog using DocumentUploader/DocumentList configured as:
  module="PROPERTY_REQUEST"
  ownerType="PropertyListingRequest"
  ownerId=request.\_id
  category="PHOTO"
- Enforce max 4 (UI) and show message if max reached.

---

# Publish flow update (carry photos to Property)

## E) When staff/admin publishes a request, copy photos to Property

File: backend/src/controllers/listingRequestController.js (publish endpoint)

After Property is created:

1. Find listing-request PHOTO docs:
   Document.find({ module: "PROPERTY_REQUEST", ownerId: listingRequest.\_id, category: "PHOTO" })

2. For each found doc, create a Property PHOTO doc:
   - module: "PROPERTY"
   - ownerType: "Property"
   - ownerId: property.\_id
   - category: "PHOTO"
   - description/label/originalName/filePath/mimeType/size copied
   - uploadedBy copied (or set to publisher)
     (Use Document.create for each / bulk insert.)

This makes Property photos appear in existing Property pages that read PROPERTY module photos.

Do NOT expose listing request docs publicly.

---

# Acceptance criteria

1. Seller can create listing request and upload up to 4 photos.
2. Seller can manage photos later via My Listing Requests -> Photos.
3. Uploading photo #5 fails:
   - UI blocks and backend returns 400 if bypassed.
4. When staff publishes request:
   - Property is created
   - PROPERTY photos exist and show in Properties list/cards/details as per current UI
5. Public sees photos in published properties; public never sees request documents.

---

# Manual tests

- As seller:
  - Create listing request -> upload 2 photos
  - Verify DocumentList shows them
  - Try upload 3 more -> must block at 4
- As staff:
  - Approve ATS
  - Publish request
  - Go to /properties (public/incognito) -> new property shows photos

---

## Fix 004e — Published Property missing photos copied from Listing Request

### Problem

Seller uploaded photos during Listing Request creation (stored in Document Library under module=PROPERTY_REQUEST, category=PHOTO, ownerId=<listingRequestId>).
After staff/admin publishes the request (convert ListingRequest -> Property), the newly created Property shows no photos.
This means publish logic is not copying/mapping the PHOTO documents from PROPERTY_REQUEST to PROPERTY.

### Goal

When a listing request is published, ALL its PHOTO docs must be transferred (or duplicated as new Document records) to the created Property so the Property UI (which reads PROPERTY module photos) shows them.

### Requirements (must implement)

1. On publish endpoint (approve/publish handler), after creating the Property record:

   - Query Document library for request photos:
     Document.find({
     module: "PROPERTY_REQUEST",
     ownerId: listingRequest.\_id,
     category: "PHOTO"
     })
   - For each doc found, create a NEW Document record for the property:
     {
     module: "PROPERTY",
     ownerType: "Property",
     ownerId: property.\_id,
     category: "PHOTO",
     description: doc.description,
     label: doc.label,
     filePath: doc.filePath,
     mimeType: doc.mimeType,
     originalName: doc.originalName,
     size: doc.size,
     uploadedBy: doc.uploadedBy || listingRequest.createdBy
     }
   - Insert using insertMany for performance.

2. Also carry across non-photo attachments if needed later, but for this fix at minimum PHOTO category must be copied.

3. Do NOT delete the original PROPERTY_REQUEST docs. Keep them as request history.
4. Ensure the publish response returns the created property id and ideally photo count copied (optional).

### Where to implement

Backend:

- Find publish/approve handler used to convert ListingRequest to Property:
  likely backend/src/controllers/listingRequestController.js
  or backend/src/controllers/propertyListingRequestController.js
  or backend/src/routes/listingRequestRoutes.js -> controller call.
  Search for keywords: "publish", "convert", "Property.create", "listingRequest", "PROPERTY_REQUEST".

Document model:

- backend/src/models/Document.js

Constants:

- backend/src/constants/documentLibrary.js provides MODULES/OWNER_TYPES.

### Edge cases to handle

- If no photos exist: publish still works (copy step does nothing).
- Only copy docs where category==="PHOTO" and module==="PROPERTY_REQUEST".
- Ensure ownerId comparison uses ObjectId properly (String() ok).
- If publish currently creates Property docs BEFORE ATS approval checks, keep existing checks intact.

### How to test

1. As seller: create listing request + upload 2-4 photos (PROPERTY_REQUEST/PHOTO).
2. As staff/admin: publish the request.
3. Go to /properties as public and as staff: the created Property card/details must display the photos.
4. Verify in Mongo:
   - Documents exist for PROPERTY_REQUEST (ownerId=requestId, category=PHOTO)
   - New Documents exist for PROPERTY (ownerId=propertyId, category=PHOTO)
   - filePath values match and images load.

### Deliverables

- Backend publish handler updated with the copy logic (insertMany).
- Add minimal logging or response field to confirm number of photos copied (optional).

---

✅ Cursor Prompt — Fix 004e Photos Carry-Over + Prevent Duplicate Listing Requests

You are working in the myrealtor MERN repo.

Context

We have PropertyListingRequest (ATS workflow). During Create Listing Request, the user can upload up to 4 photos. These photos are stored in Document Library as:

module = PROPERTY_REQUEST

category = PHOTO

ownerId = <listingRequestId>

ownerType = PropertyListingRequest (or OWNER_TYPES.PROPERTY_REQUEST)

When staff/admin approves/publishes the listing request, the backend converts it into a Property record.
✅ Publishing works, but the published Property does not show the photos.

Also: submitting Create Listing Request creates two duplicate records (same data).

GOALS (Acceptance Criteria)
A) Photos appear on published Property

After publish/approve:

All request PHOTO docs are duplicated into PROPERTY module docs:

from module=PROPERTY_REQUEST, category=PHOTO, ownerId=requestId

to module=PROPERTY, category=PHOTO, ownerType=Property, ownerId=propertyId

The published Property record must have its image field populated with photo paths so the existing Property UI will render them.

Identify what field the UI uses (commonly images, photos, imageUrls). Populate that.

Use up to 4 photos.

Use the Document filePath as the image value.

B) Create Listing Request must not create duplicates

Submitting Create Listing Request must create only one record even if:

the user double-clicks submit

React StrictMode triggers double invoke

API call is accidentally triggered twice

Implement both client-side guard + backend idempotency.

TASK A — Fix publish logic to carry over photos

1. Find where publish happens

Search backend for:

approve

publish

atsApproved

Property.create

listing request controller
This is likely in backend/src/controllers/listingRequestController.js (or similar).

2. On publish: copy photos from request → property

After you create the Property record, do:

(a) Fetch request photos:
import Document from "../models/Document.js";
import { MODULES } from "../constants/documentLibrary.js";

const reqPhotos = await Document.find({
module: MODULES.PROPERTY_REQUEST,
ownerId: listingRequest.\_id,
category: "PHOTO",
});

(b) Duplicate them as Property documents:
if (reqPhotos.length) {
await Document.insertMany(
reqPhotos.slice(0,4).map((d) => ({
module: MODULES.PROPERTY,
ownerType: "Property",
ownerId: property.\_id,
category: "PHOTO",
label: d.label,
description: d.description || "Photo",
filePath: d.filePath,
mimeType: d.mimeType,
originalName: d.originalName,
size: d.size,
uploadedBy: d.uploadedBy || listingRequest.createdBy,
}))
);
}

(c) Populate Property image field used by UI

Inspect:

backend/src/models/Property.js

frontend property card/list page (e.g. frontend/src/pages/Properties.jsx)

Determine which field drives the photos display (likely images array). Populate it:

property.images = reqPhotos.slice(0,4).map((d) => d.filePath);
await property.save();

If the schema uses another name (e.g. photos, imageUrls), populate that field instead.

⚠️ Ensure file paths are valid for the frontend image src logic (usually /uploads/...).

TASK B — Prevent duplicate ListingRequest creation

1. Frontend guard (CreateListingRequest page)

Locate frontend/src/pages/CreateListingRequest.jsx (or similar).

Fix submission so the POST happens only once:

Use only form onSubmit={handleSubmit} OR only button onClick, not both.

Add a submitting state guard so second submit returns immediately.

Disable submit button while submitting.

Example pattern:

const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
e.preventDefault();
if (submitting) return;
setSubmitting(true);
try {
// POST
} finally {
setSubmitting(false);
}
};

Button:

<Button type="submit" disabled={submitting}>
  {submitting ? "Submitting..." : "Submit Request"}
</Button>

2. Add Idempotency-Key header from frontend

Generate once per form submission attempt:

const idemKeyRef = useRef(null);
if (!idemKeyRef.current) idemKeyRef.current = crypto.randomUUID();

await api.post("/listing-requests", payload, {
headers: { "Idempotency-Key": idemKeyRef.current }
});

Reset idemKeyRef.current = null after success if you want.

3. Backend idempotency

In the backend create endpoint for listing requests (POST /api/listing-requests):

Read header Idempotency-Key

Store it on the created document

Add compound unique index: (createdBy, idempotencyKey) (sparse) so duplicates return existing record.

Model change (PropertyListingRequest schema)

Add:

idempotencyKey: { type: String },

Add index:

schema.index({ createdBy: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

Controller create logic

Before creating:

const idemKey = req.headers["idempotency-key"];
if (idemKey) {
const existing = await PropertyListingRequest.findOne({
createdBy: req.user.id,
idempotencyKey: idemKey,
});
if (existing) return res.status(200).json(existing);
}

When creating, include:

idempotencyKey: idemKey,

Also add fallback “recent duplicate protection” if no key:

check same user + same propertyDraft fields created in last 5 seconds → return existing.

TESTS (must run)
Photos

Create listing request + upload 1–4 photos.

Publish/approve.

Check Property page shows photos.

Confirm Document records exist for Property:

module=PROPERTY, category=PHOTO, ownerId=<propertyId>

Duplicates

Submit request once → only 1 record.

Double-click submit quickly → still only 1 record.

Refresh after submit → no second record.

Deliverables

Backend publish now carries over photos into Property record + Document Library

Frontend CreateListingRequest guarded + disabled submit

Backend idempotency implemented with index

Update CHANGELOG

Implement now.

---

✅ Cursor Prompt — Fix Duplicate PropertyListingRequest Creation (2 records created)

You are working in the myrealtor MERN repo.

Problem

When a client submits Create Listing Request, the backend creates two PropertyListingRequest records with the same information.

This still happens even after basic UI changes, so fix must be definitive:

prevent double submission on the frontend

enforce idempotency on the backend

ensure only one record is created even if the request is sent twice

1. Identify the root cause (must do first)

Search for the Create Listing Request submission code and confirm whether the POST is being triggered twice due to:

onSubmit on <form> AND onClick on button calling the same handler

useEffect calling submit logic

React StrictMode double-call effect (dev only)

duplicate route wiring calling controller twice

API helper retrying (axios retry or interceptor)

backend route mounted twice (app.use("/api/listing-requests", ...) duplicated)

Required checks

Frontend

Find the file: frontend/src/pages/CreateListingRequest.jsx (or equivalent).

Confirm only ONE call exists to the POST function.

Add console.log("SUBMIT CALLED") inside handler temporarily to confirm only once.

Backend

Find route file for POST /api/listing-requests.

Confirm it’s mounted once in backend/src/app.js.

Add a console.log("CREATE LISTING REQUEST HIT", Date.now(), req.headers["idempotency-key"])
and confirm whether backend receives 2 calls.

2. Fix frontend: hard-stop double submission

In CreateListingRequest page:

Requirements

Use only <form onSubmit={handleSubmit}>

Button must be type="submit" ONLY

Remove any onClick={handleSubmit} if present

Add submitting guard + disable button

Add “once-only” idempotency key per attempt and reuse the same key even if user clicks twice

Implement exactly:
const [submitting, setSubmitting] = useState(false);
const idemKeyRef = useRef(null);

const handleSubmit = async (e) => {
e.preventDefault();
if (submitting) return;

if (!idemKeyRef.current) idemKeyRef.current = crypto.randomUUID();

setSubmitting(true);
try {
await api.post("/listing-requests", payload, {
headers: { "Idempotency-Key": idemKeyRef.current },
});
// on success: optionally clear key
idemKeyRef.current = null;
} finally {
setSubmitting(false);
}
};

Button:

<Button type="submit" disabled={submitting}>
  {submitting ? "Submitting..." : "Submit Request"}
</Button>

3. Fix backend: enforce idempotency (absolute requirement)

Even if the frontend still sends 2 POSTs, backend must return existing record and NOT create another.

3.1 Add idempotencyKey to PropertyListingRequest schema

File: backend/src/models/PropertyListingRequest.js

Add field:

idempotencyKey: { type: String },

Add unique sparse compound index:

schema.index(
{ createdBy: 1, idempotencyKey: 1 },
{ unique: true, sparse: true }
);

⚠️ Ensure index is on the same schema variable you export.

3.2 Controller create endpoint must return existing record

In the POST create controller for listing requests:

At the very beginning:

const idemKey = req.get("Idempotency-Key");
if (idemKey) {
const existing = await PropertyListingRequest.findOne({
createdBy: req.user.id,
idempotencyKey: idemKey,
});
if (existing) return res.status(200).json(existing);
}

When creating:

const doc = await PropertyListingRequest.create({
...data,
createdBy: req.user.id,
idempotencyKey: idemKey,
});

3.3 Handle duplicate-key error cleanly

If two requests race, Mongo will throw duplicate key error.
Catch it and return the existing record:

try {
// create
} catch (err) {
if (err.code === 11000 && idemKey) {
const existing = await PropertyListingRequest.findOne({
createdBy: req.user.id,
idempotencyKey: idemKey,
});
if (existing) return res.status(200).json(existing);
}
throw err;
}

4. Add a fallback duplicate guard (if Idempotency-Key missing)

If client didn’t send Idempotency-Key (older clients), prevent duplicates by checking “same payload created very recently”.

Example:

same createdBy

same propertyDraft.title/location/price

created within last 10 seconds

If found, return it instead of creating new.

5. Verify by testing (must do)
   Confirm backend receives 2 hits

Click submit once

If you see backend log twice, backend must still create only 1 record.

Expected outcomes

Submitting once creates 1 record

Double-clicking submit creates still 1 record

Refresh + submit again creates a new record (new key)

Deliverables

No duplicate PropertyListingRequest records are created anymore

Works even if backend receives the request twice

Update CHANGELOG with fix description

Implement now.

---

✅ Cursor Prompt — Fix “Create Listing Request” POST firing twice (duplicates)
Context

In My Listing Requests, after submitting Create Listing Request, I consistently see two identical records created (same title/location/price/desc). This happens immediately on submit. Screenshot confirms duplicates are created for the same request (“Lot of Lulu” appears twice).

Goal

Ensure that submitting Create Listing Request creates exactly ONE record, always.

Non-goals

Do NOT modify ATS workflow, publishing, or photo logic. Only fix duplicate creation.

Step 1 — Prove where the duplicate happens (required)
1A) Backend: confirm if server receives 2 POST calls

In the backend POST handler for /api/listing-requests, add a temporary log at the very start:

console.log("LISTING_REQUEST_CREATE HIT", {
t: Date.now(),
user: req.user?.id,
idem: req.get("Idempotency-Key"),
ip: req.ip,
});

Run locally and submit once.
✅ If this prints twice → frontend is sending twice (or route mounted twice).
✅ If this prints once but DB has two docs → backend code creates twice internally.

1B) Backend: ensure route is mounted only once

Open backend/src/app.js and verify /api/listing-requests is only mounted once.
If duplicated, remove one.

Step 2 — Fix frontend: ensure submit handler executes once (most likely root cause)

In frontend/src/pages/CreateListingRequest.jsx (or equivalent):

2A) Ensure there is ONLY ONE trigger

If there is a <form onSubmit={handleSubmit}>, the submit button MUST be type="submit" and must NOT call handleSubmit in onClick.

If there is no form, use ONLY onClick, not both.

Fix rule: pick one method only.

Example correct structure:

<form onSubmit={handleSubmit}>
  ...
  <Button type="submit" disabled={submitting}>Submit</Button>
</form>

Remove any pattern like this (causes double call):

<form onSubmit={handleSubmit}>
  <Button type="submit" onClick={handleSubmit}>Submit</Button>
</form>

2B) Add a hard guard against double submit

Add:

const [submitting, setSubmitting] = useState(false);
const submitLockRef = useRef(false);

Then in submit:

const handleSubmit = async (e) => {
e.preventDefault();

if (submitLockRef.current || submitting) return; // hard lock
submitLockRef.current = true;
setSubmitting(true);

try {
// existing api call
} finally {
setSubmitting(false);
setTimeout(() => { submitLockRef.current = false; }, 1500); // prevent rapid double fire
}
};

Step 3 — Add backend idempotency (must be implemented as safety net)

Even if frontend accidentally sends twice, backend must only create one.

3A) Schema update: add idempotencyKey unique per user

File: backend/src/models/PropertyListingRequest.js

Add:

idempotencyKey: { type: String },

Add index:

schema.index({ createdBy: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

3B) Controller: reuse record if key already used

In POST create controller:

const idemKey = req.get("Idempotency-Key");

if (idemKey) {
const existing = await PropertyListingRequest.findOne({
createdBy: req.user.id,
idempotencyKey: idemKey,
});
if (existing) return res.status(200).json(existing);
}

When creating:

const rec = await PropertyListingRequest.create({
...payload,
createdBy: req.user.id,
idempotencyKey: idemKey,
});
return res.status(201).json(rec);

Catch duplicate key race:

} catch (err) {
if (err.code === 11000 && idemKey) {
const existing = await PropertyListingRequest.findOne({
createdBy: req.user.id,
idempotencyKey: idemKey,
});
if (existing) return res.status(200).json(existing);
}
throw err;
}

Step 4 — Frontend must send Idempotency-Key

In CreateListingRequest submit API call, generate once per attempt:

const idemRef = useRef(null);
if (!idemRef.current) idemRef.current = crypto.randomUUID();

await api.post("/listing-requests", payload, {
headers: { "Idempotency-Key": idemRef.current },
});

After success, reset:

idemRef.current = null;

Step 5 — Verify

Submit once.

Backend log should show one HIT (or if two hits still occur, DB must still create only one).

Refresh “My Listing Requests” → only one record exists for that submission.

Deliverable

A commit that ensures: Create Listing Request produces exactly one PropertyListingRequest always.

If you want, I can also give you a super quick “minimal fix” prompt (frontend-only guard) — but the above is the “never again” fix (frontend + backend).

---

Here is **ONE SINGLE COPY-PASTE BLOCK** you can drop directly into **Cursor**.
This is rewritten to be **explicit, task-specific, and final** — Cursor is instructed to **investigate, prove the root cause, and fix it with backend idempotency + frontend safeguards** so the duplicate record issue is eliminated permanently.

---

````md
# 🔴 FINAL FIX REQUIRED — Duplicate ListingRequest Records (Ticket 004e)

## Problem (Confirmed)

When a user submits **Create Listing Request**, TWO identical `PropertyListingRequest` records are created.
This is visible in:

- Seller “My Listing Requests”
- Staff “Listing Requests” table
- One record may be ATS Approved + Published while the duplicate remains

This must be fixed WITH FINALITY.

---

## NON-NEGOTIABLE OUTCOME

After this fix:

- ONE user submit = EXACTLY ONE DB record.
- Even if:
  - React fires twice
  - User double-clicks
  - Network retries occur
- Backend MUST still guarantee a single record.

Frontend fixes alone are NOT sufficient.

---

# PHASE A — ROOT CAUSE INVESTIGATION (MANDATORY)

### A1. Identify the exact create flow

Locate and list:

- Backend route handling creation:
  `POST /api/listing-requests`
- Backend controller function used
- Frontend function that calls it (CreateListingRequest submit handler)

---

### A2. Prove whether backend is hit twice or creates twice

Add TEMP logs at the VERY TOP of the backend create controller:

```js
console.log("[LR-CREATE] HIT", {
  ts: new Date().toISOString(),
  user: req.user?.id,
  ip: req.ip,
  idem: req.get("Idempotency-Key"),
});
```
````

Also log:

```js
console.log("[LR-CREATE] BEFORE CREATE");
console.log("[LR-CREATE] AFTER CREATE", record?._id);
```

Submit ONCE and observe logs.

✔ If **2 HIT logs** → frontend / routing / duplicate call
✔ If **1 HIT log but 2 records** → backend logic bug

DO NOT GUESS — PROVE IT.

---

### A3. Verify routes are not mounted twice

Inspect:

- `app.js`
- route imports
- ensure listing request routes are mounted ONCE only

---

### A4. Verify frontend submit is not firing twice

Add TEMP log inside submit handler:

```js
console.log("[LR-FE] submit fired", Date.now());
```

Check for:

- `<form onSubmit>` AND button `onClick` both calling submit
- submit inside `useEffect`
- React StrictMode double execution in dev
- retry interceptors re-POSTing

---

# PHASE B — FINAL FIX (EVEN IF FRONTEND IS FAULTY)

## B1. BACKEND — Enforce idempotency (MANDATORY)

### Model update (`PropertyListingRequest`)

Add:

- `clientRequestId: String`

Create UNIQUE compound index:

```js
schema.index(
  { createdBy: 1, clientRequestId: 1 },
  { unique: true, sparse: true }
);
```

---

### Controller logic update

In `POST /api/listing-requests`:

1. Read idempotency key from:

   - Header: `Idempotency-Key`
   - OR body: `clientRequestId`

2. If key exists:

   - Check if record already exists for `(createdBy, clientRequestId)`
   - If found → return it (HTTP 200)

3. On create:

   - Persist `clientRequestId`
   - If Mongo throws duplicate key error (11000):

     - Fetch existing record
     - Return it (HTTP 200)

4. Only the FIRST request may return `201 Created`.

This guarantees **no duplicates ever**.

---

## B2. BACKEND — Safety fallback (recommended)

If idempotency key is missing:

- Detect duplicate payloads by:

  - same `createdBy`
  - same `title + location + price`
  - created within last 10 seconds

- If found → return existing record instead of creating a new one

---

## B3. FRONTEND — Single submit + idempotency key

### Submit guard

- Ensure ONLY ONE submit mechanism exists

  - Either `<form onSubmit>` OR button `onClick`

- Add:

  - `isSubmitting` state
  - ref-based submit lock

---

### Idempotency key generation

On submit:

```js
const clientRequestId = crypto.randomUUID();
```

Send it via:

- HTTP header `Idempotency-Key`
- AND body `clientRequestId`

Reset key only after success.

---

## B4. Remove any chained or duplicate POST calls

Fix any of:

- submit + navigation triggering POST twice
- retry interceptors replaying POST
- `useEffect` calling create
- StrictMode side effects triggering submit logic

---

# PHASE C — VERIFICATION (REQUIRED)

1. Submit listing request ONCE.
2. Confirm:

   - Backend logs show either:

     - one HIT
     - or multiple HITs returning SAME record ID

3. Confirm:

   - Staff table shows ONE row

4. Double-click submit rapidly → STILL only one record

Remove TEMP logs after verification.

---

## DELIVERABLES

- Backend idempotency implemented
- Frontend submit guard implemented
- Duplicate creation IMPOSSIBLE
- Update `CHANGELOG.md`:
  “Fix: prevent duplicate listing request creation via backend idempotency + frontend submit guard”

DO NOT STOP UNTIL DUPLICATES ARE IMPOSSIBLE.

```

---

If you want, next we can:
- Add **DB cleanup migration** to auto-merge existing duplicates
- Add **audit log protection**
- Or move to **004f (post-publish buyer inquiry flow)**
```

---

TICKET 004f — Published Property Lifecycle Controls (Staff/Admin)

GOAL
Implement proper lifecycle management for published properties after ATS approval.
Staff/Admin must be able to control visibility and sales state without creating duplicate records or breaking public visibility rules.

SCOPE (Backend + Frontend)

---

1. PROPERTY LIFECYCLE STATES

---

Extend Property model to support lifecycle fields:

- published (boolean)
- publishedAt (date, nullable)
- status (enum):
  - DRAFT
  - PUBLISHED
  - RESERVED
  - SOLD
  - WITHDRAWN

Rules:

- Only one Property record per approved ListingRequest
- published === true only when status === PUBLISHED
- SOLD and WITHDRAWN properties must NOT be publicly visible
- RESERVED may remain visible but must be clearly labeled

---

2. BACKEND — API CHANGES

---

A. New staff/admin-only endpoints:

- POST /api/properties/:id/publish
- POST /api/properties/:id/unpublish
- POST /api/properties/:id/mark-sold
- POST /api/properties/:id/mark-reserved
- POST /api/properties/:id/withdraw

B. Enforce permissions:

- Only roles: ADMIN, STAFF
- Return 403 for all other roles

C. Idempotency & safety:

- Prevent publishing an already published property
- Prevent SOLD → PUBLISHED without explicit override (return 400)
- Do NOT create new Property records in these endpoints
- Always update existing Property by ID

D. Audit logging:

- Record action, propertyId, actorId, timestamp
- Example actions:
  - PROPERTY_PUBLISHED
  - PROPERTY_UNPUBLISHED
  - PROPERTY_MARKED_SOLD
  - PROPERTY_MARKED_RESERVED
  - PROPERTY_WITHDRAWN

---

3. FRONTEND — STAFF UI

---

A. In Staff Property List / Detail View:
Show lifecycle controls based on current status:

- If DRAFT → show "Publish"
- If PUBLISHED → show "Unpublish", "Mark as Reserved", "Mark as Sold"
- If RESERVED → show "Mark as Sold", "Unpublish"
- If SOLD or WITHDRAWN → no publish actions

B. Confirmation modals required for:

- Publish
- Unpublish
- Mark as Sold
- Withdraw

C. Visual labels:

- Status badge (Published / Reserved / Sold / Withdrawn)
- Published date shown when applicable

---

4. FRONTEND — PUBLIC & USER VISIBILITY

---

A. Public (not logged in):

- Only see properties where:
  - published === true
  - status === PUBLISHED or RESERVED

B. Logged-in users:

- Same visibility as public
- PLUS their own ListingRequests (unchanged)

C. Staff/Admin:

- See all properties regardless of status

---

5. HARD CONSTRAINTS (DO NOT VIOLATE)

---

- DO NOT modify ATS approval logic
- DO NOT create duplicate Property records
- DO NOT expose unpublished properties publicly
- DO NOT rely on frontend-only checks; enforce in API
- Keep existing routes intact unless explicitly extending

---

6. ACCEPTANCE CHECKLIST

---

✔ Staff can publish/unpublish without duplicates  
✔ SOLD properties disappear from public listings  
✔ RESERVED properties remain visible but labeled  
✔ Public API never leaks unpublished data  
✔ Audit log records every lifecycle change

Implement cleanly, refactor where needed, and explain any non-obvious decisions in comments.
