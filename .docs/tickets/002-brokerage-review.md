# 0002 — Brokerage Workflow Review

**Status:** ✅ COMPLETED
**Version:** Backend 1.5.0 / Frontend 0.6.0
**Completed:** 2026-01-18

## This is the ticket holder for all brokerage workflow reviews and changes

## 1. Revision 1

- To review the workflow of the Brokerage workflow. Check per PRD and give me summary. Do not alter any code.

### Summary (Completed)

#### Core Principle

**Authority to Sell (ATS) → Publish Property → Buyer Interest → (Optional Earnest Money) → SOLD**

#### Seller Path

| Step | Status          | Action                                                     |
| ---- | --------------- | ---------------------------------------------------------- |
| 1    | `ATS_PENDING`   | Seller submits listing request with ATS documents & photos |
| 2    | `ATS_APPROVED`  | Staff reviews & approves ATS documents                     |
| 3    | `ATS_FINALIZED` | Staff finalizes ATS → immutable PDF generated              |
| 4    | `PUBLISHED`     | Staff publishes property → visible to public               |
| 5    | `SOLD`          | After offline transaction, staff marks property sold       |

**Non-negotiable:** ATS approval is **mandatory** before publishing (server-side enforced).

#### Buyer Path

| Step | Inquiry Status | Action                                                           |
| ---- | -------------- | ---------------------------------------------------------------- |
| 1    | —              | Buyer browses PUBLISHED properties                               |
| 2    | `NEW`          | Buyer submits inquiry form                                       |
| 3    | `CONTACTED`    | Staff contacts buyer                                             |
| 4    | —              | If `earnestMoneyRequired`: Staff creates EMA (DRAFT → FINAL PDF) |
| 5    | `CLOSED`       | After sale, inquiry closed                                       |

#### Property Status Lifecycle

| Status      | Public Visible | Notes            |
| ----------- | -------------- | ---------------- |
| `DRAFT`     | No             | Internal only    |
| `PUBLISHED` | Yes            | Active listing   |
| `RESERVED`  | Yes            | Actions disabled |
| `SOLD`      | No             | Final status     |
| `WITHDRAWN` | No             | Off market       |

#### Key Constraints (V0)

1. **Sellers cannot self-publish** — Staff/Admin only
2. **Earnest Money is optional** — controlled by `earnestMoneyRequired` flag
3. **Buyers cannot interact with RESERVED/SOLD/DRAFT properties**
4. **Out of scope (offline):** Payments, notarization, government submissions

#### Appointment Integration

Per the current implementation, appointments tie into **secondary services** (Appraisal, Titling, Consultancy) rather than the core Brokerage workflow. Property viewings/negotiations happen offline in V0.

---

## 1a Revision 1a

- When a property is SOLD, the seller's dashboard should display this status as well in the tab, "My Selling".

### Implementation (Completed)

**Backend:**

- `listingRequestController.js:197-210` — Added `.populate("publishedPropertyId", "status title location price")` to include property status in API response

**Frontend:**

- `Dashboard.jsx:367` — Extract `propertyStatus` from populated `publishedPropertyId`
- `Dashboard.jsx:389-395` — Display status chips: **SOLD** (green, bold), **Reserved** (warning), or **Published** (primary)

## 1b Revision 1b

- Update the Buyer's Dashboard as well under "My Buying" tab

### Implementation (Completed)

**Backend:** Already populates `propertyId.status` in `/services/brokerage/interest/mine` (serviceRoutes.js:147)

**Frontend:**

- `Dashboard.jsx:462` — Added `flexWrap` and `useFlexGap` for chip layout
- `Dashboard.jsx:474-479` — Display **SOLD** (green, bold) and **Reserved** (warning) chips in "My Interests (Brokerage)" section

## 1c Revision 1c

- In the Listing Request (staff) page, the "Seller's" name should be displayed instead of "N/A".
- When a seller is creating a Listing Request, he should indicate that an Earnest Money is required. If he says so, he will be required to fill-in the Earnest Money Agreement form. Use the @EARNEST MONEY AGREEMENT-form.docx in creating the online form. Require the Seller to sign this form before allowing allowing to submit. Once this request is submitted, the display in the Properties page should indicate this including the amount of the Earnest Money.

### Implementation (Completed)

**Part 1: Seller Name Display**

**Backend:**
- `listingRequestController.js:214-216` — Added `.populate("createdBy", "firstName lastName email")` to `listAllListingRequests`

**Frontend:**
- `StaffListingRequests.jsx:216-221` — Display seller name with fallback: `seller.fullName` → `createdBy.firstName lastName` → `createdBy.email` → "N/A"

**Part 2: Earnest Money Agreement**

**Backend:**
- `PropertyListingRequest.js:55` — Added `earnestMoneyAmount` field to propertyDraft schema
- `Property.js:19` — Added `earnestMoneyAmount` field to Property model
- `listingRequestController.js:82-85` — Updated create to accept earnestMoneyRequired and earnestMoneyAmount
- `listingRequestController.js:91-92` — Updated create to accept seller and signature fields
- `listingRequestController.js:265` — Updated publish to copy earnestMoneyAmount to Property

**Frontend:**
- `CreateListingRequest.jsx:43-51` — Added state for earnest money, seller details, and signature consent
- `CreateListingRequest.jsx:81-98` — Added validation for earnest money fields before submit
- `CreateListingRequest.jsx:123-137` — Updated payload to include earnest money and seller data
- `CreateListingRequest.jsx:239-325` — Added Earnest Money section with:
  - Checkbox toggle for earnest money required
  - Earnest money amount field
  - Seller information fields (name, address, phone, email)
  - Signature consent checkbox with dynamic seller name
- `PropertyCard.jsx:531-546` — Updated to display earnest money amount: "Earnest: ₱X,XXX" or "Earnest Money Required"
