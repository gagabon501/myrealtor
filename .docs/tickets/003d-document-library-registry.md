TICKET 003d — Document Library Module Registry (prevent enum mismatches forever)

Problem

- We have Document Library reuse across PROPERTY + INQUIRY now.
- We previously hit enum mismatch issues (e.g., INQUIRY not allowed).
- Strings for module/ownerType/category are repeated across frontend pages/components.

Goal
Create a single “registry” of allowed values and use it everywhere:

- Backend uses it for validation
- Frontend uses it for dropdown options and payloads

Constraints

- No Docker/nginx changes
- Keep existing endpoint base: /api/document-library
- Do not break current working flows (Property + Inquiry uploads/lists/deletes must still work)

Backend changes

1. Add a constants module:
   backend/src/constants/documentLibrary.js
   Export:

   - MODULES (enum-like)
   - OWNER_TYPES
   - CATEGORIES
   - REGISTRY structure mapping:
     REGISTRY = {
     PROPERTY: { ownerTypes: ["Property"], categories: ["PHOTO","ATTACHMENT"] },
     INQUIRY: { ownerTypes: ["BuyerInquiry"], categories: ["ATTACHMENT","PHOTO"] }
     }

2. Update Document model enum values to import from constants (no duplication).
3. Update routes:

   - POST /api/document-library validates module/ownerType/category using REGISTRY
   - GET list validates module if provided (nice error message)
   - Return clear 400 errors like:
     { "message": "Invalid module. Allowed: PROPERTY, INQUIRY" }

4. Add optional meta endpoint:
   GET /api/document-library/meta
   Returns:
   {
   modules: ["PROPERTY","INQUIRY"],
   registry: { ...same REGISTRY... }
   }

Frontend changes

1. Add constants:
   frontend/src/constants/documentLibrary.js
   Mirror the backend REGISTRY for now, OR fetch from /meta if you prefer.
2. Update DocumentUploader to use constants/registry for:
   - module strings
   - ownerType strings
   - category dropdown options
3. Update any pages using DocumentUploader to pass module/ownerType via constants.

Acceptance criteria

- No hardcoded module/ownerType/category strings outside constants.
- Uploading Property PHOTO works.
- Uploading Inquiry ATTACHMENT works.
- Invalid module/category returns 400 with a clean message.
- /meta returns registry.
- No regressions: login, properties list, inquiries list still work.

Deliverables

- Code changes
- Add docs/tickets/003d-document-library-registry.md
- Update CHANGELOG.md patch bump

Notes / Decisions

- Use shared Document Library for all modules.
- Avoid future enum mismatches by centralizing registry for modules/ownerTypes/categories.
- Frontend and backend share the same allowed strings (registry/constant modules).
- Add /api/document-library/meta to expose registry for debugging/clients.
