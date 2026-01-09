# V0 Release Notes — myRealtorPH

**Product:** Goshen Realty ABCD Digital Platform  
**Release Version:** v0.0.0  
**Release Date:** YYYY-MM-DD  
**Environment:** Production  
**Status:** INITIAL PUBLIC RELEASE

---

## 1. Release Summary

This release marks the **initial V0 production launch** of the Goshen Realty ABCD digital platform.

V0 focuses exclusively on **digitizing the Brokerage workflow**, providing:

- A public-facing property listing experience
- A controlled seller onboarding and Authority-to-Sell process
- Buyer interest and application capture
- Internal staff/admin management and status tracking

This release establishes a **stable operational foundation**.
Future releases will expand into additional services without altering V0 Brokerage behavior.

---

## 2. What Is Included in V0

### 2.1 Brokerage — Seller Journey

Sellers can:

- Submit a **Property Listing Request**
- Upload property documents and photos
- Complete and sign an **Authority to Sell (ATS)** digitally
- Track request status (Pending / Approved / Rejected)

Staff/Admin can:

- Review listing requests
- Approve or reject ATS with reasons
- Publish approved properties
- Manage listing lifecycle through to SOLD

---

### 2.2 Brokerage — Buyer Journey

Buyers can:

- Browse available properties
- Register interest in a property
- Submit a formal application (once per property)
- Receive notifications on application status changes

Staff/Admin can:

- Review buyer interest and applications
- Contact buyers offline
- Manage reservation and sale status

---

### 2.3 Property Lifecycle Management

Properties support controlled lifecycle states:

- Draft / Unpublished
- Published (Available)
- Reserved
- Sold
- Withdrawn

Public users only see **Available** (and optionally Reserved) properties.

All lifecycle transitions are enforced server-side.

---

### 2.4 Document Management

- Centralized **Document Library**
- Mandatory document descriptions
- Role-based access enforcement
- Separate handling for:
  - Listing Requests
  - Properties
  - Buyer Inquiries

---

### 2.5 Notifications & Auditability

- In-app notifications for buyers
- Application activity timeline
- Audit logs for:
  - ATS approval / rejection
  - Property publishing
  - Status changes

---

## 3. What Is Explicitly NOT Included (V0 Non-Goals)

The following are **intentionally excluded** from V0:

- Online payments or escrow
- Digital notarization
- Government system integrations
- Automated pricing or AI decision-making
- Buyer/seller chat or messaging
- Mobile native applications
- Multi-brokerage or SaaS functionality

All payments and legal execution occur **offline**.

---

## 4. Known Limitations (Accepted for V0)

- Appointment booking is manual or partially implemented
- Notifications are in-app only (no email/SMS)
- Reports and agreements are stored as documents (PDF)
- Some services (Appraisal, Titling, Consultancy) are visible but not yet active

These limitations are **intentional** and scheduled for future releases.

---

## 5. Data Integrity & Safety Guarantees

V0 guarantees:

- No duplicate listing requests
- No duplicate buyer applications
- No duplicate property records
- Server-side enforcement of all permissions
- Idempotent lifecycle transitions
- Clear error responses for invalid actions

---

## 6. Backward Compatibility & Freeze Policy

This release establishes the **Brokerage V0 baseline**.

From this point forward:

- Brokerage workflows are **frozen**
- Behavior changes require explicit product review
- Refactors must not alter external behavior
- New features must not regress V0 guarantees

See:

- `.docs/000-domain-intent-and-boundaries.md`
- `.docs/010-brokerage-v0-freeze.md`
- `.docs/011-v0-release-checklist.md`

---

## 7. Next Planned Phase (Informational)

Planned post-V0 work includes:

- Property Appraisal (standalone service)
- Appointment booking calendar
- Land Titling / Title Transfer service
- Improved notifications (email/SMS)

These will be implemented **without modifying Brokerage V0 behavior**.

---

## 8. Sign-off

This release has been reviewed against the V0 Release Checklist
and is approved for operational use.

**Product Owner:** **********\_\_\_\_**********  
**Technical Owner:** **********\_\_**********  
**Date:** ****************\_****************
