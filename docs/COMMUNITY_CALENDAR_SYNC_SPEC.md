# Community ↔ Calendar Event Sync Specification

## Problem

Events created in the **Community module** (via `createPost` with `eventTitle` populated) exist only as community post fields — they **never appear** on the **Institutional Calendar**. Conversely, events created directly on the Calendar page don't appear in the community feed. This creates a disjointed user experience where an administrator must create the same event in two places.

## Solution: Backend Sync (Post-Save Hook)

When a community post is **created or updated** with event fields populated (`eventTitle`, `eventDate`), the backend should **automatically create or update a corresponding Calendar Event** in the school's institutional calendar.

### Sync Rules

| Operation on Community Post | Backend Action on Calendar |
|---|---|
| `createPost` with `eventTitle` set | Auto-create `CalendarEvent` in institutional calendar |
| `updatePost` with `eventTitle` changed | Auto-update the linked `CalendarEvent` |
| `deletePost` that had a linked event | Auto-delete the linked `CalendarEvent` |
| `createPost` / `updatePost` **without** `eventTitle` | No calendar action |
| `updatePost` clearing `eventTitle` | Delete the previously linked `CalendarEvent` |

---

## 1. Schema Changes

### Add `eventCalendarId` to `CommunityPost` model

```graphql
# New field on the CommunityPost type
eventCalendarId: String  # ID of the linked Calendar Event (nullable)
```

This creates a **bi-directional link** so:
- Given a post, we know which calendar event it created
- Given a calendar event, we can trace back to the community post

### Change `CommunityPost` event fields (optional but recommended)

Consider setting `eventTitle` as **nullable** (currently it may be required). A post can exist without event fields.

---

## 2. Field Mapping: Community Post → Calendar Event

| Community Post Field | Calendar Event Field | Notes |
|---|---|---|
| `eventTitle` | `title` | Direct mapping |
| `content` | `description` | Post body becomes event description |
| `eventDate` | `date` | Already ISO date string |
| `eventVenue` | `description` (append) | Append venue to description: `"{content}\n\n📍 Venue: {venue}"` |
| `eventStartTime` | `description` (append) | Append time to description |
| `schoolId` | `calendarId` | Resolve to this school's institutional calendar |
| — | `type` | Always `ACTIVITY` for community-sourced events |

> **Note**: The `CreateEventDto` also accepts `startDate` and `endDate` (optional). The `eventDate` from the post maps to the calendar's `date` field. If start/end times are needed, they can be mapped to `startDate`/`endDate`.

---

## 3. Backend Hook Logic (Pseudocode)

### On `createPost(input)`

```typescript
async function createPost(input: CreatePostDto) {
  // 1. Create the community post as usual
  const post = await prisma.communityPost.create({ data: input });
  
  // 2. If event fields are present, create a calendar event
  if (input.eventTitle && input.eventDate) {
    const schoolId = post.schoolId;
    
    // 2a. Find or create the institutional calendar for this school
    let calendar = await prisma.calendar.findFirst({
      where: { schoolId, classId: null }
    });
    
    if (!calendar) {
      calendar = await prisma.calendar.create({
        data: { schoolId, name: "Institutional Calendar" }
      });
    }
    
    // 2b. Build description: content + venue + time
    let description = input.content || "";
    const parts: string[] = [];
    if (input.eventVenue) parts.push(`📍 Venue: ${input.eventVenue}`);
    if (input.eventStartTime) parts.push(`🕐 Time: ${input.eventStartTime}`);
    if (input.eventCTAText || input.eventCTALink) {
      const ctaParts: string[] = [];
      if (input.eventCTAText) ctaParts.push(input.eventCTAText);
      if (input.eventCTALink) ctaParts.push(input.eventCTALink);
      if (ctaParts.length) parts.push(`🔗 ${ctaParts.join(": ")}`);
    }
    if (parts.length) {
      description = description 
        ? `${description}\n\n${parts.join("\n")}`
        : parts.join("\n");
    }
    
    // 2c. Create the calendar event
    const event = await prisma.calendarEvent.create({
      data: {
        calendarId: calendar.id,
        title: input.eventTitle,
        description,
        date: new Date(input.eventDate).toISOString(),
        type: "ACTIVITY",
      }
    });
    
    // 2d. Link the event back to the post
    await prisma.communityPost.update({
      where: { id: post.id },
      data: { eventCalendarId: event.id }
    });
  }
  
  return post;
}
```

### On `updatePost(id, input)`

