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

## 1d Revision 1d

- Use the following text in producing the Earnest Money PDF download: "EARNEST MONEY AGREEMENT
  This Earnest Money Agreement is made and executed this **\_ day of **\_\_\_\_**** 20**\_, in ********\_\_\_\_**********, Philippines, by and between************\_\_************, of legal age, Filipino, with address at ******************\_******************, hereinafter referred to as the SELLER, and ****************\_\_\_****************, of legal age, Filipino, with address at ******************\_\_\_******************, hereinafter referred to as the BUYER.
  The Seller is the lawful owner of a parcel of land, with or without improvements, situated at ******************\_\_\_******************, covered by Transfer Certificate of Title/Condominium Certificate of Title No. ********\_\_\_\_********, containing an area of ****\_\_**** square meters, more particularly described in said title.
  The Buyer has manifested a firm intention to purchase the above-described property, and the Seller has agreed to sell the same, subject to the execution of a Deed of Absolute Sale under the terms and conditions hereinafter stated.
  For and in consideration of the foregoing, the Buyer has paid, and the Seller has received, the amount of PESOS: ₱********\_\_******** (****************\_\_\_**************** Pesos) as Earnest Money, which amount shall form part of and be credited toward the total purchase price of the property.
  The Parties have mutually agreed that the total purchase price of the property is PESOS: ₱********\_\_******** (************\_\_\_\_************ Pesos). The Earnest Money shall be deducted from the total purchase price upon the execution of the Deed of Absolute Sale.
  The Parties further agree that the Deed of Absolute Sale shall be executed on or before ******\_\_\_******, 2026, subject to the completion and submission of all necessary documents and compliance with all legal requirements, including but not limited to verification of ownership, settlement of taxes, and other lawful conditions relevant to the transfer of title.
  In the event that the Buyer unjustifiably fails or refuses to proceed with the purchase, the Earnest Money shall be forfeited in favor of the Seller as liquidated damages. Conversely, if the Seller unjustifiably fails or refuses to proceed with the sale, the Seller shall return the Earnest Money in full to the Buyer. Should the sale fail to be consummated due to causes beyond the control of both Parties, the Earnest Money shall be returned to the Buyer, unless otherwise agreed in writing.
  Unless otherwise stipulated, all taxes, fees, and expenses incident to the sale and transfer of the property shall be borne by the Parties in accordance with law and prevailing practice.
  This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines and shall be binding upon the Parties, their heirs, successors, and assigns.
  IN WITNESS WHEREOF, the Parties have hereunto affixed their signatures on the date and place first above written.

---

                  SELLER
    Signature over Printed Name" - fill-in the blanks accordingly when printing this to PDF

### Implementation (Completed)

**Backend:**

- `pdfGenerator.js:11-55` — Added `numberToWords()` helper function to convert amounts to words (e.g., "One Million Five Hundred Thousand Pesos")
- `pdfGenerator.js:60-74` — Added `formatLegalDate()` helper to format dates as "Xth day of Month Year"
- `pdfGenerator.js:182-332` — Completely rewrote `generateEmaPdf()` to use the legal template format with:
  - Opening paragraph with date, location, seller/buyer names and addresses
  - Property description with location, title number (TCT/CCT), and area in sqm
  - Financial terms with amounts shown both numerically and in words (e.g., "₱100,000 (One Hundred Thousand Pesos)")
  - Deed execution deadline date
  - Full legal clauses: forfeiture, taxes, governing law, witness
  - Signature sections for both SELLER and BUYER

## 1e Revision 1e — EMA Enhancements

- Use PHP as the symbol for Pesos (not ₱)
- Execution date and location should be asked from staff during EMA creation
- Allow preview and editing of EMA before FINAL creation
- Make EMA PDF fit on one page

### Implementation (Completed)

**Backend:**

- `EarnestMoneyAgreement.js:37-38` — Added `executionDate` (Date) and `executionLocation` (String) fields to schema
- `earnestMoneyController.js:17,29-30` — Updated `createEarnestMoneyAgreement` to accept new fields
- `earnestMoneyController.js:101` — Updated `allowedFields` in `updateEarnestMoneyAgreement` to include new fields
- `earnestMoneyController.js:140-141` — Updated `finalizeEarnestMoneyAgreement` to pass new fields to PDF generator
- `earnestMoneyController.js:177-213` — Added `previewEarnestMoneyAgreement` endpoint to generate preview PDF with watermark
- `earnestMoneyRoutes.js:9,24-25,44` — Added preview import, execution date/location validation, and preview route
- `pdfGenerator.js:182-337` — Updated `generateEmaPdf()`:
  - Changed peso symbol from ₱ to PHP
  - Uses executionDate and executionLocation from data instead of auto-generating
  - Optimized layout for single page (9pt font, 40px margins, 0.5 line spacing)
  - Side-by-side signature sections
  - Added "PREVIEW" watermark for preview PDFs
  - Footer positioned at page bottom

**Frontend:**

- `StaffEarnestMoney.jsx:27-38` — Added `executionDate` and `executionLocation` to initial form state
- `StaffEarnestMoney.jsx:46-50` — Added `editDialogOpen`, `selectedAgreement`, and `previewLoading` state
- `StaffEarnestMoney.jsx:102-122` — Added `handleOpenEdit` function to populate edit form
- `StaffEarnestMoney.jsx:124-147` — Added `handleUpdate` function to save changes
- `StaffEarnestMoney.jsx:149-162` — Added `handlePreview` function to generate and open preview PDF
- `StaffEarnestMoney.jsx:214-239` — Added "Agreement Execution Details" section with date and location fields
- `StaffEarnestMoney.jsx:435-442` — Display execution date/location in agreement cards
- `StaffEarnestMoney.jsx:451-483` — Added Edit and Preview PDF buttons for DRAFT agreements
- `StaffEarnestMoney.jsx:519-537` — Added Edit dialog with Preview button in actions
