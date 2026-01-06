# PDF Generation (V0)

## Principle

- Use HTML -> PDF generation.
- Once a document is FINAL, it is immutable.
- If edits are needed after FINAL, generate a new version (v2, v3).

## Document types

1. Authority to Sell and Negotiate
2. Earnest Money Agreement
3. Appraisal Report

These PDFs must be:

- printable
- consistent formatting
- include branding (logo/header)
- stored in object storage or server filesystem under /uploads (V0 acceptable)

## Storage paths (recommended)

- uploads/generated/authority-to-sell/{atsId}/v{n}.pdf
- uploads/generated/earnest-money/{emaId}/v{n}.pdf
- uploads/generated/appraisal/{reportId}/v{n}.pdf

Store in DB:

- storageKey (or relative path)
- url (public or signed)
- version number
- finalizedAt, finalizedBy

## HTML -> PDF approach

- Build an HTML template per document type.
- Fill placeholders from DB record snapshot.
- Render using a headless browser (Playwright/Puppeteer) or a PDF library.
- Save PDF file and write finalPdf metadata to the record.

## Finalization rules

- FINALIZE action:
  - snapshots data
  - generates PDF
  - writes finalPdf.version = previousVersion + 1
  - sets status FINAL (or similar)
- After FINALIZE:
  - do not allow editing of the finalized record fields
  - only allow "create new version" action

## Audit logging

Record these actions:

- ATS_FINALIZED
- EMA_FINALIZED
- APPRAISAL_FINALIZED
- APPRAISAL_RELEASED
- PROPERTY_STATUS_CHANGED
  Include entityId and actorUserId in audit meta.
