# GraphQL Integration Specification: Student & Staff Profile Viewing

This document specifies the GraphQL queries, schemas, variables, and type expectations required by the frontend **Student Profile** and **Staff Profile** pages. It is intended to align frontend consumption with the backend GraphQL schema and details the corrections made to resolve schema mismatch validation errors.

---

## 1. Student Profile Viewing

The Student Profile page makes a set of parallel queries to retrieve demographic, attendance, academic, and class information.

### 1.1 Student Profile Details (`studentProfile`)

Queries specific demographics, guardian contacts, and aura overview.

#### GraphQL Query
```graphql
query GetStudentProfile($id: ID!) {
  studentProfile(studentId: $id) {
    id
    name
    admissionNumber
    classId
    bloodGroup
    studentStatus
    guardians {
      relationship
      fullName
      mobileNo
      email
      occupation
    }
    overview {
      auraPoints
    }
  }
}
```

#### Variables
```json
{
  "id": "eecea940-bf9b-4184-af11-f46fbac82ad3"
}
```

#### Critical Integration Notes
> [!IMPORTANT]
> **Type of `$id`**: The variable `$id` must expect the type `ID!`. (Earlier mismatch using `String!` has been resolved).
>
> **No `createdAt` Field**: The `StudentProfile` type does **not** expose a `createdAt` field. Frontend relies on local defaults / fallbacks if needed, and `createdAt` must **not** be defined or queried within the `studentProfile` GraphQL query block.

#### Schema Interface (Expected)
```graphql
type StudentProfile {
  id: ID!
  name: String!
  admissionNumber: String
  classId: ID
  bloodGroup: String
  studentStatus: String
  guardians: [Guardian!]
  overview: StudentOverview
}

type Guardian {
  relationship: String
  fullName: String!
  mobileNo: String
  email: String
  occupation: String
}

type StudentOverview {
  auraPoints: Int
}
```

---

### 1.2 Student Attendance Summary (`studentAttendanceSummary`)

Used to render the attendance consistency gauge on the Student Profile Overview tab.

#### GraphQL Query
```graphql
query GetAttendance($studentId: String!) {
  studentAttendanceSummary(studentId: $studentId) {
    percentage
    presentCount
    absentCount
    totalDays
  }
}
```

#### Schema Interface (Expected)
```graphql
type Query {
  studentAttendanceSummary(studentId: String!): StudentAttendanceSummary
}

type StudentAttendanceSummary {
  percentage: Float!
  presentCount: Int!
  absentCount: Int!
  totalDays: Int!
}
```

---

### 1.3 Student Academic Progress (`studentProgress`)

Used to render the composite GPA/Participation indicators.

#### GraphQL Query
```graphql
query GetProgress($studentId: String!) {
  studentProgress(studentId: $studentId) {
    overallAverage
  }
}
```

#### Schema Interface (Expected)
```graphql
type Query {
  studentProgress(studentId: String!): StudentProgress
}

type StudentProgress {
  overallAverage: Float!
}
```

---

### 1.4 Student Class Query (`class`)

Used to retrieve the class grade level and section label for the page header when `classId` is populated.

#### GraphQL Query
```graphql
query GetClass($classId: ID!) {
  class(id: $classId) {
    grade
    section
  }
}
```

---
---

## 2. Staff Profile Viewing

The Staff Profile page queries teacher/staff attributes and lists school classes to map class IDs to human-readable names (e.g. `"Grade 10-A"`).

### 2.1 Fetch Staff User Profile (`user`)

#### GraphQL Query
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    role
    name
    email
    mobileNo
    schoolId
    address
    staffStatus
    classIds
    createdAt
  }
}
```

#### Schema Interface (Expected)
```graphql
type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  role: String! # Expected values: "TEACHER", "ADMIN", etc.
  name: String!
  email: String
  mobileNo: String
  schoolId: String
  address: String # Decodes department using "Dept: [DeptName]" format (e.g. "Dept: Mathematics")
  staffStatus: String # Expected values: "ACTIVE", "ON_LEAVE", "REMOTE", "INACTIVE"
  classIds: [String!]
  createdAt: String! # ISO string representing joining/creation date
}
```

---

### 2.2 Classes Query (`classes`)

Queried in parallel to lookup grade levels and sections for assigned `classIds` associated with the teacher.

#### GraphQL Query
```graphql
query GetClasses($schoolId: String) {
  classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
    items {
      id
      grade
      section
    }
  }
}
```

#### Schema Interface (Expected)
```graphql
type Query {
  classes(filter: ClassFilterInput, page: Int, pageSize: Int): PaginatedClasses!
}

input ClassFilterInput {
  schoolId: String
}

type PaginatedClasses {
  items: [Class!]!
  total: Int!
}

type Class {
  id: ID!
  grade: String!
  section: String!
}
```

---

## 3. Summary of API Alignment Updates

Below is a summary of the alignment updates resolved in the frontend code that the backend must ensure support for:

| Query/Operation | Parameter / Field Updated | Issue | Corrected Behavior |
| :--- | :--- | :--- | :--- |
| `GetStudentProfile` | `studentId` variable | Variable `$id` was specified as `String!` instead of `ID!`. | Updated query variable to `$id: ID!`. |
| `GetStudentProfile` | `createdAt` field | Mismatch validation error: field did not exist on `StudentProfile`. | Removed field from query. Frontend handles default values internally. |
| `CreateCurriculumMapping` | `input` variable | Type `CreateCurriculumMappingInput` was undefined. | Renamed to use `CreateCurriculumMappingDto!`. |
| `UpdateCurriculumMapping` | `input` variable | Type `UpdateCurriculumMappingInput` was undefined. | Renamed to use `UpdateCurriculumMappingDto!`. |
