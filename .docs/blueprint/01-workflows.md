# Workflows (V0)

## 1) Brokerage: Seller → Listing → Buyer inquiry → Sale

### Seller submission (Authority to Sell)

1. Seller provides property info and documents:
   - Title / Tax Declaration
   - Sketch plan
   - Vicinity map
   - Photos (optional)
2. Seller completes and signs Authority-to-Sell (typed signature + consent checkbox for V0).
3. Admin/staff reviews submission and marks as APPROVED.
4. Once approved, property can be PUBLISHED (AVAILABLE).

### Listing and marketing

- Admin/staff publishes the property listing on the website.
- Listing includes:
  - price, location, photos
  - Earnest Money Required: Yes/No
  - status label

### Buyer interest

1. Buyer browses listing.
2. Buyer submits interest form (name, address, phone, email, notes).
3. Admin/staff contacts buyer manually (V0).
4. Admin/staff updates inquiry status: NEW → CONTACTED → CLOSED.

### Earnest Money (conditional)

- Only if the listing indicates Earnest Money Required, or admin chooses:

1. Admin/staff creates Earnest Money Agreement draft using buyer + seller + property details.
2. Agreement is finalized to a PDF (immutable).
3. Payment and notarization remain offline.

### Sale completion

- Seller and buyer meet with broker and notary public for Deed of Absolute Sale (offline).
- After completion, admin sets listing status to SOLD.
- SOLD listings are not actionable (inquiry/apply disabled).

---

## 2) Property Appraisal request

1. Client fills appraisal request form:
   - Name, Address, Email, Phone
   - Location of property
   - Size/area (lot area; floor area if building)
   - Time of build (building only)
   - Last major repair date (optional)
2. Client uploads documents:
   - Title
   - Tax Declaration
   - Photos
3. Client requests appointment slot via website calendar.
4. Admin/staff confirms appointment; confirmation email is sent.
5. Payment handling (downpayment / balance) remains offline in V0.
6. Admin/staff prepares appraisal report inside system (structured sections) and finalizes PDF.
7. Admin/staff “releases” report; client can download.

---

## 3) Land Titling and Title Transfer request

1. Client fills request form:
   - Name, Address, Email, Phone
   - Location of property
2. Client uploads any number of documents:
   - Each upload must have a Document Title + file (PDF/JPG/PNG).
3. Client requests appointment slot.
4. Admin/staff confirms appointment; confirmation email is sent.
5. Rates can be shown on client page (optional display; V0 can be static info).

---

## 4) Consultancy

1. Client books appointment slot via online calendar.
2. Admin/staff confirms and sends email.
3. Notes handled manually (V0).

---

## Status rules (V0)

### Property status lifecycle

- DRAFT: internal only, not shown publicly
- AVAILABLE: publicly listed and actionable
- RESERVED: publicly visible only if explicitly filtered; actions disabled
- UNDER_NEGOTIATION: actions disabled
- SOLD: actions disabled; may be hidden by default
- ARCHIVED: internal only, not shown publicly

### Inquiry status

- NEW
- CONTACTED
- CLOSED

### Document finalization

- DRAFT records can be edited.
- FINAL PDFs are immutable; edits require creating a new version (v2, v3).
