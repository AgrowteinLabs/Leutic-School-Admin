# Teacher Substitution — Backend Integration Spec

> **Author:** Frontend Team  
> **Audience:** Backend Team (identity-service / school-structure-service)  
> **Status:** Draft — awaiting backend implementation  
> **Priority:** Medium — enables Calendar "Teacher Schedules" tab to mark absences & assign substitutes

---

## 1. Overview

The Calendar page (`CalendarPage.tsx`) has three views: **Teacher Schedules**, **Class Timetables**, and **Institutional Calendar**. Currently, the Teacher Schedules tab can **display** a teacher's timetable for any given day, but there is no way to:

1. Mark a teacher as absent / on leave for a date range
2. Assign a substitute teacher to cover their periods

We need GraphQL operations to enable these flows from the admin dashboard.

---

## 2. Database Context

The `LeaveRequest` model **already exists** in the identity-service Prisma schema:

```prisma
model LeaveRequest {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  schoolId   String
  startDate  DateTime @db.Date
  endDate    DateTime @db.Date
  reason     String
  status     String   @default("PENDING") // PENDING, APPROVED, REJECTED
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
  @@index([schoolId])
  @@index([status])
}
```

### Required Schema Change

The current `LeaveRequest` model does not track **who is substituting**. Please add a `substituteTeacherId` field:

```prisma
model LeaveRequest {
  // ... existing fields ...
  substituteTeacherId String?
  substituteTeacher   User? @relation("SubstituteTeacher", fields: [substituteTeacherId], references: [id])
  // ... existing fields ...
}
```

---

## 3. GraphQL API Contract

### 3.1 Query: `leaveRequests`

Fetch all leave requests for a school (to display on the calendar).

```graphql
query GetLeaveRequests($schoolId: ID!) {
  leaveRequests(schoolId: $schoolId) {
    id
    userId
    userName
    schoolId
    startDate
    endDate
    reason
    status                # PENDING | APPROVED | REJECTED
    substituteTeacherId
    substituteTeacherName
    createdAt
    updatedAt
  }
}
```

### 3.2 Mutation: `createLeaveRequest`

Create a leave request (auto-approved when admin creates it, or PENDING for teacher self-service).

```graphql
mutation CreateLeaveRequest($input: CreateLeaveRequestInput!) {
  createLeaveRequest(input: $input) {
    id
    userId
    userName
    status
    substituteTeacherId
    substituteTeacherName
    startDate
    endDate
  }
}
```

**Input type:**

```graphql
input CreateLeaveRequestInput {
  userId: String!                # The teacher who is absent
  schoolId: String!
  startDate: String!             # ISO date (e.g. "2026-07-15")
  endDate: String!               # ISO date (e.g. "2026-07-15")
  reason: String
  substituteTeacherId: String    # ID of the covering teacher (nullable)
}
```

### 3.3 Mutation: `updateLeaveRequest`

Update status (APPROVED / REJECTED) or change substitute assignment.

```graphql
mutation UpdateLeaveRequest($id: ID!, $input: UpdateLeaveRequestInput!) {
  updateLeaveRequest(id: $id, input: $input) {
    id
    status
    substituteTeacherId
    substituteTeacherName
  }
}
```

**Input type:**

```graphql
input UpdateLeaveRequestInput {
  status: String                 # PENDING | APPROVED | REJECTED
  substituteTeacherId: String
}
```

### 3.4 Mutation: `removeLeaveRequest`

Delete a leave request.

```graphql
mutation RemoveLeaveRequest($id: ID!) {
  removeLeaveRequest(id: $id) {
    id
  }
}
```

---

## 4. Business Rules

| Rule | Description |
|------|-------------|
| **Role access** | Only `SCHOOL_ADMIN`, `APP_ADMIN`, `SUPER_ADMIN` can create/update/delete leave requests |
| **School scope** | Admin must belong to or manage the same school as the teacher |
| **Auto-approval** | When admin creates a leave request, status should default to `APPROVED` |
| **Date validation** | `endDate` must be >= `startDate` |
| **Overlap check** | Optional — warn if teacher already has a leave request for the same date range |
| **Substitute validation** | If `substituteTeacherId` is provided, verify the user exists and has role `TEACHER` |
| **Visibility** | Frontend will query all approved leave requests and overlay them on the calendar grid for the selected month |

---

## 5. Frontend Usage Context

The frontend will consume these operations in `CalendarPage.tsx`:

### Teacher Schedules View (current)

| UI Element | Current Behavior | Planned Enhancement |
|------------|-----------------|-------------------|
| Teacher timetable list | Shows periods with subject & teacher name | Same |
| Period rows | Read-only display | Add "Substitute" badge if teacher is on leave that day |
| Sidebar actions | "Declare Holiday" only | Add **"Mark Absent / Assign Substitute"** button |

### Data Flow

```
1. Calendar loads → fetch leaveRequests(schoolId) for the visible month
2. For each selected teacher, check if they have an APPROVED leave request
   overlapping the selected date
3. If yes → show "On Leave" badge + substitute teacher name on their timetable
4. Admin clicks "Mark Absent" → opens modal → selects substitute → 
   calls createLeaveRequest → refreshes
```

### Expected Response Time

These operations are low-volume (sporadic admin actions). No caching requirements.

---

## 6. Sample Variables

### Create Leave Request
```json
{
  "input": {
    "userId": "uuid-of-absent-teacher",
    "schoolId": "uuid-of-school",
    "startDate": "2026-07-15",
    "endDate": "2026-07-15",
    "reason": "Medical leave",
    "substituteTeacherId": "uuid-of-substitute-teacher"
  }
}
```

### Query Leave Requests
```json
{
  "schoolId": "uuid-of-school"
}
```

---

## 7. Related Files

| File | Purpose |
|------|---------|
| `src/features/calendar/pages/CalendarPage.tsx` | Frontend calendar — will consume these operations |
| `services/identity-service/prisma/schema.prisma` | Backend — `LeaveRequest` model (needs `substituteTeacherId` field) |
| `services/identity-service/src/users/` | Backend — resolver & service layer |
