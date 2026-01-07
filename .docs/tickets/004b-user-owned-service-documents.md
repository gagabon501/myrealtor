# Ticket 004b — User-owned Service Documents (Appraisal / Titling / Consultancy)

## Goal

Allow registered users (`role=user`) to upload and view documents for their **own service requests** (e.g. appraisal, title transfer, consultancy), while preventing access to other users’ documents. Staff/admin can access all.

## Scope

### Backend

- Add ownership enforcement for Document Library for service modules:
  - APPRAISAL
  - TITLING
  - CONSULTANCY
- Upload rules:
  - Must be authenticated (user/staff/admin)
  - Set `uploadedBy = req.user.id` server-side
  - Validate that `ownerId` belongs to the authenticated user when role=user
- List rules:
  - user: only documents for service requests owned by the user
  - staff/admin: all docs
- Delete rules:
  - staff/admin only (keep simple for now)

### Frontend

- Add "My Services" area or embed document section inside each service request detail page:
  - users can upload docs and see their list
- Reuse DocumentUploader + DocumentList
- Maintain required Document Description

## Ownership Definition

A document is user-accessible if:

- module in [APPRAISAL, TITLING, CONSULTANCY] AND
- the referenced service request (ownerId) has createdBy/userId == req.user.id

## Acceptance Criteria

- user can upload/list docs for their own service request
- user cannot access docs for other users’ requests (403)
- staff/admin can access all docs
- no regression to PROPERTY/INQUIRY restrictions from 004a

## Postman Tests

Base: https://apimyrealtor.nodesafe.cloud/api

1. User upload own service doc -> 201
2. User list own service docs -> 200
3. User list someone else’s service docs -> 403
4. Admin list any -> 200
