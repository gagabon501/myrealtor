# Ticket 003b — Buyer Inquiry document attachments (Document Library reuse)

## Goal

Allow staff/admin to upload and manage documents (with required Document Description) against Buyer Inquiries using the shared Document Library module.

## Scope (Frontend)

- Add a "Documents" action in Admin Buyer Inquiries list.
- Provide a modal/drawer/panel to:
  - Upload documents for an inquiry (DocumentUploader)
  - View list of uploaded documents for an inquiry (DocumentList)
- Ensure Document Description is required for every uploaded file.
- Show Description in all lists.
- Allow Delete only for staff/admin (as per existing backend rules).

## Scope (Backend)

- No new infra changes.
- Reuse existing document-library endpoints and model.
- Ensure module/ownerType/ownerId support:
  - module=INQUIRY
  - ownerType=BuyerInquiry
  - ownerId=<buyerInquiry _id>

## Proposed payload mapping

- module: INQUIRY
- ownerType: BuyerInquiry
- ownerId: buyerInquiry.\_id
- category: PHOTO or ATTACHMENT (frontend dropdown)
- descriptions: required per file row

## Acceptance Criteria

- Admin inquiries table has a "Documents" CTA.
- Clicking opens a panel showing uploader + list for that inquiry.
- Upload requires description per file.
- Uploaded docs appear immediately with description.
- Delete works for staff/admin and refreshes list.

## Postman tests

Base:
https://apimyrealtor.nodesafe.cloud/api

1. Upload (staff/admin)
   POST /document-library
   form-data:

- module=INQUIRY
- ownerType=BuyerInquiry
- ownerId=<real inquiry _id>
- category=ATTACHMENT
- descriptions=<desc per file row>
- labels=<optional per file row>
- files=<attach one or more>

2. List
   GET /document-library?module=INQUIRY&ownerId=<inquiryId>

3. Delete
   DELETE /document-library/<documentId> (Bearer token)
