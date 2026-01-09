# 020 — V1 Roadmap (Non-Breaking Extension of V0)

⚠️ This roadmap defines **how the platform may evolve AFTER V0**
without breaking the Brokerage V0 baseline.

All V1 work MUST preserve:

- Brokerage behavior
- ATS enforcement
- Property lifecycle rules
- Buyer and seller constraints

If a V1 feature risks changing V0 behavior, it must be isolated or deferred.

---

## 1. Guiding Principles for V1

V1 development MUST follow these principles:

1. **Brokerage is frozen**

   - No behavior changes
   - No new branches inside the brokerage spine

2. **New capabilities are additive**

   - New modules
   - New tables/collections
   - New routes
   - NO mutation of existing flows

3. **Isolation over reuse**

   - Prefer duplication of simple logic over shared coupling
   - Shared infra (Auth, Documents, Calendar) is allowed
   - Shared business rules are NOT allowed

4. **Server-side rules remain the source of truth**
   - UI may guide
   - Backend must enforce

---

## 2. V1 Phase Breakdown (Safe Order)

---

### Phase 1 — Property Appraisal (V1.1)

**Why first**

- Standalone service
- No dependency on Brokerage lifecycle
- Revenue-adjacent
- Low legal risk

#### Scope (Allowed)

- Appraisal Request form
- Document uploads (Title, Tax Dec, Photos)
- Appointment booking
- Staff confirmation
- Appraisal report upload (PDF)
- Offline payment handling

#### Hard Constraints

- Appraisal MUST NOT:
  - Publish properties
  - Modify property status
  - Create listings automatically
  - Convert into brokerage without manual staff action

#### Data Isolation

- New models:
  - `AppraisalRequest`
  - `AppraisalReport`
- Document Library module:
  - `APPRAISAL`

✔ Brokerage untouched

---

### Phase 2 — Appointment Calendar (V1.2)

**Why now**

- Shared need (Appraisal, Titling, Consultancy)
- Infrastructure-level feature
- No brokerage logic impact

#### Scope (Allowed)

- Availability slots (staff-managed)
- Client booking requests
- Staff confirmation / reschedule
- Cancellation handling
- Email notifications (optional)

#### Hard Constraints

- Calendar MUST NOT:
  - Auto-approve anything
  - Trigger payments
  - Trigger status changes in Brokerage
  - Trigger publishing

#### Integration Rules

- Brokerage may _reference_ calendar
- Brokerage must NOT depend on calendar availability

---

### Phase 3 — Land Titling / Title Transfer (V1.3)

**Why here**

- Document-heavy
- Procedural, not transactional
- No lifecycle overlap with brokerage

#### Scope (Allowed)

- Service request form
- Unlimited document uploads
- Appointment booking
- Status tracking (Submitted → In Progress → Completed)
- Rate display (informational)

#### Hard Constraints

- Titling MUST NOT:
  - Modify property status
  - Touch published listings
  - Assume ownership transfer is complete

#### Data Isolation

- New models:
  - `TitlingRequest`
- Document Library module:
  - `TITLE_TRANSFER`

---

### Phase 4 — Consultancy (V1.4)

**Why last**

- Simplest service
- Pure lead generation

#### Scope (Allowed)

- Marketing page
- Appointment booking
- Inquiry capture

#### Hard Constraints

- No documents required (V1)
- No pricing automation
- No workflow escalation

---

## 3. Explicitly Deferred (Post-V1)

The following are **NOT allowed in V1**:

- Online payments
- Escrow handling
- Digital notarization
- Government integrations
- AI valuation or approval logic
- Buyer ↔ Seller direct messaging
- Multi-broker / SaaS support
- Mobile native apps

Any of the above requires a **V2 governance review**.

---

## 4. Safe Enhancements Allowed Across V1

These may be implemented at any time:

- Email notifications
- Better audit logs
- Performance improvements
- UX polish
- Error handling clarity
- Reporting dashboards (read-only)

As long as:

- Brokerage behavior does not change
- No new side effects are introduced

---

## 5. Regression Guardrails (Mandatory)

Before merging any V1 work:

- Re-run `.docs/011-v0-release-checklist.md`
- Verify `.docs/010-brokerage-v0-freeze.md` is not violated
- Confirm no changes to:
  - Brokerage routes
  - Brokerage status enums
  - ATS enforcement logic
  - Property visibility rules

If any regression is found → BLOCK merge.

---

## 6. Decision Rule for Future Work

Ask these questions before implementing:

1. Does this change Brokerage behavior?
   - If YES → STOP
2. Can this live as a new module?
   - If YES → OK
3. Does this require payments or legal execution?
   - If YES → DEFER
4. Can this fail safely without affecting listings?
   - If NO → RE-DESIGN

---

## 7. Summary

V1 is about **breadth, not depth**.

- Expand services
- Keep Brokerage stable
- Avoid premature complexity
- Preserve
