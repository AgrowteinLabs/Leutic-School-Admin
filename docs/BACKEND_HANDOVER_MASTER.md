# 🏛️ Backend Integration — Master Handover Document

> **Date:** July 2026  
> **Frontend GraphQL Endpoint:** `http://3.7.222.252:4000/graphql`  
> **Users Service:** Configured via Vite proxy  
> **Authentication:** JWT Bearer tokens with silent refresh

---

## Table of Contents

1. [Integration Status Overview](#1-integration-status-overview)
2. [✅ Already Integrated (for reference)](#2--already-integrated-for-reference)
3. [🔴 CRITICAL: Reports & Analytics — New Microservice Needed](#3--critical-reports--analytics)
4. [🔴 CRITICAL: Transportation Routes — No Backend](#4--critical-transportation-routes)
5. [🔴 CRITICAL: Fleet Management — No Backend](#5--critical-fleet-management)
6. [🔴 CRITICAL: Finance & Fees — No Backend](#6--critical-finance--fees)
7. [🟡 MEDIUM: Programs — Missing Fields](#7--medium-programs--missing-fields)
8. [🔧 Fixes Already Applied in This Session](#8--fixes-already-applied-in-this-session)
9. [📄 Spec Documents Referenced](#9--spec-documents-referenced)

---

## 1. Integration Status Overview

| Module | Status | Pages | Needs |
|--------|--------|-------|-------|
| Auth | ✅ | Login, Password Reset | — |
| Dashboard | ✅ | Dashboard, Alerts, ProgramsTable, ParticipationOverview | — |
| Teachers/Staff | ✅ | StaffPage, StaffProfilePage | — |
| Drivers | ✅ | DriversPage, DriverProfilePage | — |
| Students | ✅ | StudentsPage, StudentProfile, KnowYourStudent, EnrollStudent | — |
| Classes | ✅ | ClassesPage, ClassDetailsPage, AttendancePage, CreateClass | — |
| Calendar | ✅ | CalendarPage (Events, Timetables) | See spec for direct `events` query |
| Community | ✅ | CommunityPage (Posts, Replies, Q&A, Moderation) | See spec for event sync |
| Curriculum | ✅ | CurriculumPage (Subjects, Grades, Mappings, Timetables) | — |
| Examinations | ✅ | ExaminationsPage, AddExamination, MarksEntry | — |
| Quizzes | ✅ | QuizzesPage, CreateQuizPage | — |
| Notices | ✅ | AddNoticePage, AnnouncementsPage | — |
| Directory | ✅ | DirectoryPage, AddStaffPage, AddDriverPage | — |
| Settings | ✅ | SettingsPage, AcademicYearsPage, GradeConfigurationPage | — |
| **Reports** | **🔴** | ReportsPage + 8 tab components | **New microservice** |
| **Routes** | **🔴** | RoutesPage | **New queries + mutations** |
| **Vehicles** | **🔴** | VehiclesPage, AddVehiclePage | **New queries + mutations** |
| **Fees** | **🔴** | FeesPage | **New queries + mutations** |
| **Programs** | **🟡** | ProgramsPage, AddProgramPage | **Missing fields** |

---

## 2. ✅ Already Integrated (for reference)

These modules are fully connected to GraphQL and do **not** need backend work.

### Verified Backend Endpoints (already working)

| Query/Mutation | Used By | Status |
|---|---|---|
| `Query.users` (with role filters) | Staff, Students, Drivers, Teachers, Calendar | ✅ |
| `Query.classes` | Classes, Curriculum, Calendar, Attendance | ✅ |
| `Query.calendars` | Calendar, Dashboard ProgramsTable | ✅ |
| `Query.classTimetable` | Calendar, Curriculum | ✅ |
| `Query.teacherTimetable` | Calendar | ✅ |
| `Query.communityPosts` | Community | ✅ |
| `Query.subjects` | Curriculum | ✅ |
| `Query.gradeConfigs` | Curriculum | ✅ |
| `Query.curriculumMappings` | Curriculum | ✅ |
| `Query.timetableConfig` | Curriculum | ✅ |
| `Query.specialPrograms` | Programs (partial) | ✅ but limited |
| `Query.exams` | Examinations | ✅ |
| `Query.quizzes` | Quizzes | ✅ |
| `Query.school` (school profile) | Settings, AppContext | ✅ |
| `Mutation.createUser` / `updateUser` / `removeUser` | Staff, Students, Drivers, Directory | ✅ |
| `Mutation.createClass` / `bulkCreateClasses` | Classes | ✅ |
| `Mutation.createEvent` / `updateEvent` / `removeEvent` | Calendar | ✅ |
| `Mutation.createCalendar` | Calendar | ✅ |
| `Mutation.createPost` / `moderatePost` / `rejectPost` | Community | ✅ |
| `Mutation.createReply` / `verifyReply` / `upvoteReply` | Community | ✅ |
| `Mutation.bulkSaveCurriculumMappings` / `removeCurriculumMapping` | Curriculum | ✅ |
| `Mutation.createSubject` / `updateSubject` / `removeSubject` | Curriculum | ✅ |
| `Mutation.saveGradeConfig` / `removeGradeConfig` | Curriculum | ✅ |
| `Mutation.saveClassTimetable` / `saveTimetableConfig` | Curriculum | ✅ |
| `Mutation.saveAcademicYearDraft` / `initiateAcademicYearRollover` | Settings | ✅ |
| `Mutation.createAnnouncement` | ClassDetails, AddNotice | ✅ |
| `Mutation.batchSaveAttendance` / `saveStaffAttendanceBatch` | Attendance | ✅ |
| `Mutation.bulkSaveMarks` | MarksEntry | ✅ |

---

## 3. 🔴 CRITICAL: Reports & Analytics — No Backend

**Status:** 100% sample data (`src/features/reports/data/sampleData.ts`)  
**Pages:** `ReportsPage.tsx` + 8 tab components  
**Budget:** Requires a dedicated Reporting & Analytics microservice

### 3.1 Frontend Tab Structure

The Reports page has **8 tabs**, each with their own component importing from `sampleData.ts`:

| Tab | Component | Data File | Field Count |
|-----|-----------|-----------|-------------|
| Academic | `AcademicTab.tsx` | `sampleData.ts` | 4 datasets |
| Attendance | `AttendanceTab.tsx` | `sampleData.ts` | 3 datasets |
| Finance | `FinanceTab.tsx` | `sampleData.ts` | 4 datasets |
| Assessments | `AssessmentTab.tsx` | `sampleData.ts` | 3 datasets |
| Engagement | `EngagementTab.tsx` | `sampleData.ts` | 2 datasets |
| Notifications | `NotificationTab.tsx` | `sampleData.ts` | 3 datasets |
| Transport | `TransportTab.tsx` | `sampleData.ts` | 2 datasets |
| Aura Points | `AuraTab.tsx` | `sampleData.ts` | 3 datasets |

### 3.2 Required Queries by Tab

#### Academic Tab
```graphql
type Query {
  # Class-wise subject performance (bar chart)
  classPerformance(schoolId: String!, academicYearId: String): [ClassPerformance!]!
  # Subject aggregate stats (KPI cards)
  subjectPerformance(schoolId: String!, academicYearId: String): [SubjectPerformance!]!
  # Exam-to-exam comparison (line chart)
  examComparison(schoolId: String!, examIds: [String!]): [ExamComparison!]!
  # Teacher-wise performance (table)
  teacherPerformance(schoolId: String!, academicYearId: String): [TeacherPerformance!]!
}

type ClassPerformance {
  class: String!       # e.g. "6-A"
  maths: Float!
  science: Float!
  english: Float!
  hindi: Float!
  social: Float!
}

type SubjectPerformance {
  subject: String!
  average: Float!
  passRate: Float!
  topScore: Float!
  bottomScore: Float!
}

type TeacherPerformance {
  teacher: String!
  subject: String!
  avgMarks: Float!
  passRate: Float!
  students: Int!
}
```

#### Attendance Tab
```graphql
type Query {
  dailyAttendance(schoolId: String!, date: String): [ClassAttendance!]!
  attendanceTrend(schoolId: String!, weeks: Int): [AttendanceTrend!]!
  chronicAbsentees(schoolId: String!, threshold: Float, limit: Int): [ChronicAbsentee!]!
}

type ClassAttendance {
  class: String!
  total: Int!
  present: Int!
  absent: Int!
  halfDay: Int!
  percentage: Float!
}

type ChronicAbsentee {
  id: String!
  name: String!
  class: String!
  attendance: Float!
  daysAbsent: Int!
  status: String!   # "critical" or "warning"
}
```

#### Finance Tab
```graphql
type Query {
  feeCollectionSummary(schoolId: String!, academicYearId: String): FeeCollectionSummary!
  classWiseFee(schoolId: String!, academicYearId: String): [ClassFee!]!
  feeDefaulters(schoolId: String!, academicYearId: String, limit: Int): [FeeDefaulter!]!
  feeReminderFunnel(schoolId: String!): [FunnelStage!]!
}

type FeeCollectionSummary {
  totalFees: Float!
  collected: Float!
  pending: Float!
  overdue: Float!
  collectionRate: Float!
}

type FeeDefaulter {
  id: String!
  name: String!
  class: String!
  amount: Float!
  daysOverdue: Int!
  reminders: Int!
}
```

#### Assessment Tab
```graphql
type Query {
  quizPerformance(schoolId: String!): [QuizPerformance!]!
  quizParticipationByClass(schoolId: String!): [QuizClassParticipation!]!
  competitionResults(schoolId: String!): [CompetitionResult!]!
}
```

#### Engagement, Notification, Transport, Aura Tabs

These tabs display community analytics, notification delivery stats, transport logs, and gamification/aura data. The exact frontend fields are documented in `sampleData.ts` and can be provided on request.

### 3.3 Frontend Note

The Reports page displays a disclaimer:  
> *"Sample data • Not connected to API"*

Once the backend is ready, each tab component needs its import changed from `sampleData` to a `graphqlRequest` call.

---

## 4. 🔴 CRITICAL: Transportation Routes — No Backend

**Status:** 100% localStorage (`leutic-routes` key)  
**Pages:** `RoutesPage.tsx`  
**File:** `src/features/transportation/pages/RoutesPage.tsx`

### 4.1 Required Queries & Mutations

```graphql
extend type Query {
  routes(schoolId: String!): [Route!]!
  route(id: ID!): Route
}

extend type Mutation {
  createRoute(input: CreateRouteInput!): Route!
  updateRoute(id: ID!, input: UpdateRouteInput!): Route!
  removeRoute(id: ID!): ID!
}

type Route {
  id: ID!
  schoolId: String!
  name: String!           # e.g. "Route A - North Coast"
  driverName: String!     # e.g. "Madan Pal"
  vehicleRegNo: String!   # e.g. "KL01PC4456"
  vehicleName: String!    # e.g. "Bus 01"
  morningStartTime: String!  # e.g. "07:30 AM"
  morningEndTime: String!    # e.g. "09:00 AM"
  eveningStartTime: String   # e.g. "03:30 PM"
  eveningEndTime: String     # e.g. "05:00 PM"
  status: RouteStatus!    # ACTIVE or INACTIVE
  stops: [RouteStop!]!
  createdAt: DateTime
  updatedAt: DateTime
}

type RouteStop {
  id: ID!
  routeId: ID!
  name: String!        # e.g. "Marine Drive"
  orderIndex: Int!     # 0-based position in sequence
}

enum RouteStatus {
  ACTIVE
  INACTIVE
}

input CreateRouteInput {
  schoolId: String!
  name: String!
  driverName: String!
  vehicleRegNo: String!
  vehicleName: String!
  morningStartTime: String!
  morningEndTime: String!
  eveningStartTime: String
  eveningEndTime: String
  status: RouteStatus!
  stops: [CreateRouteStopInput!]!
}

input CreateRouteStopInput {
  name: String!
  orderIndex: Int!
}
```

### 4.2 Frontend Data Shape

The frontend `RouteItem` interface expects:
```typescript
interface RouteItem {
  id: string;
  name: string;
  driver: string;
  vehicle: string;
  startTime: string;    // morning start
  endTime: string;      // morning end
  status: string;       // "Active" | "Inactive"
  stops: string[];      // stop names in order
}
```

### 4.3 Frontend Actions (already built UI)

| Action | UI Component | Currently Does |
|--------|-------------|----------------|
| Create Route | Slide-over drawer with form | Saves to localStorage |
| Edit Route | Same drawer pre-filled | Saves to localStorage |
| Delete Route | `confirm()` dialog + PDSSuccessModal | Removes from localStorage |
| Drag-to-reorder stops | Native HTML5 drag & drop | Reorders in state |
| Search/Filter | Search input + status dropdown | Filters frontend state |

---

## 5. 🔴 CRITICAL: Fleet Management — No Backend

**Status:** 100% hardcoded array (`useState([...])`)  
**Pages:** `VehiclesPage.tsx`, `AddVehiclePage.tsx`  
**Files:** `src/features/transportation/pages/VehiclesPage.tsx`, `AddVehiclePage.tsx`

### 5.1 Required Queries & Mutations

```graphql
extend type Query {
  vehicles(schoolId: String!): [Vehicle!]!
  vehicle(id: ID!): Vehicle
}

extend type Mutation {
  createVehicle(input: CreateVehicleInput!): Vehicle!
  updateVehicle(id: ID!, input: UpdateVehicleInput!): Vehicle!
  removeVehicle(id: ID!): ID!
}

type Vehicle {
  id: ID!
  schoolId: String!
  regNumber: String!          # e.g. "KL01PC4456"
  vehicleType: String!         # e.g. "Standard Bus"
  manufacturer: String
  manufacturingYear: Int
  seatingCapacity: Int!
  fuelType: String!            # "Diesel" | "CNG" | "Electric" | "Petrol"
  chassisNumber: String
  # Compliance
  insurancePolicyNo: String
  insuranceExpiry: DateTime
  pucExpiry: DateTime
  fitnessExpiry: DateTime
  permitNo: String
  speedGovernorId: String
  # Tracking
  assignedRouteId: String
  assignedRouteName: String
  gpsImei: String
  cctvCapacity: String         # "No CCTV" | "256GB" | "512GB" | "1TB"
  panicButtonStatus: String    # "Calibrated" | "Needs Service"
  # Status
  status: VehicleStatus!       # "Active" | "Idle" | "AT_RISK"
  expiryCount: Int!
  createdAt: DateTime
  updatedAt: DateTime
}

enum VehicleStatus {
  ACTIVE
  IDLE
  AT_RISK
}
```

### 5.2 Frontend Data Shape (VehiclesPage table)

The frontend table displays:
```typescript
{
  id: string;         // Bus number, e.g. "01"
  type: string;       // "Standard Bus" | "Mini Bus" | "Van"
  regNo: string;      // "KL01PC4456"
  capacity: number;   // 42
  fuelType: string;   // "Diesel"
  route: string;      // "North Coast"
  status: string;     // "Active" | "Idle" | "At Risk"
  expiryCount: number; // Number of expiring documents
}
```

### 5.3 AddVehiclePage — 3-Step Form Fields

| Step | Field | Frontend Type |
|------|-------|---------------|
| 1 | Registration Number | Text input |
| 1 | Vehicle Type | Select (Standard Bus, Mini Bus, Van, Electric Shuttle) |
| 1 | Manufacturer | Text input |
| 1 | Manufacturing Year | Text input |
| 1 | Seating Capacity | Text input |
| 1 | Fuel Type | Select (CNG, Diesel, Electric, Petrol) |
| 1 | Chassis Number | Text input |
| 2 | Insurance Policy Number | Text input |
| 2 | Insurance Expiry | Date picker |
| 2 | PUC Expiry | Date picker |
| 2 | Fitness Certificate Expiry | Date picker |
| 2 | Permit Registration No. | Text input |
| 2 | Speed Governor ID | Text input |
| 3 | Primary Route Mapping | Searchable select from `routes` query |
| 3 | GPS Tracker IMEI | Text input |
| 3 | CCTV Storage Capacity | Select |
| 3 | Panic Button Calibration | Select |

### 5.4 Frontend Note

The "Complete Registration" button (`handleFinalize`) currently just shows a PDSSuccessModal — it does **not** call any mutation. After the backend is ready, this function should call `createVehicle` mutation.

---

## 6. 🔴 CRITICAL: Finance & Fees — No Backend

**Status:** 100% hardcoded (`feeStats` and `feeRecords` arrays)  
**Page:** `FeesPage.tsx`  
**File:** `src/features/finance/pages/FeesPage.tsx`

### 6.1 Required Queries & Mutations

```graphql
extend type Query {
  feeCollectionSummary(schoolId: String!, academicYearId: String): FeeCollectionSummary!
  feeRecords(
    schoolId: String!
    academicYearId: String
    status: FeeStatus
    search: String
    page: Int
    pageSize: Int
  ): PaginatedFeeRecords!
  feeCategories: [FeeCategory!]!
}

extend type Mutation {
  createFee(input: CreateFeeInput!): FeeRecord!
  updateFee(id: ID!, input: UpdateFeeInput!): FeeRecord!
  removeFee(id: ID!): ID!
  sendFeeReminder(feeRecordIds: [String!]!): Int!
  recordPayment(id: ID!, method: String!, amount: Float!, date: DateTime): FeeRecord!
}

type FeeCollectionSummary {
  totalFees: Float!
  collected: Float!
  pending: Float!
  overdue: Float!
  collectionRate: Float!
  thisMonthCollection: Float!
  monthlyGrowth: Float!
  autoRemindersSent: Int!
}

type FeeRecord {
  id: ID!
  studentId: String!
  studentName: String!
  grade: String!
  category: String!         # "Tuition Fee" | "Transport Fee" | "Exam Fee" | etc.
  amount: Float!
  dueDate: DateTime!
  status: FeeStatus!        # "PAID" | "PENDING" | "OVERDUE"
  paymentMethod: String     # "Online (Razorpay)" | "Bank Transfer" | null
  paidAt: DateTime
  createdAt: DateTime!
}

enum FeeStatus {
  PAID
  PENDING
  OVERDUE
}

type PaginatedFeeRecords {
  items: [FeeRecord!]!
  total: Int!
  page: Int!
  pageSize: Int!
}
```

### 6.2 Frontend Data Shape

Dashboard stats:
```typescript
{
  label: "Total Targeted Fee" | "Outstanding Amount" | "Collection this Month" | "Auto-Reminders Sent",
  value: string,  // e.g. "₹42.8L"
  trend: string,  // e.g. "94% Collected"
}
```

Fee records table:
```typescript
{
  id: string,
  student: string,
  grade: string,
  category: string,
  amount: number,
  dueDate: string,
  status: "Paid" | "Pending" | "Overdue",
  method: string   // payment method
}
```

### 6.3 Frontend Actions (already has UI buttons)

| Button | Currently Does | After Backend |
|--------|---------------|---------------|
| Bulk Reminder | No-op (styled button) | Calls `sendFeeReminder` mutation |
| Set New Fee | No-op (styled button) | Opens drawer/modal, calls `createFee` |
| Search by student | Local filter only | Filters via `feeRecords(search:)` query |
| Status filter tabs | Local filter only | Filters via `feeRecords(status:)` query |

---

## 7. 🟡 MEDIUM: Programs — Missing Fields

**Status:** Backend connected for basic data, but display fields are hardcoded fallbacks  
**Page:** `ProgramsPage.tsx`  
**File:** `src/features/programs/pages/ProgramsPage.tsx`

### 7.1 Current Backend Query

```graphql
query GetSpecialPrograms($schoolId: String) {
  specialPrograms(schoolId: $schoolId) {
    id
    name
    status
    description
    credits
    studentCount
  }
}
```

### 7.2 Missing Fields

The frontend maps backend data to a `ProgramCard` component that expects these fields. Fields marked **HARDCODED** are currently fallback values:

| Frontend Field | Source | Status |
|---|---|---|
| `name` | Backend `name` | ✅ |
| `category` | Backend `description` | ⚠️ Misused as category |
| `participants` | Backend `studentCount` | ✅ |
| `status` | Backend `status` | ✅ (mapped: ACTIVE→Active, others→Completed) |
| `leadTeacher` | Hardcoded `Credits: ${credits}` string | ❌ **Hardcoded** |
| `startDate` | Hardcoded `"Oct 15"` | ❌ **Hardcoded** |
| `endDate` | Hardcoded `"Dec 10"` | ❌ **Hardcoded** |
| `location` | Hardcoded `"Main Campus"` | ❌ **Hardcoded** |
| `targetGrades` | Hardcoded `"Grades 9-12"` | ❌ **Hardcoded** |

### 7.3 Required Schema Updates

```graphql
extend type SpecialProgram {
  leadTeacher: String
  startDate: DateTime
  endDate: DateTime
  location: String
  targetGrades: String
  category: String         # "Academic" | "Sports" | "Creative Arts" | etc.
}
```

---

## 8. 🔧 Fixes Already Applied in This Session

These issues have been fixed on the frontend and do **not** require backend changes:

| Fix | File | Date |
|-----|------|------|
| Added `schoolId` client-side filter to `calendars` query | `CalendarPage.tsx` | ✅ |
| Added `schoolId` filter to Dashboard events | `ProgramsTable.tsx` | ✅ |
| Added Edit/Delete event functionality using `UpdateEvent`/ `RemoveEvent` mutations | `CalendarPage.tsx` | ✅ |
| Replaced `confirm()` with proper holiday modal + success feedback | `CalendarPage.tsx` | ✅ |
| Timetable now uses backend `startTime`/`endTime` instead of hardcoded 8:30 AM | `CalendarPage.tsx` | ✅ |
| Added "Period N" labels to timetable cards | `CalendarPage.tsx` | ✅ |

---

## 9. 📄 Spec Documents Referenced

The following spec docs exist in `docs/` and provide deeper detail:

| Document | Covers |
|----------|--------|
| `COMMUNITY_CALENDAR_SYNC_SPEC.md` | Community post ↔ Calendar event sync (requires backend hook) |
| `DIRECT_EVENTS_QUERY_SPEC.md` | Adding a direct `Query.events` endpoint with date-range filtering |
| `CALENDAR_EVENTS_BACKEND_HANDOFF.md` | Verified calendar event schema |
| `DASHBOARD_BACKEND_INTEGRATION_SPEC.md` | Dashboard queries |
| `CLASSES_BACKEND.md` | Class CRUD |
| `STUDENT_PROFILE_PAGE_BACKEND_HANDOFF.md` | Student profile queries |
| `ATTENDANCE_BACKEND.md` | Attendance batch operations |
| `CURRICULUM_BACKEND_INTEGRATION_SPEC.md` | Curriculum mapping queries |
| `BULK_IMPORT_BACKEND_GUIDE.md` | CSV bulk import flows |

---

## Implementation Priority Matrix

| Priority | Module | Effort | Depends On |
|----------|--------|--------|------------|
| 🔴 P0 | Routes (Transportation) | Medium | Nothing |
| 🔴 P0 | Vehicles (Fleet Management) | Medium | Routes (for route assignment) |
| 🔴 P0 | Fees (Finance) | Large | Students, Classes |
| 🔴 P0 | Reports & Analytics | **Very Large** | New microservice |
| 🟡 P1 | Programs — add missing fields | Small | Nothing |
| 🟡 P1 | Community ↔ Calendar sync | Medium | `eventCalendarId` field on posts |
| 🟡 P1 | Direct `events` query | Medium | Calendar events table |
