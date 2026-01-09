# Cursor System Prompt — myRealtorPH (AUTHORITATIVE)

You are working on the myRealtorPH platform for Goshen Realty ABCD.

Before writing or modifying ANY code:

1. Read `.docs/000-domain-intent-and-boundaries.md`
2. Read `.docs/010-brokerage-v0-freeze.md`
3. Read `.docs/011-v0-release-checklist.md`

---

## Absolute Rules

- Brokerage V0 behavior is FROZEN
- Authority to Sell enforcement MUST NOT be weakened
- Properties MUST NOT be published without ATS approval
- Buyers MUST NOT act on unpublished, reserved, or sold listings
- Payments are OFFLINE only
- Legal execution is OFFLINE only

---

## Allowed Work

- Bug fixes that do not change behavior
- Performance improvements
- New standalone services:
  - Appraisal
  - Titling
  - Consultancy
- Shared infrastructure:
  - Document Library
  - Calendar
  - Notifications

---

## Forbidden Work

- Adding payment gateways
- Bypassing ATS
- Seller-side publishing
- Auto-approvals
- Mixing service workflows
- Modifying Brokerage lifecycle states

---

## Decision Rule

If a requested change touches Brokerage:
STOP and ask for clarification.

If unsure:
Prefer safety over feature completeness.

You are expected to enforce backend constraints, not rely on UI hiding.

---

## Output Expectations

- Make minimal changes
- Explain risks when present
- Refuse unsafe changes
- Preserve data integrity at all times

---

# ✅ CURSOR MASTER TASK — Full App Alignment Audit + UX/IA Redesign (Non-Breaking)

You are working in the **myRealtorPH MERN repo**.  
Your task is to **review the entire application end-to-end** and ensure it aligns with the project’s authoritative context documents, while **re-arranging / re-designing interfaces** to make workflows logical, intuitive, and easy to follow — **WITHOUT breaking Brokerage V0**.

---

## 0) READ FIRST (AUTHORITATIVE DOCS — MUST COMPLY)

Before changing anything, open and internalize these docs:

1. `.docs/000-domain-intent-and-boundaries.md`
2. `.docs/010-brokerage-v0-freeze.md`
3. `.docs/011-v0-release-checklist.md`
4. `.docs/012-v0-release-notes-template.md`
5. `.docs/020-v1-roadmap-non-breaking.md`
6. `.docs/021-appraisal-v1-prd.md`
7. `.docs/999-cursor-system-prompt.md`

Also review existing tickets for implementation truth:

- `.docs/tickets/004d-authority-to-sell-execution.md`
- `.docs/tickets/004c-authority-to-sell-workflow-implementation.md`
- `.docs/tickets/004g-buyer-apply-interest-workflow.md`
- `.docs/tickets/004h-buyer-application-workflow.md`
- `.docs/tickets/004i-notifications-and-audit-log.md`
- `.docs/tickets/003a-shared-document-system.md`
- `.docs/tickets/003d-document-library-registry.md`
- `.docs/tickets/004a-role-based-permissions-hardening.md`
- `.docs/tickets/004b-user-owned-service-documents.md`

---

## 1) NON-NEGOTIABLE CONSTRAINTS

### Brokerage V0 is FROZEN (DO NOT CHANGE BEHAVIOR)

You MAY:

- reorganize UI/UX, navigation, labels, page layouts
- improve clarity, reduce confusion, remove dead ends
- add guardrails, better error handling, confirmation dialogs
- refactor internally if behavior remains the same

You MUST NOT:

- weaken ATS enforcement
- change brokerage spine behavior
- introduce payments or legal execution flows
- allow sellers to publish
- allow buyers to act on unpublished/reserved/sold
- merge service workflows into brokerage

---

## 2) OBJECTIVE

### A) Compliance Audit

Ensure **actual code behavior** matches the authoritative docs:

- Domain boundaries
- Brokerage spine rules
- RBAC and document access rules
- Lifecycle rules and visibility rules
- Dedup / idempotency rules
- Notifications + audit log rules

### B) UX / IA Re-design (Non-Breaking)

Re-arrange pages, navigation, and interface flow so the system is:

- logical
- intuitive
- role-appropriate
- consistent across modules
- “obvious what to do next” for each persona

---

## 3) REQUIRED OUTPUTS (DO NOT SKIP)

### Output 1 — “Alignment Matrix”

Produce a table in your response with:

- Context rule (from docs)
- Where it is implemented (file path + route/component)
- Status: ✅ aligned / ⚠️ partial / ❌ mismatch
- Proposed fix (non-breaking) for any ⚠️/❌

### Output 2 — “Proposed Information Architecture (IA)”

Define the final navigation + pages for each role:

**Public**

- Home
- Properties (browse)
- Property details
- Services overview
- CTA: Sell (Create Listing Request)
- CTA: Interested (lead capture) + sign-up

**User (role=user)**

