# Handoff: Class Details Page Data Model Specifications

This document outlines the GraphQL schema extensions, resolvers, and types required by the frontend team to integrate real-time statistics, student rosters, and activity logs on the **Class Details Page**.

---

## 1. Schema Extensions for `Class` Model

To support the top-level cards displaying aggregate metrics for a class section, please expose the following fields on the `Class` type:

```graphql
extend type Class {
  """
  Real-time average student attendance percentage for this class section (e.g. 98.2)
  """
  attendanceRate: Float

  """
  Number of active co-curricular or special programs mapped to this class section (e.g. 3)
  """
  activeProgramsCount: Int
}
```

### Frontend Usage
These fields will be retrieved during the initial class payload query:
```graphql
query GetClassDetails($id: ID!) {
  class(id: $id) {
    id
    grade
    section
    classTeacherId
    roomNumber
    shift
    capacity
    attendanceRate      # New field
    activeProgramsCount # New field
  }
}
```

---

## 2. Schema Extensions for Student (`ManagedUser` where role is `STUDENT`)

To populate the student roster table with real-time academic standing and engagement indicators, we request the following fields on the `ManagedUser` model:

```graphql
enum StudentStandingStatus {
  GOOD_STANDING
  BEHAVIOR_FLAG
  HIGH_RISK
}

extend type ManagedUser {
  """
  The student's individual average participation rate (percentage value, e.g. 88.5)
  """
  participationRate: Float

  """
  The current standing/behavioral alert status category for the student
  """
  standingStatus: StudentStandingStatus
}
```

### Frontend Usage
These fields will be retrieved when loading the students mapped to the class roster:
```graphql
query GetClassStudentsRoster($classId: ID!) {
  studentsByClass(classId: $classId, page: 1, pageSize: 200) {
    items {
      id
      name
      admissionNumber
      classId
      participationRate  # New field
      standingStatus     # New field
    }
  }
}
```

---

## 3. Class-Specific Activity Timeline Query

Instead of rendering fallback notifications, the sidebar timeline needs a class-specific feed. We request a dedicated query returning chronological logs filtered by the class ID:

```graphql
enum ClassActivityType {
  CURRICULUM    # E.g. assignment published, homework due
  PROGRAMS      # E.g. special club events, program registration
  ALERT         # E.g. attendance drop warning, threshold alerts
  STAFF_NOTE    # E.g. teacher substitution notes
}

type ClassActivity {
  id: ID!
  classId: ID!
  activityType: ClassActivityType!
  title: String!
  description: String!
  createdAt: String!
}

type PaginatedClassActivities {
  items: [ClassActivity!]!
  total: Int!
}

extend type Query {
  """
  Returns chronological activity history logs for a specific class section
  """
  classActivities(classId: ID!, page: Int, pageSize: Int): PaginatedClassActivities!
}
```

### Frontend Usage
```graphql
query GetClassTimeline($classId: ID!) {
  classActivities(classId: $classId, page: 1, pageSize: 10) {
    items {
      id
      activityType
      title
      description
      createdAt
    }
    total
  }
}
```
