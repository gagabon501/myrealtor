# 020 — Next Work: Property Appraisal (V0)

This document authorizes development of the **Property Appraisal service**.

Brokerage logic MUST NOT be modified while working on this.

---

## Appraisal Is a Standalone Service

- Not linked to Brokerage
- Not linked to Property lifecycle
- No publish, sell, or buyer flows

---

## V0 Scope

- Client submits appraisal request
- Client uploads documents
- Client books appointment
- Staff confirms appointment
- Appraisal report prepared and uploaded
- Payments handled offline

---

## Explicit Non-Goals

- Auto pricing
- Online payments
- Appraisal → brokerage conversion
- Government integration

---

## Dependency Notes

- Reuse Document Library
- Reuse Calendar (when built)
- Reuse RBAC

No new shared domain rules allowed.
