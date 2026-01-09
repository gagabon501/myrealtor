# 011 — V0 Release Checklist (Brokerage-Centric)

This checklist defines the **minimum conditions required** to declare
**myRealtorPH V0 production-ready** for Goshen Realty ABCD.

V0 is considered **COMPLETE** only when ALL items below are satisfied.

This checklist is authoritative.

---

## 1. Scope Confirmation (V0 Boundaries)

- [ ] Platform is a **client-facing website + internal admin dashboard**
- [ ] No online payments implemented
- [ ] No government or notarization integrations
- [ ] No CRM or messaging system beyond notifications
- [ ] Brokerage is the primary and only fully operational service

If any item above is false → V0 is NOT ready.

---

## 2. Brokerage Spine (CRITICAL — MUST PASS ALL)

### 2.1 Authority to Sell (ATS)

- [ ] Seller can create a **Listing Request**
- [ ] Seller can upload required documents
- [ ] Seller can upload and sign ATS document
- [ ] ATS document stored via Document Library
- [ ] ATS approval is **staff/admin-only**
- [ ] Backend blocks publishing without ATS approval
- [ ] ATS rejection requires a reason
- [ ] ATS approval is auditable (timestamp + actor)

❌ If a property can be published without ATS → FAIL

---

### 2.2 Listing Publication

- [ ] Listing Request converts to **exactly one Property**
- [ ] Duplicate Listing Requests are impossible (backend idempotency)
- [ ] Published properties appear in public listings
- [ ] Unpublished requests never appear publicly
- [ ] Property photos carry over from request → property
- [ ] Max photo limits enforced
- [ ] Property visibility enforced server-side

---

### 2.3 Buyer Interest & Application

- [ ] Public users can browse AVAILABLE properties
- [ ] Buyer can click **Interested**
- [ ] Unauthenticated users are redirected to Sign-Up
- [ ] Interested leads are de-duplicated
- [ ] Logged-in buyers can Apply once per property
- [ ] Duplicate applications return 409 (no duplicates created)
- [ ] Buyers cannot apply to:
  - [ ] Draft
  - [ ] Unpublished
  - [ ] Reserved
  - [ ] Sold properties

---

### 2.4 Earnest Money (Optional, Controlled)

- [ ] Earnest Money flag exists on Property
- [ ] Flag is **staff-controlled**
- [ ] Flag is visible to buyers
- [ ] Earnest Money Agreement can be generated
- [ ] Payments handled OFFLINE only
- [ ] No buyer can proceed to Earnest unless staff triggers it

---

### 2.5 Property Lifecycle

- [ ] Property status enum enforced
- [ ] Staff/Admin can mark property:
  - [ ] Reserved
  - [ ] Sold
  - [ ] Withdrawn
- [ ] Sold properties:
  - [ ] Removed from public actions
  - [ ] No longer appear in active listings
- [ ] Lifecycle transitions are idempotent
- [ ] No duplicate Property records ever created

---

## 3. Document System (Global)

- [ ] All uploads use Document Library
- [ ] Every document requires a description
- [ ] Module + owner enforced for every document
- [ ] Public users cannot access private documents
- [ ] Sellers can only access their own request documents
- [ ] Staff/Admin can access all operational documents
- [ ] Deleting documents respects RBAC

---

## 4. Role-Based Access Control (RBAC)

- [ ] Roles limited to: public, user, staff, admin
- [ ] Backend enforces all permissions (not UI-only)
- [ ] Staff/Admin actions blocked for user role
- [ ] Invalid roles force logout / 401
- [ ] Protected routes cannot be accessed directly
- [ ] No silent permission failures

---

## 5. Notifications & Auditability

- [ ] Buyer receives notification on:
  - [ ] Application submitted
  - [ ] Application status change
- [ ] Activity log exists for applications
- [ ] ATS approval/rejection is auditable
- [ ] Publish, reserve, sold actions logged
- [ ] Notifications are scoped to the correct user

---

## 6. Stability & Safety

- [ ] No duplicate Listing Requests possible
- [ ] No duplicate Applications possible
- [ ] No duplicate Properties possible
- [ ] Backend idempotency implemented where needed
- [ ] Frontend submit guards implemented
- [ ] Race conditions handled gracefully (409 / reuse existing)

---

## 7. UX & Operational Readiness

- [ ] Clear error messages for forbidden actions
- [ ] Clear status indicators for:
  - [ ] ATS Pending
  - [ ] ATS Approved
  - [ ] ATS Rejected
  - [ ] Reserved
  - [ ] Sold
- [ ] Staff/Admin workflows are discoverable
- [ ] Sellers understand next required action
- [ ] Buyers understand property availability state

---

## 8. Explicit V0 Non-Goals (Verified)

Confirm NONE of the following exist:

- [ ] Online payment gateway
- [ ] Automated pricing or AI decisions
- [ ] Digital notarization
- [ ] Government system integration
- [ ] Messaging/chat system
- [ ] Mobile native app
- [ ] Multi-brokerage SaaS support

If any item exists → REMOVE or DEFER.

---

## 9. Release Declaration

V0 can be declared **READY** when:

- [ ] All checklist items above are checked
- [ ] Brokerage V0 Freeze document is present
- [ ] Domain Intent document is present
- [ ] No open “critical” bugs remain

Once declared READY:

- Brokerage behavior is FROZEN
- Only bug fixes and refactors allowed
- New features must target other services (Appraisal, Titling, etc.)

---

## 10. Sign-off

- Product Owner: ********\_\_******** Date: **\_\_\_**
- Technical Owner: ******\_\_\_\_****** Date: **\_\_\_**