```typescript
async function updatePost(id: string, input: UpdatePostDto) {
  const existing = await prisma.communityPost.findUnique({ where: { id } });
  
  // 1. Update the post
  const post = await prisma.communityPost.update({
    where: { id },
    data: input
  });
  
  const hasEventFields = input.eventTitle && input.eventDate;
  const hadEventFields = existing.eventCalendarId;
  
  if (hasEventFields) {
    if (hadEventFields) {
      // Update existing linked event
      await updateLinkedEvent(existing.eventCalendarId, input, post);
    } else {
      // Create new event (same as createPost logic)
      await createLinkedEvent(input, post);
    }
  } else if (hadEventFields && !hasEventFields) {
    // Event fields removed — delete the linked event
    await prisma.calendarEvent.delete({
      where: { id: existing.eventCalendarId }
    });
    await prisma.communityPost.update({
      where: { id: post.id },
      data: { eventCalendarId: null }
    });
  }
  
  return post;
}
```

### On `deletePost(id)`

```typescript
async function deletePost(id: string) {
  const post = await prisma.communityPost.findUnique({ where: { id } });
  
  // Delete linked calendar event if it exists
  if (post.eventCalendarId) {
    await prisma.calendarEvent.delete({
      where: { id: post.eventCalendarId }
    }).catch(() => {}); // Non-blocking: event may have been deleted separately
  }
  
  await prisma.communityPost.delete({ where: { id } });
}
```

---

## 4. GraphQL Schema Additions Requested

### New query to fetch calendar-linked event data for a post

```graphql
# Useful for the frontend to show "View on Calendar" links
extend type CommunityPost {
  eventCalendar: CalendarEvent  # Resolver fetches the linked event
}
```

### Update `CreatePostDto` / `UpdatePostDto`

Ensure these input types already include event fields. If not, add:
```graphql
input CreatePostDto {
  # ... existing fields ...
  eventTitle: String
  eventVenue: String
  eventDate: String
  eventStartTime: String
  eventIsRSVP: Boolean
  eventCTAText: String
  eventCTALink: String
}
```

---

## 5. Existing Backend Schema (for reference)

Already verified at `http://3.7.222.252:4000/graphql`:

### Calendar Event Fields
```graphql
type CalendarEvent {
  id: ID!
  calendarId: ID!
  title: String!
  description: String
  date: String!
  type: EventType!  # HOLIDAY | EXAM | ACTIVITY | HALF_DAY | ANNUAL_DAY
  createdAt: DateTime
  updatedAt: DateTime
}
```

### CreateEvent Mutation
```graphql
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

input CreateEventDto {
  calendarId: ID
  title: String!
  description: String
  date: String!
  startDate: String
  endDate: String
  type: EventType!
}
```

### UpdateEvent / RemoveEvent Mutations
```graphql
mutation UpdateEvent($id: ID!, $input: UpdateEventDto!) {
  updateEvent(id: $id, updateEventInput: $input) {
    id
    title
  }
}

mutation RemoveEvent($id: ID!) {
  removeEvent(id: $id) {
    id
  }
}
```

---

## 6. Frontend Impact Summary

| Area | Impact |
|---|---|
| **Calendar Page** (`CalendarPage.tsx`) | **No changes needed.** Already fetches `calendars → events` via `GetCalendars`. Synced events will appear automatically. |
| **Dashboard** (`ProgramsTable.tsx`) | **No changes needed.** Already reads from `calendars → events`. Synced events will appear in upcoming events widget. |
| **Community Page** (`CommunityPage.tsx`) | **Minor optional enhancement.** Could show a "View on Calendar" badge on posts with linked events. |
| **Edit/Delete on Calendar page** | Calendar page already supports `UpdateEvent`/`RemoveEvent`. If an event was auto-created from a community post, editing/deleting it from Calendar will **not** update the community post — this is acceptable (calendar is the authoritative scheduling view). |

### Optional Frontend Enhancement: "View on Calendar" badge

If the `eventCalendarId` field is exposed via `GetCommunityPosts`, the community page could show a small badge:

```tsx
{post.eventCalendarId && (
  <span className="...">📅 Also on Calendar</span>
)}
```

---

## 7. Implementation Priority

| Step | Description | Effort |
|---|---|---|
| 1 | Add `eventCalendarId` column to `CommunityPost` table | Small |
| 2 | Implement post-save hook on `createPost` | Medium |
| 3 | Implement post-update hook on `updatePost` | Small |
| 4 | Implement cascade delete on `deletePost` | Small |
| 5 | Expose `eventCalendar` resolver on `CommunityPost` type | Small |
| 6 | Verify end-to-end: create community event → appears on Calendar page | Medium |
