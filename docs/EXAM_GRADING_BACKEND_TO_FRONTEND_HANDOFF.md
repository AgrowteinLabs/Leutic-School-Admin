# Exam Grading ("Update Progress") — Backend Handoff

> **Status:** COMPLETED (academic-records-service + school-structure-service)

## Teacher workflow (MVP)

1. **Classes** — `classes(schoolId)` auto-scopes to homeroom + curriculum-mapped classes for `TEACHER` (no `filter.role` required).
2. **Roster** — `studentsByClass(classId)` (identity-service, existing).
3. **Submit marks** — Flutter parses CSV client-side, resolves roll → `studentId`, calls `bulkSaveMarks` with real IDs + `subject` from teacher mapping.
4. **Review** — `marksForExamClass(examId, classId, subject)` or `marks(filter: { examId, classId, subject })`.
5. **Finalize** — `finalizeMarks(examId, classId, subject)` → read-only via `markEntry` status.
6. **Exams** — Teachers still use **school-created exams** (`createExam` remains admin-only). Pick existing exam from `exams` query.

## New / updated GraphQL

| API | Description |
|-----|-------------|
| `marks(filter: { examId, classId, subject })` | Filtered paginated marks |
| `marksForExamClass(examId, classId, subject)` | All marks for one exam/class/subject |
| `markEntry(examId, classId, subject)` | `{ status: DRAFT \| FINALIZED, finalizedAt }` |
| `finalizeMarks(examId, classId, subject)` | Locks marks for that exam/class/subject |

## Fixes

- Removed `@Max(100)` on mark DTOs — validates `marks <= totalMarks` in service instead.
- Finalized entries block `bulkSaveMarks`, `updateMark`, `removeMark`.

## Flutter integration notes

- Subject is **required** on every mark write — infer from teacher's curriculum mapping for the class.
- Do **not** call `importMarksCsv` from mobile (admin-only, UUID columns).
- After finalize, disable edit UI when `markEntry.status === FINALIZED`.

## Example

```graphql
mutation BulkSave($inputs: [BulkMarkInput!]!) {
  bulkSaveMarks(inputs: $inputs) { id studentId marksObtained totalMarks }
}

mutation Finalize($examId: ID!, $classId: ID!, $subject: String!) {
  finalizeMarks(examId: $examId, classId: $classId, subject: $subject) {
    status
    finalizedAt
  }
}

query MarksForClass($examId: ID!, $classId: ID!, $subject: String!) {
  marksForExamClass(examId: $examId, classId: $classId, subject: $subject) {
    studentId
    marksObtained
    totalMarks
    subject
  }
  markEntry(examId: $examId, classId: $classId, subject: $subject) {
    status
  }
}
```
