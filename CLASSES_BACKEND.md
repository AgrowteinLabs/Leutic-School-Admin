# Frontend Data Requirements: Classes & Attendance Module

This document specifies the frontend data models, form structures, user actions, and UI filters for the **Classes & Attendance** module. It serves as a guide for the backend team to design APIs that match what the user interface displays, filters, and submits.

---

## 1. Classes Overview & Registry

The main dashboard lists all active class sections in a card grid.

### 1.1 Card Fields (What is Displayed)
* **Class Identifier**: Grade level and Section (e.g., `"Grade 10 - B"`).
* **Room & Shift**: Room number and daily shift (e.g. `"Room 304 | Morning Shift"`).
* **Lead Teacher**: Name of the class teacher (e.g. `"Ms. Preetha"`).
* **Students Count**: Number of enrolled students in the section (e.g. `28`).
* **Weekly Participation Rate**: Percentage (e.g. `94%`).
* **Section Status Alert**: standing categories: `"Normal"`, `"Attention"`, or `"At Risk"`.

### 1.2 UI Filters & Actions
* **Search Bar**: Text-based query filtering classes, teachers, or schedules.
* **Grade Level Dropdown**: Filter list by specific grade (e.g. `"Grade 9"`, `"Grade 10"`, `"Grade 11"`, `"Grade 12"`).
* **Section Dropdown**: Filter list by section letter (e.g. `"A"`, `"B"`, `"C"`, `"D"`).
* **Advanced Filter (Tune)**: Button to toggle advanced filtering (e.g., by shift or status).
* **Export List**: Action button to download the list.
* **Table Pagination**: Controls for current page index and items-per-page dropdown (e.g., `10`).

---

## 2. Create Class Wizard

A two-step interactive setup wizard for establishing a new academic section.

### 2.1 Step 1: Class & Faculty Setup
The form collects:
* **Grade Level**: Dropdown selection (e.g., `"Grade 10"`).
* **Section Name**: Text input (e.g., `"A"`).
* **Academic Session**: Dropdown selection (e.g., `"2025-26"`).
* **Class Teacher**: Searchable selection of faculty names.
* **Student Capacity**: Number input (e.g., `40`).
* **Room / Lab Number**: Text input (e.g., `"Room 304"`).
* **Daily Shift**: Dropdown selection (`"Morning Shift"`, `"Afternoon Shift"`, `"Evening Shift"`).

### 2.2 Step 2: Student Enrollment (Optional)
Allows the administrator to assign students to the newly configured section:
* **Search Student Bar**: Text input to filter the student list by name.
* **Selection Grid**: Checklist grid showing student avatars, names, and current grade. Selecting a student updates the selected counter indicator.

---

## 3. Class Details & Management Hub

Displays deep performance statistics, student rosters, activity timelines, and configuration controls for a selected class section.

### 3.1 Class Performance Stats
Four cards displaying real-time metrics:
* **Avg Participation**: Percentage (e.g., `94.2%`) with weekly trend changes (+/-).
* **Attendance Rate**: Percentage (e.g., `98.5%`).
* **Active Programs**: Count of special programs mapped to the class.
* **Behavior Flags**: Count of student behavior alerts requiring attention.

### 3.2 Student Roster
A list of mapped students with the following columns and filters:
* **Student Search Bar**: Quick search filtering by student name or admission ID.
* **Student Profile**: Shows name, unique admission number (e.g. `"ADM-2024-001"`), and avatar.
* **Participation**: Individual participation percentage with a color-coded circular progress bar.
* **Aura Score**: Points accumulated by the student.
* **Standing**: Current behavior status tag (`"Good Standing"`, `"Behavior Flag"`, or `"High Risk"`).

### 3.3 Class Activity Timeline
A sidebar tracking recent events categorized by type:
* **Types**: `"Curriculum"` (e.g. assignment published), `"Programs"` (e.g. registrations), `"Alert"` (e.g. absence thresholds), and `"Staff Note"` (e.g. substitute scheduled).
* **Details**: Title, description text, and time elapsed (e.g. `"1h ago"`, `"Yesterday"`).

