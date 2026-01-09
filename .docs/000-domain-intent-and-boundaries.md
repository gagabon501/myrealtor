# 000 — Domain Intent & Product Boundaries (AUTHORITATIVE)

⚠️ This document defines the **authoritative product intent and domain boundaries**
for the myRealtorPH / Goshen Realty ABCD platform.

All tickets, workflows, and code changes MUST conform to this document.
If a ticket conflicts with this document, THIS DOCUMENT WINS.

---

## 1. Product Purpose (V0)

The platform is a **client-facing website and internal admin dashboard** that digitizes:

- Property listings
- Brokerage workflows
- Service requests (Appraisal, Titling/Transfer, Consultancy)
- Document intake
- Appointment booking
- Status tracking

This is **NOT**:

- a CRM
- a payment gateway
- a legal execution or notarization system
- a government integration platform

All payments, notarization, and government submissions remain OFFLINE in V0.

---

## 2. Primary Business Spine (Brokerage)

The system has ONE primary business spine:

Authority to Sell
→ Publish Property
→ Buyer Interest
→ (Optional) Earnest Money
→ SOLD

Everything else is secondary and must NOT interfere with this flow.

---

## 3. Brokerage — Seller Persona (Primary)

### Seller Flow (Authoritative)

1. Seller submits a **Listing Request** via the website
2. Seller uploads property documents:
   - Title
   - Tax Declaration
   - Sketch Plan
   - Vicinity Map
   - Photos (optional)
3. Seller completes and signs **Authority to Sell** inside the app
4. Staff/Admin reviews and approves ATS
5. ONLY AFTER ATS approval:
   - Property may be published
   - Property becomes publicly visible
6. Property may later be marked SOLD by staff/admin

### Non-negotiable Rules

- A Property MUST NOT be published without ATS approval
- Sellers MUST NOT be able to publish listings themselves
- ATS enforcement is mandatory and server-side

---

## 4. Earnest Money (Brokerage Constraint)

- Earnest Money is **OPTIONAL**
- Not all property sales require earnest money
- The requirement is:
  - Declared by staff/admin
  - Visible on property listings
- Seller must NOT control this flag directly

Earnest Money handling:

- Agreement generated in-system (PDF)
- Payment handled OFFLINE
- No escrow, no gateway, no automation in V0

---

## 5. Brokerage — Buyer Persona

### Buyer Flow (Authoritative)

1. Buyer browses AVAILABLE properties
2. Buyer clicks **Interested**
   - Public users are required to register
3. Buyer submits interest (Inquiry)
4. Staff manually contacts buyer
5. If buyer proceeds:
   - Earnest Money Agreement generated (if required)
6. Buyer and seller meet OFFLINE with broker and notary
7. Staff marks property SOLD
8. SOLD listings are no longer actionable or publicly listed

### Constraints

- Buyers cannot interact with:
  - RESERVED
  - UNDER_NEGOTIATION
  - SOLD
  - DRAFT
  - ARCHIVED listings
- No buyer-side legal execution in V0

---

## 6. Secondary Services (Isolated Domains)

The following services are **standalone workflows** and are NOT sub-flows of brokerage.

### 6.1 Property Appraisal

- Independent service
- Own request, documents, appointment, and report lifecycle
- Pricing logic is informational only in V0
- Payments handled offline
- Report finalized and released as PDF

### 6.2 Land Titling / Title Transfer

- Document-heavy service
- Unlimited uploads with required document title + description
- Appointment-based
- No government integration in V0

### 6.3 Consultancy

- Lead-generation service
- Appointment booking only
- No document or payment workflow in V0

---

## 7. Document System (Global Rule)

- All uploads use the **Shared Document Library**
- Every document MUST have:
  - Description
  - Module
  - Owner
- Access is enforced server-side via RBAC
- Public users must never access private documents

---

## 8. Explicit Non-Goals (V0)

- Online payments
- Digital notarization
- Government system integrations
- AI decision-making (pricing, approval, legal conclusions)
- Multi-company SaaS
- Mobile native apps

---

## 9. Development Guidance for Cursor / AI

When implementing features:

- DO NOT collapse services into brokerage
- DO NOT weaken ATS enforcement
- DO NOT bypass status gating
- DO NOT introduce payment logic
- Prefer server-side enforcement over UI-only rules
- Favor correctness over speed

If uncertain, STOP and re-check this document before coding.

---
