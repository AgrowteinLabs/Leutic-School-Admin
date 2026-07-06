# Handoff: Student Profile Page Data Model Specifications

This document outlines the GraphQL schema extensions, types, and queries required by the frontend team to migrate the remaining mock/static sections of the **Student Profile Details** page to real-time backend data.

---

## 1. Schema Extensions for `StudentProfile` Model

The student details page fetches a bundle of details under the `studentProfile(studentId: ID!)` query. To support all interactive tabs, we request extending the `StudentProfile` schema to include resolvers for enrollment/creation date, participation metrics, academic highlights, longitudinal history, behavioral records, and meeting logs.

```graphql
# --- 1.1 Overview Tab & General Metrics ---

type ParticipationIntelligence {
  attendanceConsistency: Int! # Percentage, e.g. 98
  assignmentHygiene: Int!      # Percentage, e.g. 94
  classEngagement: Int!        # Percentage, e.g. 86
  activityDensity: Int!        # Percentage, e.g. 90
}

type IntelligenceHighlight {
  id: ID!
  label: String!               # E.g. "Varsity Sports"
  detail: String!              # E.g. "Team Captain — Regional Playoff Ready"
  status: String!              # E.g. "Active Lead", "Completed"
  icon: String                 # Lucide / Material Symbol identifier (e.g. "trophy")
}

# --- 1.2 Academic History Tab ---

type TermPerformance {
  termName: String!            # E.g. "Current Session", "Prior Session"
  letterGrade: String!         # E.g. "A+", "B"
  percentageScore: String!     # E.g. "96.4%"
}

type SubjectMastery {
  subjectName: String!         # E.g. "Advanced Mathematics"
  masteryPercentage: Int!      # E.g. 96
}

# --- 1.3 Behavioral & Audit Logs ---

type BehavioralRecord {
  id: ID!
  date: String!                # E.g. "Oct 12, 2023"
  title: String!               # E.g. "Leadership Excellence"
  comment: String!             # Narrative feedback comments
  staffName: String!           # Name of authoring teacher/counselor
}

type BehavioralAuditLog {
  lastAuditDate: String!
  auditedBy: String!
}

# --- 1.4 Parental Contact & Meetings ---

type ParentTeacherMeetingLog {
  title: String!               # E.g. "Bridge Meeting"
  dateString: String!          # E.g. "Oct 04"
  summaryText: String!         # E.g. "Discussed career goals and chemistry progress."
}

# --- Root StudentProfile Type Extension ---

extend type StudentProfile {
  """
  The date the student profile was created/enrolled in the system (e.g. "2023-08-15T00:00:00Z")
  """
  createdAt: String

  overview: StudentOverview
  academicHistory: StudentAcademicHistory
  behavioralRecords: [BehavioralRecord!]
  behavioralAuditLog: BehavioralAuditLog
  parentMeetings: [ParentTeacherMeetingLog!]
}

type StudentOverview {
  auraPoints: Int!
  participationIntelligence: ParticipationIntelligence!
  highlights: [IntelligenceHighlight!]!
}

type StudentAcademicHistory {
  termPerformances: [TermPerformance!]!
  subjectMasteries: [SubjectMastery!]!
}
```

---

## 2. Dynamic Field Mappings (Already Implemented / In-place)

The following metadata fields are already mapped to active dynamic endpoints under `studentProfile`. Please ensure the backend database has valid entries for these fields:

* **School Name:** Rendered dynamically using the frontend's central context provider (`schoolProfile.name`). No profile-specific database field is required.
* **Blood Group:** Fetched from `studentProfile.bloodGroup` (with default fallback to `O+` if null).
* **Guardian details:** Mapped from the `guardians` list:
  * **Guardian Name:** Derived from `guardians[0].fullName` (falls back to a standard string if empty).
  * **Phone:** Derived from `guardians[0].mobileNo` (falls back to `+91 99999-99999` if empty).
* **First Joining (Enrollment Date):** 
  > [!WARNING]
  > Currently falling back to the current date on load. We request exposing the `createdAt` field on the `StudentProfile` model (documented in the extension block above) so this displays the actual enrollment timestamp.

---

## 3. Integrated Query Example

Once these fields are implemented on the backend, the frontend will request them in a single batch query:

```graphql
query StudentProfileBundle($studentIdID: ID!, $studentIdStr: String!) {
  studentProfile(studentId: $studentIdID) {
    id
    name
    admissionNumber
    classId
    bloodGroup
    studentStatus
    createdAt        # Requested new field
    guardians {
      id
      relationship
      fullName
      mobileNo
      email
      occupation
    }
    overview {
      auraPoints
      participationIntelligence {
        attendanceConsistency
        assignmentHygiene
        classEngagement
        activityDensity
      }
      highlights {
        id
        label
        detail
        icon
        status
      }
    }
    academicHistory {
      termPerformances {
        termName
        letterGrade
        percentageScore
      }
      subjectMasteries {
        subjectName
        masteryPercentage
      }
    }
    behavioralRecords {
      id
      date
      title
      comment
      staffName
      createdAt
    }
    behavioralAuditLog {
      lastAuditDate
      auditedBy
    }
    parentMeetings {
      title
      dateString
      summaryText
    }
  }
  
  # Existing federated queries:
  studentProgress(studentId: $studentIdStr) {
    studentId
    overallAverage
  }
  studentAttendanceSummary(studentId: $studentIdStr) {
    percentage
  }
}
```
