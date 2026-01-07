# Ticket 003a — Shared Document Upload System (System-Wide)

## Goal

Introduce a **shared, system-wide document upload mechanism** that enforces
a **required “Document Description”** for every uploaded file (including photos),
without breaking existing working modules.

This system will become the foundation for all document handling across:

- Authority to Sell (ATS)
- Property documents and photos
- Appraisal reports
- Title transfer documents
- Future modules

Legacy uploads will remain untouched for now and will be migrated incrementally.

---

## Core Requirement (Non-Negotiable)

- **Every uploaded document MUST have a Document Description**
- Description must be:
  - required at upload time
  - stored in the database
  - displayed anywhere documents are listed

This applies to **all modules** that use the shared document system.

---

## Design Principles

1. **Non-breaking**

   - Existing uploads (e.g. `Property.images: [String]`) remain functional.
   - New system runs alongside legacy code.

2. **Reusable**

   - All modules use the same API and model.
   - No module-specific upload hacks.

3. **Traceable**
   - Documents know which module and record they belong to.
   - Descriptions improve legal and operational clarity.

---

## Data Model — Document

### New Collection: `documents`

```js
{
  _id,
  module: "ATS" | "PROPERTY" | "APPRAISAL" | "TITLE_TRANSFER" | "OTHER",
  ownerType: String,          // e.g. "Property", "ATSRequest"
  ownerId: ObjectId,          // ID of the owning record
  category: String,           // e.g. PHOTO, TITLE, TAX_DECLARATION
  label: String,              // Human label (optional)
  description: String,        // REQUIRED
  filePath: String,           // /uploads/documents/...
  mimeType: String,
  originalName: String,
  size: Number,
  uploadedBy: ObjectId | null,
  createdAt,
  updatedAt
}
```
