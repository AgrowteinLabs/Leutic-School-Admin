# Backend Developer Specification: Timetable Configuration Persistence

To resolve the gap where timetable configurations (school start time, breaks, operational days, and period durations) are reset on browser refresh, this document details the database schema and GraphQL API requirements to support timetable config persistence.

---

## 1. Database Model (Prisma suggestion)

Add the following models to represent the timetable configuration at the institution/school level:

```prisma
model TimetableConfig {
  id                      String           @id @default(uuid())
  schoolId                String           @unique
  schoolStart             String           @default("08:30")
  uniformDuration         Boolean          @default(true)
  defaultDuration         Int              @default(60)
  operationalDays         String[]         // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  breaks                  TimetableBreak[]
  periodDurationsJson     String?          // Serialized key-value object: { [periodNumber]: durationInMinutes }
  perDayDurationsJson     String?          // Serialized nested object: { [dayName]: { [periodNumber]: durationInMinutes } }
  createdAt               DateTime         @default(now())
  updatedAt               DateTime         @updatedAt
}

model TimetableBreak {
  id                String          @id @default(uuid())
  timetableConfigId String
  timetableConfig   TimetableConfig @relation(fields: [timetableConfigId], references: [id], onDelete: Cascade)
  period            Int
  placement         String          // "before" | "after"
  duration          Int             // In minutes
  type              String          // "short" | "lunch" | "other"
  label             String          // e.g., "Lunch Break"
  days              String[]        // Applies to all days if empty, otherwise specific days e.g., ["Friday"]
}
```

---

## 2. GraphQL Schema Definitions

Timetable configurations should be composed at the gateway level.

### Common Types

```graphql
type TimetableBreak {
  id: String!
  period: Int!
  placement: String!
  duration: Int!
  type: String!
  label: String!
  days: [String!]!
}

type TimetableConfig {
  id: ID!
  schoolId: String!
  schoolStart: String!
  uniformDuration: Boolean!
  defaultDuration: Int!
  operationalDays: [String!]!
  breaks: [TimetableBreak!]!
  periodDurationsJson: String
  perDayDurationsJson: String
}
```

### Inputs

```graphql
input TimetableBreakInput {
  id: String!
  period: Int!
  placement: String!
  duration: Int!
  type: String!
  label: String!
  days: [String!]!
}

input SaveTimetableConfigInput {
  schoolStart: String!
  uniformDuration: Boolean!
  defaultDuration: Int!
  operationalDays: [String!]!
  breaks: [TimetableBreakInput!]!
  periodDurationsJson: String
  perDayDurationsJson: String
}
```

### Queries & Mutations

```graphql
extend type Query {
  # Fetch the timetable configuration for a specific school
  timetableConfig(schoolId: String!): TimetableConfig
}

extend type Mutation {
  # Create or update the timetable configuration for a school
  saveTimetableConfig(schoolId: String!, input: SaveTimetableConfigInput!): TimetableConfig!
}
```