### 3.4 Manage Class Drawer (Edit Panel)
Allows editing of details and modifying student rosters:
* **Fields**: Edit Grade, Section, Assigned Room, and Lead Teacher.
* **Roster Modification**:
  * Displays the list of currently mapped students with a `"Remove"` button next to each name.
  * **Search & Add Input**: Quick search box to add a student by name or ID.
  * **Bulk Import (File Picker)**: Triggers file selection for uploading CSV/Excel spreadsheets to enroll multiple students at once.
* **Delete Class Registry**: Action button to delete the section, requiring the user to type the class name as confirmation.

### 3.5 Message Parents (Class Broadcast Modal)
Allows sending alerts directly to guardians of students in this section:
* **Recipients Counter**: Displays target count (e.g., `"Targeting 42 recipients"`).
* **Broadcast Title**: Text input (with quick tag chips: `"General Update"`, `"Emergency"`, `"Fee Reminder"`, `"Event Invite"`).
* **Message Body**: Textarea limited to 500 characters.
* **Attachment**: Image file uploader with preview and remove buttons.
* **Live Preview**: Simulates a mobile phone screen displaying how the notification title, text body, and image attachment look.

---

## 4. Attendance Management

Provides separate attendance logging dashboards for Students and Staff.

### 4.1 Global Filters & Header Actions
* **Date Picker**: Sets the calendar date for the attendance sheet.
* **Search Input**: Filters records in the table.
  * Under Students tab: Filters by student name or roll number.
  * Under Staff tab: Filters by staff name or role.
* **Export Dropdown**: Options to export records as CSV or PDF.
* **Save Attendance**: Action button to submit changes.

---

### 4.2 Students Attendance Tab

Used by class teachers or admins to submit daily class presence logs.

#### UI Filters
* **Class Selector Dropdown**: Filter student list by class section (e.g., `"Grade 10-A"`, `"Grade 10-B"`).

#### Stats Overview Cards
* **Total Students**: Enrolled count.
* **Present Count**: Number of present students.
* **Absent Count**: Number of absent students.
* **Attendance %**: Calculated rate ($\text{Present} \div \text{Total}$).

#### Roster Table & Batch Controls
* **Master Batch Buttons**: `"All Present"` / `"All Absent"` options to set the status for all filtered students.
* **Roll No Column**: Index numbers.
* **Student Column**: Shows student name, ID, and avatar.
* **Status Column**: Present/Absent toggle pill.
* **Notes Column**: Text input on each student row to append remarks (e.g. `"Sick Leave"`).
* **Override Alert Banner**: Warning if attendance has already been logged for that date, showing who took it (e.g. `"Attendance taken by Ms. Saritha. Saving will override previous records"`).

---

### 4.3 Staff Attendance Tab

Used by institutional admins to manage staff presence, leaves, and coverages.

#### Stats Overview Cards
* **Total Staff**: Headcount.
* **Present**: Count of present staff members.
* **On Leave**: Count of staff currently on leave.
* **Late/Half Day**: Count of delayed or half-day staff logs.

#### Roster Table & Substitution Configuration
* **Staff Column**: Name, role title, and avatar.
* **Status Selector**: Four-way toggle selectors for `"Present"`, `"On leave"`, `"Half day"`, or `"Late"`.
* **Coverage/Substitute Column**:
  * If the staff member is present: Displays `"Full coverage"`.
  * If on leave: Displays the name of the assigned **Substitute Teacher** and the **Absence Reason** (e.g., `"Medical"`, `"Casual"`).

---

### 4.4 Attendance Logic & Safety Modals

* **30-Minute Edit Window**: Once attendance is saved, it is editable for 30 minutes. The UI notes that changes override previous records during this window.
* **Delayed Alerts**: When attendance is finalized, parent alerts are held. If a student is marked absent, a notification will be sent to the parent after the 30-minute edit window expires (allowing teachers to correct any accidental marks).
