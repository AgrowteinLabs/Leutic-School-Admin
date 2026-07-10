# Frontend Data Requirements: Student & Staff Profile Modules

This document outlines the detailed data specifications, field mappings, and structural requirements for both the **Staff Profile Details** and **Student Profile Details** views. It distinguishes between fields that are currently fetched dynamically from the GraphQL API and mock/static UI elements that will be migrated to the API in future phases.

---

## 1. Staff Profile Details Page

Located at `src/features/settings/pages/StaffProfilePage.tsx`.

### 1.1 Header & Metadata
* **Staff Name**: `user.name` (string) — Displayed in the main header.
* **Staff Role**: `user.role` (string) — Decoded values (e.g., `"TEACHER"` maps to `"Faculty"`, `"ADMIN"` maps to `"Admin"`).
* **Department**: `user.address` (string) — Parsed by checking if `address` contains `Dept: [Name] | [Address]`. If present, `[Name]` is displayed; otherwise, defaults to math/science/humanities based on user name hash.
* **Status**: `user.staffStatus` (string) — Displays as a badge. Expected enum values:
  * `ACTIVE` (renders as `"Active"`)
  * `ON_LEAVE` (renders as `"On Leave"`)
  * `REMOTE` (renders as `"Remote"`)
  * `INACTIVE` (renders as `"Inactive"`)

### 1.2 Stats Panel
* **Performance Metric**: `staffDetails.performance` (integer percentage, e.g. `92%`).
* **Aura Score**: `staffDetails.auraScore` (integer, e.g. `95`).
* **Workload**: Hardcoded to `"24h / wk"` (representing weekly instructional load).
* **Join Date**: Derived from `user.createdAt` (formatted as `"Month Year"`, e.g. `"October 2023"`).

### 1.3 Instructional Schedule (Timetable)
* **Status**: Currently hardcoded in the frontend.
* **UI Grid Structure**: Matrix mapping **5 weekdays** (`Mon` to `Fri`) across **2 time slots** (e.g., `09:00 AM` & `11:00 AM`).
* **Required Data Schema**:
  ```graphql
  type StaffScheduleSlot {
    dayOfWeek: String!  # "Mon", "Tue", etc.
    slotIndex: Int!     # 1, 2
    classLabel: String! # e.g., "GR-10-A"
    startTime: String!  # e.g., "09:00 AM"
  }
  ```

### 1.4 Assigned Subjects & Classes
* **Status**: Populated dynamically by checking user class identifiers against the school's class list.
* **Required GraphQL Inputs**:
  * `user.classIds` (array of `String` class IDs).
  * `classes` query list (items containing `id`, `grade`, and `section`).
* **Mapping**: Renders class labels matching the teacher's assigned classes (e.g. `"Class Teacher: Grade 10-A"`).

### 1.5 Achievements
* **Status**: Hardcoded to `["Gold Star Educator '24", "Curriculum Innovator", "Perfect Attendance"]`.
* **Required Data Schema**:
  ```graphql
  type StaffAchievement {
    title: String!
    badgeIcon: String # Name of material symbol or lucide icon
  }
  ```

### 1.6 Personal & Employment Records
* **Email Address**: `user.email` (string).
* **Mobile Number**: `user.mobileNo` (string).
* **Staff Identifier**: Derived local ID (e.g., `"ST-1024-001"`).
* **Employment Type**: Hardcoded to `"Permanent Regular"`.
* **Residential Address**: `user.address` (string) — displays `cleanAddress` (with `Dept:` segments stripped out).

### 1.7 Faculty Insights
* **Status**: Hardcoded list of testimonials/quotes in the right sidebar.
* **Required Data Schema**: Array of string quotes or professional notes (e.g., `["Maintains 98% laboratory session attendance.", "Pioneered 'Interactive Geometry' for Grade 10."]`).

---
---

## 2. Student Profile Details Page

Located at `src/features/students/pages/StudentProfilePage.tsx`.

