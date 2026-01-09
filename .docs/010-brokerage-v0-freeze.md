# 010 — Brokerage V0 Freeze (DO NOT BREAK)

⚠️ Brokerage is considered **V0 COMPLETE**.
All future changes MUST NOT alter its behavior.

This includes:

- Authority to Sell enforcement
- Listing publication rules
- Buyer interest and application flows
- Earnest money handling
- Property lifecycle states

---

## Brokerage Spine (Frozen)

Authority to Sell  
→ Publish Property  
→ Buyer Interest  
→ (Optional) Earnest Money  
→ SOLD

This flow MUST remain intact.

---

## Locked Rules (Non-Negotiable)

- A Property MUST NOT be published without ATS approval
- Sellers MUST NOT publish listings
- Buyers MUST NOT act on:
  - DRAFT
  - UNPUBLISHED
  - RESERVED
  - SOLD listings
- Earnest Money:
  - Optional
  - Staff-controlled
  - Offline payment only
- SOLD listings are removed from public actions

---

## Allowed Changes

- Internal refactors
- Performance improvements
- UI clarity improvements
- Bug fixes that DO NOT alter behavior
- Logging, audit, and observability

---

## Forbidden Changes

- Payment gateways
- Seller-side publishing
- Skipping ATS
- Auto-approvals
- Buyer-side legal execution
- Combining brokerage with other services

---

## If a change conflicts with this file

STOP.

Re-open product discussion first.

This file overrides all tickets unless explicitly superseded.
