# Frontend Data Requirements: Community & Interaction Module

This document outlines the frontend data requirements, user actions, forms, and interface filters for the **Community & Interaction** module. It serves as a guide for the backend team to design post feeds, interactive polls, event RSVPs, Q&A discussion trees, and moderation workflows.

---

## 1. Timeline Feed

The main timeline feed allows administrators, faculty, and students (subject to moderation) to share updates, events, polls, and announcements.

### 1.1 Create Post Wizard & Smart Attachments
An expanding widget allows drafting posts with a variety of structured attachments:

* **Basic Post Details**:
  * **Post Content**: Auto-expanding textarea block for text content.
  * **Category Selector**: Dropdown to categorize posts (`"Academic"`, `"Events"`, `"Campus"`).
* **Audience Selector Dropdown (Searchable)**:
  * **Institutional Groups (Multi-select)**: `"Global (All Schools)"`, `"School-wide (All People)"`, `"Faculty & Teachers"`, `"Parents"`, `"Students"`.
  * **Custom Class Sections (Multi-select)**: Grade filters (e.g., `"10A"`, `"10B"`, `"9A"`, `"9C"`, `"8B"`, `"7A"`).
* **Smart-Add Attachments**:
  * **Image File**: Standard image uploader with preview and clear action.
  * **Document Attachment**: PDF/Word document attachment displaying document name and institutional labels.
  * **Location Pin**: Mapped location details string (e.g., `"Main Campus, High School Wing | Block A, Floor 2"`).
  * **Event Configuration Modal**:
    * **Event Title**: Text input.
    * **Venue / Location**: Text input.
    * **Event Date**: Date selection.
    * **Start Time**: Time selection.
    * **RSVP Toggle**: Boolean flag to enable/disable RSVP.
    * **CTA Link Button (Advanced)**: Fields to configure an action button: **Button Text** (e.g., `"Register Now"`) and **Action Link** (https URL).
  * **Interactive Poll Widget**:
    * **Poll Question**: Text input.
    * **Poll Options**: Dynamic list of text inputs (starts with two, allows adding/removing options).

### 1.2 Feed Filters & Layout Types
* **Category Filters (Horizontal bar)**: Quick tabs to filter timeline posts: `"all"`, `"institutional"`, `"faculty"`, `"student"`, `"parent"`, `"class"`.
* **Feed Items Layout**:
  * **Standard Announcement/Post**: Author name, avatar, role, post text, verified status badge, reactions, comments count, and elapsed time.
  * **Aura Reaction (Upvote/Bolt)**: Double-clicking a post or tapping the bolt button increments the reaction count. Displays list of avatar bubbles of users who reacted.
  * **Competition Cards**: Displays date badge (Day/Month/Year), event title, location/venue, registered teams count, and a `"Join Now"` CTA button.
  * **Active Poll Cards**: Displays poll question, vote percentage bars for each option, institutional vote count, and status indicators (e.g. `"Selection Locked"` once voted, or `"Ends in 48h"`).

---

## 2. Q&A Hub (Global Discussions)

An academic and institutional Q&A board where questions are posted and resolved via nested discussion trees.

### 2.1 Discussion List & Stats
* **Sort Filters**: Tabs to sort the global discussion list by status: `"Newest"`, `"Active"`, `"Unanswered"`.
* **Stats Counters**: Total questions count, and individual cards displaying:
  * **Votes**: Upvotes count.
  * **Answers**: Response count.
  * **Views**: View counts.
* **Metadata Fields**: Question Title, excerpt preview, tag chips, author profile (name, avatar, reputation points), and timestamp.

### 2.2 Nested Response Tree
* **Response Node Structure**:
  * **Author Profile & Roles**: Shows avatar, name, designation, and special badge tags: `"AI Assistant"`, `"Faculty"`, `"Principal"`, or `"Verified"`.
  * **Text Content**: Response text.
  * **Chronology**: Relative timestamp (e.g. `"1h ago"`).
* **Interactive Actions**:
  * **Reply**: Spawns a nested textarea input underneath the node to reply directly to that author, creating a child response node.
  * **Upvote**: Increments response vote counter.
  * **Verify Option**: Allowed only for **Faculty** and **Principal** roles. Tapping this marks the reply as verified (`isVerified: true`) and flags the parent question as resolved (`hasAcceptedAnswer: true`).

---

## 3. Moderation Queue

Administrators use the moderation panel to review, filter, and approve or reject community-submitted content.

### 3.1 Pending Items List & Filters
* **Pending Stats Overview**: Total count of items awaiting review.
* **Filter Dropdown**: Filter lists by type: `"All pending"`, `"Reported only"`, `"Verification"`.
* **Moderation Card Fields**:
  * **Submitting Author**: Name, avatar, category.
  * **Submitted Content**: Text body and attached media/image thumbnail.
  * **Severity Indicator**: Color-coded severity badge (`"low"`, `"medium"`, `"high"`).
  * **Timestamp**: Elapsed time since submission.

### 3.2 Moderation Actions
* **Approve**: Publishes the item directly to the live timeline feed.
* **Reject**: Opens a rejection reason dialog/dropdown (reasons: `"Inappropriate language"`, `"Off-topic"`, `"Duplicate"`, or Custom Text reason) and removes the item from the queue.
* **Flag/Escalate**: Flags the post for senior administrator review.

---

## 4. Sidebar Community Filters

A sticky sidebar containing granular filters for refined timeline/feed customization.

* **Program Category Checkboxes**:
  * `"Academic programs"`
  * `"Athletics & sports"`
  * `"Arts & culture"`
  * `"Social impact"`
* **Academic Level Chips**: Selectable filters to isolate levels: `"Junior high"`, `"Senior high"`, or `"Faculty only"`.
* **Post Visibility Toggles**:
  * `"Urgent updates only"`
  * `"Verified sources"`
* **Reset Button**: Single action to clear all applied sidebar filters.
