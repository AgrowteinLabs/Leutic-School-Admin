# Direct `events` Query — Backend Specification

## Problem

The frontend currently has **no way to query events directly**. Events can only be accessed by traversing the `Calendar → events` relationship, which forces the client to:

1. Fetch **all calendars** for the school
2. Iterate through every calendar's `events[]` list
3. Filter events by date/type on the client side

This results in massive over-fetching. For example, the Calendar page fetches up to **100 calendars** (with all their events) just to display a single month's events.

## Requested Schema Addition

```graphql
extend type Query {
  events(
    schoolId: String!
    startDate: DateTime
    endDate: DateTime
    type: EventType
    page: Int
    pageSize: Int
  ): PaginatedEvents!
}

type PaginatedEvents {
  items: [CalendarEvent!]!
  total: Int!
  page: Int!
  pageSize: Int!
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `schoolId` | `String!` | ✅ Yes | — | Filter events belonging to this school |
| `startDate` | `DateTime` | ❌ No | — | Lower bound for event `date` (inclusive) |
| `endDate` | `DateTime` | ❌ No | — | Upper bound for event `date` (inclusive) |
| `type` | `EventType` | ❌ No | — | Filter by event type (HOLIDAY, EXAM, ACTIVITY, etc.) |
| `page` | `Int` | ❌ No | 1 | Page number (1-indexed) |
| `pageSize` | `Int` | ❌ No | 50 | Items per page (max 100) |

### Implementation Notes

- `events` should query the `CalendarEvent` table joined with `Calendar` to access `schoolId`
- An **index on `(calendar.schoolId, event.date)`** is recommended for performance
- Date filtering uses the `date` field on `CalendarEvent` (ISO date string, stored as DateTime)
- If neither `startDate` nor `endDate` is provided, return events from current month onward (sensible default)

---

## Expected Frontend Usage

### 1. Calendar Page — Month View

```graphql
query GetMonthEvents($schoolId: String!, $startDate: DateTime!, $endDate: DateTime!) {
  events(schoolId: $schoolId, startDate: $startDate, endDate: $endDate, page: 1, pageSize: 100) {
    items {
      id
      calendarId
      title
      description
      date
      type
    }
    total
  }
}
```

**Variables:**
```json
{
  "schoolId": "sch_123",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-03-31T23:59:59Z"
}
```

### 2. Dashboard — Upcoming Events

```graphql
query GetUpcomingEvents($schoolId: String!, $startDate: DateTime!) {
  events(schoolId: $schoolId, startDate: $startDate, page: 1, pageSize: 5) {
    items {
      id
      title
      description
      date
      type
    }
  }
}
```

**Variables:**
```json
{
  "schoolId": "sch_123",
  "startDate": "2026-03-12T00:00:00Z"
}
```

---

## Migration Path

| Phase | Action | Frontend Change Required? |
|---|---|---|
| 1 | Add `Query.events` to backend | No |
| 2 | Frontend switches Calendar page to use `events()` | **Yes** — replace `calendars()` → `events()` for the month |
| 3 | Frontend switches Dashboard to use `events()` | **Yes** — replace `calendars()` → `events()` |
| 4 | Remove old workaround comment from CalendarPage.tsx | Small cleanup |

Phase 1 is purely backend. Phases 2–4 are frontend migrations that can be done after the backend change is deployed.

---

## Why This Matters

| Current Workaround | After Events Query |
|---|---|
| `calendars(pageSize: 100)` fetches ALL calendars | `events(schoolId, startDate, endDate)` fetches **only matching events** |
| Client must flatten + filter in memory | Backend does indexed filtering |
| School ID filter is client-side (workaround) | School ID filter is server-side (efficient) |
| Cannot paginate through events | Full `page`/`pageSize` pagination |
| Dashboard fetches 10 calendars for 5 events | Dashboard fetches 5 events directly |
