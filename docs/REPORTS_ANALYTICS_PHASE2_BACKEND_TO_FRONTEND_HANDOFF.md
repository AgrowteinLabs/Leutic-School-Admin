# Reports & Analytics — Phase 2 Handoff

> **Status:** PARTIAL — finance + attendance trend queries added; academic/assessment tabs still deferred pending frontend `sampleData.ts` contracts.

## Newly available queries

### Finance tab (`finance-service`)

| Query | Returns |
|-------|---------|
| `classWiseFee(schoolId, academicYearId?)` | Per-grade collected / pending / overdue / total |
| `feeReminderFunnel(schoolId)` | Funnel stages: Paid, Outstanding (no reminder), 1 reminder, 2+ reminders |

### Attendance tab (`reporting-service`)

| Query | Returns |
|-------|---------|
| `attendanceTrend(schoolId, weeks?)` | Weekly `{ week, present, absent, percentage }` (default 8 weeks, max 52) |

## Already shipped (phase 1)

- `subjectPerformance`, `dailyAttendance`, `chronicAbsentees` (reporting-service)
- `feeCollectionSummary`, `feeDefaulters` (finance-service)

## Still deferred

- `classPerformance`, `examComparison`, `teacherPerformance`
- Assessment: `quizPerformance`, `quizParticipationByClass`, `competitionResults`
- Engagement, Notifications, Transport, Aura tabs — need frontend data contracts
