# Communications & Notices — Backend Integration Spec

> **Author:** Frontend Team  
> **Audience:** Backend Team (communication-service / identity-service)  
> **Status:** Draft — awaiting backend implementation  
> **Priority:** High — enables full notice lifecycle with scheduling, filtering, and stats

---

## 1. Overview

The **Communications** module has two tabs:

| Tab | Frontend Page | Current Status |
|-----|---------------|----------------|
| **Messages** | `CommunicationsPage.tsx` | ❌ Empty shell — real-time staff chat not built yet |
| **Institutional Notices** | `AnnouncementsPage.tsx` | ⚠️ Partially functional — listing & creation work, but filtering, editing, deletion, scheduling, and stats are missing |

### What Works Today

| Operation | Frontend | Backend |
|-----------|----------|---------|
| List all announcements | ✅ `announcements` query | ✅ Available |
| Create announcement | ✅ `createAnnouncement` mutation | ✅ Available — `CreateAnnouncementDto` |
| Update announcement | ❌ Not wired in frontend | ✅ `updateAnnouncement` exists |
| Delete announcement | ❌ Not wired in frontend | ✅ `removeAnnouncement` exists |

---

## 2. Backend Model Changes Needed

### Current `Announcement` model (communication-service)

```prisma
model Announcement {
  id               String   @id @default(uuid())
  schoolId         String?
  classId          String?
  title            String
  content          String
  targetRole       String[]
  authoredByUserId String?
  version          Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Required Changes

Add the following fields to enable filtering by status and scheduling:

```prisma
enum AnnouncementStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}