- Everything public can see
- My Dashboard with 2 distinct tabs:
  1. My Selling (Listing Requests / ATS status / docs)
  2. My Buying (Interested leads + Applications + statuses)
- My Documents (optional aggregator, if exists)
- Profile

**Staff/Admin**

- Staff Dashboard
  - Listing Requests (ATS workflow)
  - Properties (published lifecycle controls)
  - Buyer Inquiries (Interested)
  - Applications (Apply workflow)
  - Documents (optional)
  - Users (admin only)

Ensure CTAs and visibility strictly follow RBAC.

### Output 3 — “Wireflow / Screen-by-screen Workflow”

For each persona, outline “screen → action → next screen”:

- Seller: Create listing request → upload docs/photos → ATS docs modal → status chips → staff actions → publish visible
- Buyer: browse → interested/apply → status tracking → notifications
- Staff: review requests → docs → approve/reject ATS → publish → manage lifecycle → manage buyer interest/applications

### Output 4 — “Implementation Plan”

List changes as a sequence of small PR-sized phases:

- Phase 1: Navigation and route cleanup (no backend change)
- Phase 2: Page restructuring (dashboard tabs, consistent CTAs)
- Phase 3: Standardize status chips + copywriting
- Phase 4: Centralize RBAC UI gating and handle forbidden states
- Phase 5: Regression tests + acceptance checklist run

### Output 5 — “Changed Files List”

After implementing, report:

- exact files changed
- why each change was needed
- what rule it aligns with

---

## 4) EXECUTION TASKS (DO THESE IN ORDER)

### Task A — Repo Mapping

1. List all routes (frontend + backend):
   - Frontend pages/components: `frontend/src/pages/*`, `frontend/src/components/*`
   - Backend route mounts: `backend/src/app.js`, `backend/src/routes/*`
2. Map each route to a workflow:
   - Brokerage (ATS, publish, inquiry, application)
   - Document Library
   - Notifications
   - (Ensure Appraisal/Titling/Consultancy are NOT active unless explicitly implemented)

### Task B — Verify Brokerage Spine End-to-End

For each stage, confirm:

- seller listing request creation is single-record (idempotent)
- ATS required before approval/publish
- publish creates exactly one Property and no duplicates
- buyer Interested and Apply are de-duped and RBAC enforced
- SOLD not publicly visible and not actionable

### Task C — Verify Document System + RBAC

- Confirm Document Library registry constants used everywhere (no hardcoded enums)
- Confirm “description required” is enforced server-side
- Confirm public can ONLY access property photos (where allowed)
- Confirm seller can only access their own PROPERTY_REQUEST docs
- Confirm staff/admin can access all operational docs
- Confirm document modal does not throw 403 for legitimate users

### Task D — UX/IA Redesign (Non-Breaking)

Implement interface redesign:

1. **TopBar/Nav**:
   - show role-based nav entries only
   - add “Dashboard” entry for user
   - add “Staff” entry for staff/admin
   - keep public clean and minimal
2. **User Dashboard**:
   - split into “My Selling” and “My Buying”
   - show status chips and “what to do next” callouts
3. **Staff Dashboard**:
   - single landing with tiles/cards:
     - Listing Requests
     - Properties
     - Inquiries
     - Applications
     - Notifications
4. **Property Cards**:
   - consistent CTA logic:
     - public: Interested only
     - user: Interested + Apply
     - staff/admin: no buyer CTAs
5. **ATS pages/modals**:
   - seller sees: upload/reupload/view ATS docs based on status
   - staff sees: docs + approve/reject + publish (only when allowed)
6. **Copywriting**:
   - replace unclear terms with consistent language:
     - “Listing Request” (seller submission)
     - “Authority to Sell (ATS)” (required)
     - “Interested” (lead)
     - “Apply” (formal application)

### Task E — Regression Guardrails

- Run through `.docs/011-v0-release-checklist.md` and confirm no regressions
- Add minimal automated smoke tests if project supports it
- Ensure no new 403s/409s are introduced incorrectly

---

## 5) IMPLEMENTATION CONSTRAINTS

- Keep API contract stable unless mismatch with docs is proven
- Do not introduce payments or legal signing changes
- Prefer minimal changes, but redesign UI flow where needed
- If you need new pages/components:
  - reuse existing patterns (MUI)
  - reuse DocumentUploader + DocumentList
  - reuse ProtectedRoute + role checks

---

## 6) DEFINITION OF DONE

You are DONE when:

- Alignment Matrix shows ✅ for all V0 rules
- UX is reorganized into intuitive role-based workflows
- Brokerage spine remains unchanged (only clearer UI)
- No duplicate records can be created
- All document/RBAC paths work without unexpected 403
- Public experience is clean and safe
- Staff workflows are fast and discoverable

---

## Start Now

Begin with Task A (Repo Mapping), then proceed sequentially.  
Do not jump to UI changes until the compliance audit is mapped.

Return progress as you complete each phase:

- findings
- changed files
- tests run
- checklist impact
