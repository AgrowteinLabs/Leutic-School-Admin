# Handoff: API Rate Limiting (ThrottlerException) Specifications

This document outlines the rate limiting issues (`ThrottlerException: Too Many Requests`) encountered by the frontend team during bulk updates, and proposes backend solutions (bulk mutation endpoints or rate-limit ceiling adjustments) to resolve them.

---

## 1. Issue: Bulk Marks Entry

### Context
When saving academic grades in [MarksEntryPage.tsx](file:///d:/Projects/School%20Luetic/letuic_schoolAdmin/src/features/examinations/pages/MarksEntryPage.tsx), the grid allows editing grades for multiple students and subjects at once. Clicking **Save** triggers a batch update.

### The Problem
Firing parallel requests (e.g. 30 students × 8 subjects = 240 concurrent requests) triggers the gateway/downstream service throttler on NestJS, resulting in:
```json
{
  "errors": [
    {
      "message": "ThrottlerException: Too Many Requests",
      "path": [ "createMark" ],
      "serviceName": "academic-records"
    }
  ]
}
```

### Frontend Workaround Implemented
To keep the application operational, the frontend now slices the mutation promises into **chunks of 5 parallel requests** executed sequentially. While this prevents the error, it increases save latency.

### Proposed Backend Solutions (Pick One)
1. **Expose a Bulk Mutation (Highly Recommended):**
   Expose a single query transaction that processes multiple marks at once:
   ```graphql
   input BulkMarkInput {
     studentId: ID!
     examId: ID!
     subject: String!
     marks: Float!
     totalMarks: Float!
   }

   extend type Mutation {
     bulkSaveMarks(inputs: [BulkMarkInput!]!): [Mark!]!
   }
   ```
2. **Increase Throttler Limits:**
   Adjust the NestJS `ThrottlerGuard` decorator on the `createMark` and `updateMark` resolvers to allow higher limit/ttl values (e.g. `@SkipThrottle()` or `@Throttle({ default: { limit: 500, ttl: 60000 } })`).

---

## 2. Issue: Curriculum/Teacher Mappings

### Context
When administrators manage class timetables or assign teachers to subjects, saving the updated curriculum grid executes batch mappings.

### The Problem
Assigning multiple teachers/subjects triggers a flurry of concurrent `createCurriculumMapping` or `updateCurriculumMapping` mutations. Like marks saving, this triggers the rate-limiter, failing mid-save and leaving the curriculum state half-persisted.

### Proposed Backend Solutions (Pick One)
1. **Expose a Bulk Curriculum Mapping Mutation:**
   ```graphql
   input BulkCurriculumMappingInput {
     classId: ID!
     subjectId: ID!
     teacherId: ID!
     hoursPerWeek: Int
     isAdditional: Boolean
   }

   extend type Mutation {
     bulkSaveCurriculumMappings(inputs: [BulkCurriculumMappingInput!]!): [CurriculumMapping!]!
   }
   ```
2. **Adjust Throttler Decorators:**
   Increase the threshold or skip rate limits for mutations executed under the curriculum service gateway.

---

## 3. Issue: Weekly Timetable Slots Saving

### Context
When saving class timetables, multiple periods/slots are populated, shifted, or rescheduled in bulk. Saving the weekly grid maps many timetable entries at once.

### The Problem
Saving the entire weekly grid schedules multiple slots concurrently (e.g. 5 days × 8 slots = up to 40 slots). This sends a massive burst of `saveClassTimetable` or slot scheduling mutations at once, which hits the `ThrottlerException` ceiling, causing save failures and leaving the calendar in a partially scheduled state.

### Proposed Backend Solutions (Pick One)
1. **Expose a Bulk Timetable Slot Mutation:**
   Allow the frontend to submit a complete array of timetable slots for the class in one GraphQL call:
   ```graphql
   input TimetableSlotInput {
     day: String!
     period: Int!
     subjectName: String!
     teacherId: ID!
     spanPeriods: Int
   }

   extend type Mutation {
     saveBulkClassTimetable(classId: ID!, slots: [TimetableSlotInput!]!): Boolean!
   }
   ```
2. **Raise Rate Limits:**
   Bypass or relax rate limit rules for calendar slot resolvers (`saveClassTimetable`) on the backend gateway.