model Announcement {
  id               String              @id @default(uuid())
  schoolId         String?
  classId          String?
  title            String
  content          String
  targetRole       String[]
  authoredByUserId String?
  status           AnnouncementStatus  @default(DRAFT)    // NEW
  scheduledAt      DateTime?                              // NEW — when to auto-publish
  publishedAt      DateTime?                              // NEW — when it was actually published
  archivedAt       DateTime?                              // NEW — soft delete
  version          Int                 @default(0)
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  @@index([schoolId])
  @@index([classId])
  @@index([status])                                       // NEW — needed for filtering
}
```

---

## 3. GraphQL API Contract — Full CRUD + Filtering

### 3.1 Query: `announcements`

Add `status` and `schoolId` filter support:

```graphql
query GetAnnouncements($schoolId: String, $status: AnnouncementStatus, $page: Int, $pageSize: Int) {
  announcements(schoolId: $schoolId, status: $status, page: $page, pageSize: $pageSize) {
    items {
      id
      title
      content
      targetRoles
      schoolId
      classId
      authoredByUserId
      status            # DRAFT | PUBLISHED | SCHEDULED | ARCHIVED
      scheduledAt
      publishedAt
      createdAt
      updatedAt
    }
    total
    page
    pageSize
  }
}
```

### 3.2 Mutation: `createAnnouncement`

Add `status` and `scheduledAt` to the input:

```graphql
mutation CreateAnnouncement($input: CreateAnnouncementInput!) {
  createAnnouncement(input: $input) {
    id
    title
    status
    scheduledAt
  }
}
```

**Input type (updated):**
```graphql
input CreateAnnouncementInput {
  schoolId: String!
  classId: String
  title: String!
  content: String!
  targetRoles: [String!]!
  status: AnnouncementStatus  # default DRAFT
  scheduledAt: String         # ISO date — required if status = SCHEDULED
}
```

### 3.3 Mutation: `updateAnnouncement`

Already exists but may need status/schedule support:

```graphql
mutation UpdateAnnouncement($id: ID!, $input: UpdateAnnouncementInput!) {
  updateAnnouncement(id: $id, input: $input) {
    id
    title
    status
    scheduledAt
    publishedAt
  }
}
```

**Input type:**
```graphql
input UpdateAnnouncementInput {
  title: String
  content: String
  targetRoles: [String!]
  status: AnnouncementStatus
  scheduledAt: String
}
```

### 3.4 Mutation: `removeAnnouncement`

Soft-delete (set status to ARCHIVED) or hard-delete:

```graphql
mutation RemoveAnnouncement($id: ID!) {
  removeAnnouncement(id: $id) {
    id
  }
}
```

### 3.5 Mutation: `archiveAnnouncement`

Explicit archive action:

```graphql
mutation ArchiveAnnouncement($id: ID!) {
  archiveAnnouncement(id: $id) {
    id
    status
    archivedAt
  }
}
```

---

## 4. New Query: Announcement Stats

The frontend shows stat cards at the top of the notices list. Currently hardcoded; need a real query:

```graphql
query GetAnnouncementStats($schoolId: String!) {
  announcementStats(schoolId: $schoolId) {
    totalCount          # total notices
    publishedCount      # status = PUBLISHED
    draftCount          # status = DRAFT
    scheduledCount      # status = SCHEDULED
    archivedCount       # status = ARCHIVED
  }
}
```

**Return type:**
```graphql
type AnnouncementStats {
  totalCount: Int!
  publishedCount: Int!
  draftCount: Int!
  scheduledCount: Int!
  archivedCount: Int!
}
```

---

## 5. Messages / Staff Coordination

### Current State

The **Messages tab** (`CommunicationsPage.tsx`) is an empty placeholder:

> *"Internal staff chats and institutional coordination are active. Select a thread or start a new coordination session."*

The **"Start Coordination"** button does nothing — no backend model exists for real-time staff chat.

### Recommended Approach (Future Phase)

This is a larger feature and should be scoped separately. The backend would need:

| Feature | Backend Requirement |
|---------|---------------------|
| **Conversations** | New `Conversation` model — participants, createdAt |
| **Messages** | New `Message` model — conversationId, senderId, content, attachment, sentAt |
| **Real-time updates** | WebSocket / Subscription support for live messaging |
| **Read receipts** | `readAt` timestamps per participant |
| **Push notifications** | Integration with notification dispatch for offline users |

**For now:** The frontend will keep the tab as a placeholder with a "Coming Soon" indicator on the button.

---

## 6. Business Rules

| Rule | Description |
|------|-------------|
| **Status defaults** | New announcements created without explicit status should default to `DRAFT` |
| **Scheduling** | If `status = SCHEDULED` and `scheduledAt` is in the past, auto-publish on save (set to `PUBLISHED`, set `publishedAt`) |
| **Backend auto-publish** | A cron job or queued task should publish `SCHEDULED` announcements when `scheduledAt` is reached |
| **Archiving** | `removeAnnouncement` should set `status = ARCHIVED` + `archivedAt` instead of hard-deleting |
| **Archive filter** | By default, `announcements` query should NOT return archived items unless `status: ARCHIVED` is explicitly requested |
| **Role-based access** | `createAnnouncement`, `updateAnnouncement`, `removeAnnouncement` should be limited to `SCHOOL_ADMIN`, `APP_ADMIN`, `SUPER_ADMIN` |
| **School scope** | Queries and mutations must be scoped by `schoolId` — admins should only see/manage their school's announcements. Currently the frontend queries `announcements` **without** a `schoolId` filter because the backend doesn't support it yet — this is a required addition. |
| **Field name alignment** | The Prisma schema field is `targetRole` (singular, `String[]`), but the frontend GraphQL query uses `targetRoles` (plural) and the mutation DTO passes `targetRoles`. The backend resolver must expose this as `targetRoles` in the GraphQL schema (via field resolver or DTO mapping). |

---

## 7. Frontend Feature → Backend Gap Summary

| Frontend Feature | Current Behavior | Backend Needed | Priority |
|-----------------|------------------|----------------|----------|
| **Notice list with search** | ✅ Works — `announcements` query | — | Done |
| **Create notice** | ✅ Works — `createAnnouncement` mutation | — | Done |
| **Edit notice** | ❌ Not wired — no edit UI on list rows | `updateAnnouncement` exists, needs `status`/`scheduledAt` | Medium |
| **Delete notice** | ❌ Not wired — no delete UI on list rows | `removeAnnouncement` exists | Medium |
| **Filter: Published** | 🟡 Hardcoded — shows all notices with no status filter | Add `status` field + filter param to `announcements` query | High |
| **Filter: Drafts** | ❌ Always shows 0 results | Add `status` field to model | High |
| **Filter: Scheduled** | ❌ Always shows 0 results | Add `status` + `scheduledAt` fields | High |
| **Schedule notice** | ❌ No scheduling UI in AddNoticePage | Add `status` + `scheduledAt` to model & mutation | High |
| **Stat cards** | ❌ Hardcoded (72%, 99.9%, 0) | New `announcementStats` query | High |
| **Messages / Coordination** | ❌ Empty placeholder | New Conversation + Message models (future scope) | Low |

---

## 8. Sample Variables

### Create Draft Notice
```json
{
  "input": {
    "schoolId": "uuid-of-school",
    "title": "Parent-Teacher Meeting",
    "content": "The annual parent-teacher meeting will be held on...",
    "targetRoles": ["PARENT", "TEACHER"],
    "status": "DRAFT"
  }
}
```

### Create Scheduled Notice
```json
{
  "input": {
    "schoolId": "uuid-of-school",
    "title": "Holiday Announcement",
    "content": "School will remain closed on...",
    "targetRoles": ["STUDENT", "PARENT", "TEACHER", "DRIVER"],
    "status": "SCHEDULED",
    "scheduledAt": "2026-07-20T08:00:00.000Z"
  }
}
```

### Query Published Notices
```json
{
  "schoolId": "uuid-of-school",
  "status": "PUBLISHED",
  "page": 1,
  "pageSize": 20
}
```

---

## 9. Related Files

| File | Purpose |
|------|---------|
| `src/features/communications/pages/AnnouncementsPage.tsx` | Notice list — needs status filter + row actions |
| `src/features/communications/pages/AddNoticePage.tsx` | Notice creation — needs scheduling UI in future |
| `src/features/communications/pages/CommunicationsPage.tsx` | Messages tab — empty placeholder |
| `src/features/communications/pages/CommunicationsHubPage.tsx` | Tab hub — coordinates both tabs |
| `services/communication-service/prisma/schema.prisma` | Backend — `Announcement` model needs changes |
| `services/communication-service/src/announcements/` | Backend — resolver & service layer |
