## Ticket 004i — Notifications & Application Activity Log

### Summary

- Added Notification model + endpoints for list/unread/read.
- Added Application activity trail (embedded).
- Hooked notifications and activity into application create/status change.
- Frontend notifications page + navbar badge; shows latest activity on client/admin apps.
- Added notification type APPLICATION_MESSAGE_RECEIVED (used by 004j).

### Endpoints

- `GET /api/notifications` (auth) — user’s notifications, newest first (limit 50)
- `GET /api/notifications/unread-count` (auth)
- `PATCH /api/notifications/:id/read` (auth, owner only)
- `PATCH /api/notifications/read-all` (auth)

### Models

- `Notification`: user, type, title, message, link, metadata, isRead, timestamps. Indexes on user/isRead/createdAt.
- `Application`: added `activity` array { at, actorId, actorRole, action, fromStatus, toStatus, note }.

### Hooks

- Application create → activity SUBMITTED + notification to buyer.
- Status change → activity STATUS_CHANGED + notification to buyer; property sync to RESERVED on APPROVED remains idempotent.

### Frontend

- Navbar badge with unread count; `/notifications` page to list/mark read/mark all read.
- Apply/Properties dialogs already handle 403/409; apply CTA only for published + role=user.
- Dashboard and admin applications show last activity timestamp.

### Tests (manual)

- User applies → notification + activity, unread count increments.
- Duplicate apply → 409, no extra notification/activity.
- Status change by staff → buyer notification + activity from→to.
- Notifications list/read/read-all scoped to current user only.

# Vibe Coding with AI — 004i — Notifications + Application Activity Log

**File:** `.docs/004i-notifications-and-audit-log.md`

---

## 1) Goal

Add:

1. **In-app notifications** for buyer + staff/admin.
2. **Application activity log** (audit trail / timeline) for each application.

This improves transparency and reduces support questions like “what happened to my application?”

---

## 2) Scope

### In scope

- Persist notifications in MongoDB
- Mark notifications as read/unread
- Create activity entries on key actions:
  - submit
  - withdraw
  - status change
  - notes added (admin)
- Show UI:
  - Buyer notifications list
  - Application details timeline

### Out of scope (for now)

- Email/SMS sending (we’ll create stubs/hooks)
- Push notifications

---

## 3) Data Model

### 3.1 Notification schema

Collection: `notifications`

Fields:

- `user` (ObjectId → User, required, indexed) — recipient
- `type` (enum)
  - `APPLICATION_SUBMITTED`
  - `APPLICATION_STATUS_CHANGED`
  - `APPLICATION_WITHDRAWN`
- `title` (string)
- `message` (string)
- `link` (string) — URL path (e.g. `/my/applications` or `/admin/applications/:id`)
- `metadata` (object)
  - `applicationId`, `propertyId`, `status`, etc.
- `isRead` (boolean, default false, indexed)
- timestamps

Indexes:

- `{ user: 1, isRead: 1, createdAt: -1 }`

---

### 3.2 Application activity log

Option A (recommended): embed activity in Application doc:

- `activity: [ { at, actorId, actorRole, action, fromStatus, toStatus, note } ]`

Option B: separate `application_activities` collection.

Choose A for simplicity unless you expect huge logs.

Activity entry fields:

- `at` (Date)
- `actorId` (ObjectId)
- `actorRole` (string: user/staff/admin/system)
- `action` (enum)
  - `SUBMITTED`
  - `WITHDRAWN`
  - `STATUS_CHANGED`
  - `NOTES_ADDED`
- `fromStatus` (optional)
- `toStatus` (optional)
- `note` (optional) — sanitized

---

## 4) Backend API

### 4.1 Notifications (buyer/staff)

- `GET /api/notifications` → list (newest first)
- `PATCH /api/notifications/:id/read` → mark one as read
- `PATCH /api/notifications/read-all` → mark all as read
- `GET /api/notifications/unread-count` → number badge

Auth: require login. Only allow reading/updating own notifications.

---

## 5) Writing Notifications + Activity (where to hook)

### On buyer submit application

- Add activity: `SUBMITTED`
- Create notification to:
  - buyer: “Application submitted”
  - (optional) staff/admin: “New application received”

### On buyer withdraw

- Add activity: `WITHDRAWN`
- Notify staff/admin (optional) + buyer confirmation

### On admin status change

- Add activity: `STATUS_CHANGED` with from/to + notes if provided
- Notify buyer: “Status updated to \_\_\_”

### On admin notes added

- Add activity: `NOTES_ADDED`
- Notify buyer only if notes are intended to be visible (otherwise keep internal)

---

## 6) Frontend UX

### 6.1 Notifications UI

Add to navbar:

- Bell icon with unread count
- Clicking opens:
  - dropdown preview (optional) OR
  - navigate to `/notifications`

Notifications page:

- list cards: title, message, date, action “Mark read”
- “Mark all as read”

### 6.2 Application timeline

On application details screen:

- show vertical timeline of activity events:
  - icon + action label
  - actor + timestamp
  - status change details

---

## 7) Security + Privacy

- Buyer can only see:
  - their own notifications
  - their own application activity
- Admin/staff can see:
  - activity for applications they can access
- Notes:
  - If notes are internal-only, store them separately from buyer-visible notes

---

## 8) Acceptance Criteria

- [ ] Notifications are created on submit, withdraw, status change
- [ ] Unread count works
- [ ] Mark read and mark all read work
- [ ] Timeline shows correct sequence of actions with actor and timestamps
- [ ] No cross-user access to notifications

---

## 9) Testing Checklist

- [ ] Submit creates activity + notifications
- [ ] Admin status change creates activity + buyer notification
- [ ] Unread count decrements when marking read
- [ ] Buyer cannot access another user’s notifications
- [ ] Timeline renders consistently

---

## 10) Next step

004j — Communication: secure buyer↔staff messaging on an application thread (optional), or email delivery integration.
