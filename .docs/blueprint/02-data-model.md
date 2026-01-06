# Data Model (MongoDB / Mongoose)

This is the V0 canonical data model. Keep changes backward compatible.

## Core collections

### users

- \_id
- email
- passwordHash
- role: "admin" | "staff"
- name
- createdAt, updatedAt, lastLoginAt

### properties

- \_id
- title (required)
- location (required)
- price (required)
- status (enum):
  - DRAFT | AVAILABLE | RESERVED | UNDER_NEGOTIATION | SOLD | ARCHIVED
- description (optional)
- tags (optional string[])
- images (optional string[] storage paths)
- earnestMoneyRequired (boolean, default false)
- metadata (mixed)
- createdAt, updatedAt

Notes:

- Public listing default should show AVAILABLE only.
- SOLD/RESERVED/UNDER_NEGOTIATION are not actionable publicly.

### buyer_inquiries

- \_id
- propertyId (ref properties)
- buyer:
  - name
  - address
  - phone
  - email
- notes (optional)
- status: NEW | CONTACTED | CLOSED
- createdAt, updatedAt

### authority_to_sell

- \_id
- propertyId (ref properties)
- seller:
  - fullName
  - address
  - phone
  - email
- details:
  - titleNosTaxDec (string)
  - lotArea (string/number)
  - ownersNetPrice (number/string)
  - periodStart (optional)
  - periodEnd (optional)
  - remarks (optional)
- signature:
  - signedName (typed)
  - signedAt
  - consentChecked (boolean)
  - ipAddress (optional)
  - userAgent (optional)
- status: DRAFT | SUBMITTED | APPROVED | REVOKED
- finalPdf:
  - storageKey
  - url
  - version (integer)
  - finalizedAt
  - finalizedBy
- createdAt, updatedAt

### earnest_money_agreements

- \_id
- propertyId (ref properties)
- seller: { name, address }
- buyer: { name, address, phone, email }
- titleNo (string)
- areaSqm (number/string)
- earnestMoneyAmount (number)
- totalPurchasePrice (number)
- deedExecutionDeadline (date)
- status: DRAFT | FINAL | VOID
- finalPdf:
  - storageKey
  - url
  - version
  - finalizedAt
  - finalizedBy
- createdAt, updatedAt

### service_requests

Unified intake for APPRAISAL / TITLING / CONSULTANCY

- \_id
- type: APPRAISAL | TITLING | CONSULTANCY
- client:
  - name
  - address
  - phone
  - email
- property:
  - location (string)
  - lotAreaSqm (optional)
  - floorAreaSqm (optional)
  - timeOfBuild (optional)
  - lastMajorRepairDate (optional)
- status:
  - NEW | IN_REVIEW | APPOINTMENT_SET | IN_PROGRESS | READY_FOR_RELEASE | CLOSED
- createdAt, updatedAt

### request_documents

- \_id
- serviceRequestId (ref service_requests)
- documentTitle (required)
- fileType (PDF/JPG/PNG)
- storageKey / url
- uploadedBy (user id or null if public upload)
- uploadedAt

### appointments

- \_id
- serviceRequestId (optional)
- type: APPRAISAL | TITLING | CONSULTANCY | BROKERAGE_VIEWING
- clientName
- email
- phone
- requestedStartAt
- requestedEndAt
- confirmedStartAt (optional)
- confirmedEndAt (optional)
- status: REQUESTED | CONFIRMED | CANCELLED | COMPLETED
- notes (internal)
- createdAt, updatedAt

### appraisal_reports

- \_id
- serviceRequestId (ref service_requests)
- report sections:
  - introduction
  - propertyIdentification
  - purpose
  - highestAndBestUse
  - marketAnalysis
  - valuationApproach
  - valueConclusion
  - limitingConditions
  - certification (appraiser name/license/date)
- status: DRAFT | FINAL | RELEASED
- finalPdf:
  - storageKey
  - url
  - version
  - finalizedAt
  - finalizedBy
- releasedAt
- releasedBy

### audit_logs

- \_id
- entityType (PROPERTY, ATS, EARNEST, REQUEST, REPORT)
- entityId
- action (CREATE, UPDATE, FINALIZE, RELEASE, STATUS_CHANGE, DELETE)
- actorUserId (or SYSTEM)
- meta (json)
- createdAt
