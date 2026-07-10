# Calendar & Events Backend Integration Handoff

This document details the analysis of the calendar, events, and timetable schemas on the backend, comparing them against the frontend implementation in [CalendarPage.tsx](file:///d:/Projects/School%20Luetic/letuic_schoolAdmin/src/features/calendar/pages/CalendarPage.tsx).

---

## 1. Verified Backend Schema

The following queries, mutations, and types have been verified via schema introspection on the backend GraphQL server (`http://3.7.222.252:4000/graphql`):

### Queries
```graphql
query GetCalendars($page: Int, $pageSize: Int) {
  calendars(page: $page, pageSize: $pageSize) {
    items {
      id
      schoolId
      classId
      name
      createdAt
      updatedAt
      events {
        id
        calendarId
        title
        description
        date
        type
        createdAt
        updatedAt
      }
    }
  }
}

query GetCalendarDetails($id: ID!) {
  calendar(id: $id) {
    id
    schoolId
    classId
    name
    events {
      id
      title
      description
      date
      type
    }
  }
}

query GetClassTimetable($classId: String!) {
  classTimetable(classId: $classId) {
    id
    classId
    day
    period
    subjectId
    subjectName
    teacherId
    teacherName
    curriculumMappingId
    spanPeriods
    startTime
    endTime
  }
}

query GetTeacherTimetable($teacherId: String!) {
  teacherTimetable(teacherId: $teacherId) {
    id
    classId
    day
    period
    subjectId
    subjectName
    teacherId
    teacherName
    curriculumMappingId
    spanPeriods
    startTime
    endTime
  }
}
```

### Mutations
```graphql
mutation CreateCalendar($input: CreateCalendarDto!) {
  createCalendar(createCalendarInput: $input) {
    id
    schoolId
    classId
    name
  }
}

mutation CreateEvent($input: CreateEventDto!) {
  createEvent(createEventInput: $input) {
    id
    calendarId
    title
    description
    date
    type
  }
}

mutation UpdateCalendar($id: ID!, $input: UpdateCalendarDto!) {
  updateCalendar(id: $id, updateCalendarInput: $input) {
    id
    name
  }
}

mutation UpdateEvent($id: ID!, $input: UpdateEventDto!) {
  updateEvent(id: $id, updateEventInput: $input) {
    id
    title
  }
}

mutation RemoveCalendar($id: ID!) {
  removeCalendar(id: $id) {
    id
  }
}

mutation RemoveEvent($id: ID!) {
  removeEvent(id: $id) {
    id
  }
}
```

### Input Types and Enums
#### **`CreateCalendarDto`**
- `schoolId: String!`
- `name: String!`
- `classId: String` (optional)

#### **`CreateEventDto`**
- `calendarId: ID`
- `title: String!`
- `description: String` (optional)
- `date: String` (ISO date string)
- `startDate: String` (optional)
- `endDate: String` (optional)
- `type: EventType!` (ENUM)

#### **`EventType` (Enum values)**
- `HOLIDAY`
- `EXAM`
- `ACTIVITY`
- `HALF_DAY`
- `ANNUAL_DAY`

---

## 2. Integration Discrepancies & Recommendations

We compared the backend GraphQL schema against the current frontend calendar implementation in [CalendarPage.tsx](file:///d:/Projects/School%20Luetic/letuic_schoolAdmin/src/features/calendar/pages/CalendarPage.tsx). To transition from mock local-storage variables to complete backend integration, address these areas:

### 1. `schoolId` filter on `calendars` Query
- **Observation**: The backend query `Query.calendars` only accepts pagination variables (`page`, `pageSize`) and doesn't support filtering by `schoolId`.
- **Potential Issue**: In multi-school deployments, the query will return calendars from all schools.
- **Recommended Action**:
  - **Frontend fix**: Query `schoolId` in the calendar payload list, then filter in memory on the client:
    ```typescript
    const schoolCals = (calendarsRes.calendars?.items || []).filter(c => c.schoolId === schoolId);
    ```
  - **Backend request**: Request the backend team to add a `schoolId` filter to `Query.calendars` to keep payload sizes small:
    ```graphql
    calendars(schoolId: String, page: Int, pageSize: Int): PaginatedCalendars!
    ```

### 2. Timetable Integration (Move from Local Storage)
- **Observation**: [CalendarPage.tsx](file:///d:/Projects/School%20Luetic/letuic_schoolAdmin/src/features/calendar/pages/CalendarPage.tsx#L208) reads timetable slots from local storage key `curriculum_timetable_${schoolId}`.
- **Recommended Action**: Replace local storage reading with the direct backend queries `classTimetable` and `teacherTimetable`.
- **Mapping Guide**:
  - In class view, when `selectedClass` shifts, query:
    ```graphql
    query GetClassTimetable($classId: String!) {
      classTimetable(classId: $classId) {
        day
        period
        subjectName
        teacherName
        spanPeriods
      }
    }
    ```
  - Map `classId` using the class list dictionary to translate class entities (e.g. mapping Grade 10-A ID to Grade and Section).

### 3. Missing direct `events` query
- **Observation**: There is no direct paginated list query for `events` (e.g. `Query.events`). Events can only be resolved by traversing `Calendar.events`.
- **Backend request**: Request the backend team to expose a direct `events` query with date range filters. This prevents the client from having to fetch the entire calendar hierarchy:
  ```graphql
  events(schoolId: String!, startDate: DateTime, endDate: DateTime, page: Int, pageSize: Int): PaginatedEvents!
  ```