### 2.1 Header & Metadata
* **Student Name**: `studentProfile.name` (string) — Renders name and avatar image.
* **Admission Identifier**: `studentProfile.admissionNumber` (string) — Displays as ID (e.g., `"#OA-2024-001"`).
* **Grade & Section**: Loaded via `class(id: classId)` query — Renders as `Grade Level` and `Section` (e.g., `"10th Grade"`, `"A"`).
* **Blood Group**: `studentProfile.bloodGroup` (string) — Renders in details drawer.
* **Status**: `studentProfile.studentStatus` (string) — Badge representing `"Active"`, `"At Risk"`, `"Graduated"`, or `"Inactive"`.

### 2.2 Overview Tab
* **Aura Score**: `studentProfile.overview.auraPoints` (integer).
* **Attendance Rate**: `studentAttendanceSummary.percentage` (float percentage, e.g. `95`).
* **GPA**: `studentProgress.overallAverage` (float average, mapped to a 4.0 scale by dividing by `25`).
* **Participation Intelligence**:
  * **Status**: Hardcoded progress bars.
  * **Required Data Schema**:
    ```graphql
    type ParticipationIntelligence {
      attendanceConsistency: Int! # e.g. 98
      assignmentHygiene: Int!      # e.g. 94
      classEngagement: Int!        # e.g. 86
      activityDensity: Int!        # e.g. 90
    }
    ```
* **Intelligence Highlights**:
  * **Status**: Hardcoded list representing extracurricular engagement.
  * **Required Data Schema**:
    ```graphql
    type IntelligenceHighlight {
      label: String!   # e.g., "Varsity Sports"
      detail: String!  # e.g., "Team Captain — Regional Playoff Ready"
      status: String!  # e.g., "Active Lead", "Completed"
      icon: String     # Material symbols identifier
    }
    ```

### 2.3 Academic History Tab
* **Longitudinal Performance**:
  * **Status**: Hardcoded historical records.
  * **Required Data Schema**:
    ```graphql
    type TermPerformance {
      termName: String! # "Current Session", "Prior Session", "Annual Avg"
      letterGrade: String! # "A+", "A"
      percentageScore: String! # "96.4%"
    }
    ```
* **Course Material Masteries**:
  * **Status**: Hardcoded subject scores.
  * **Required Data Schema**:
    ```graphql
    type SubjectMastery {
      subjectName: String! # "Advanced Mathematics", "Classical Physics"
      masteryPercentage: Int! # e.g., 96
    }
    ```

### 2.4 Behavioral Records Tab (Conduct Repository)
* **Conduct Repository List**:
  * **Status**: Hardcoded.
  * **Required Data Schema**:
    ```graphql
    type BehavioralRecord {
      date: String!     # Date of entry (e.g. "Oct 12, 2023")
      title: String!    # e.g. "Leadership Excellence"
      comment: String!  # Narrative summary
      staffName: String! # Authoring staff/teacher name (e.g. "Manoj P.")
    }
    ```
* **Security & Audit Logs**:
  * **Status**: Hardcoded details showing auditor and date.
  * **Required Data Schema**:
    ```graphql
    type BehavioralAuditLog {
      lastAuditDate: String!
      auditedBy: String!
    }
    ```

### 2.5 Parental Contact Tab
* **Guardians List**: `studentProfile.guardians` (array of `Guardian` object).
  * `relationship` (string, e.g. `"Father"`, `"Mother"`)
  * `fullName` (string)
  * `mobileNo` (string)
  * `email` (string)
* **Secure Link Meetings Log**:
  * **Status**: Hardcoded parent-teacher meet logs.
  * **Required Data Schema**:
    ```graphql
    type ParentTeacherMeetingLog {
      title: String!       # e.g., "Bridge Meeting"
      dateString: String!  # e.g., "Oct 04"
      summaryText: String! # e.g., "Discussed career goals."
    }
    ```
