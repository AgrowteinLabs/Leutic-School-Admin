# Frontend Data Requirements: Attendance Module

This document outlines the frontend data requirements, user actions, forms, and interface filters for the **Attendance Management** module. It serves as a guide for the backend team to design daily presence log APIs.

> [!NOTE]
> **Backend Handoff Alignment:**
> These attendance requirements correspond to **Section 4 (Attendance Management)** of [CLASSES_BACKEND.md] which has already been shared with the backend team. They are presented here as a dedicated module for ease of tracking, while maintaining full consistency with the previously shared classes document.

---

## 1. Global Filters & Header Actions

Daily attendance is logged via a top-level tabbed dashboard (`/attendance`).

* **Date Picker**: sets the target date for the attendance register sheet.
* **Search Input**:
  * Under **Students** sub-tab: Filters student list by name or class roll number.
  * Under **Staff** sub-tab: Filters staff list by name or role designation.
* **Export Dropdown**: Options to export current attendance list as CSV or PDF documents.
* **Save Attendance**: Submits and logs changes.

---

## 2. Students Attendance Registry

### 2.1 UI Filters & Stats Cards
* **Class Selector Dropdown**: Filter students by specific class section (e.g. `"Grade 10-A"`, `"Grade 10-B"`, `"Grade 11-A"`).
* **Stats Overview**:
  * **Total Students**: Headcount of students enrolled in the selected section.
  * **Present Count**: Number of students currently marked present.
  * **Absent Count**: Number of students currently marked absent.
  * **Attendance %**: Calculated attendance rate ($\text{Present} \div \text{Total}$).

### 2.2 Table Layout & Batch Controls
* **Master Batch Buttons**: `"All Present"` / `"All Absent"` options to set the status of all currently filtered student rows at once.
* **Roll No Column**: Index number.
* **Student Column**: Avatar photo, student name, and registration ID.
* **Status Column**: Present/Absent toggle pill.
* **Notes Column**: Text input on each student row to append remarks (e.g. `"Sick Leave"`).
* **Override Alert Banner**: Displayed when attendance has already been saved for the selected date, showing the author (e.g. `"Attendance taken by Ms. Saritha. Saving will override previous records"`).

---

## 3. Staff Attendance Registry

Tracks daily presence, leaves, and substitute teaching assignments.

### 3.1 Stats Cards
* **Total Staff**: Total staff headcount.
* **Present Count**: Number of present staff.
* **On Leave Count**: Number of staff on leave.
* **Late/Half Day Count**: Number of staff marked late or half-day.

### 3.2 Table Layout & Substitution
* **Staff Column**: Avatar photo, full name, and designation role.
* **Status Selector**: Four-way toggle selector allowing present states: `"Present"`, `"On leave"`, `"Half day"`, or `"Late"`.
* **Coverage/Substitute Column**:
  * If status is `"Present"`: Displays `"Full coverage"`.
  * If status is `"On leave"`: Displays the name of the assigned **Substitute Teacher** and the **Absence Reason** category (e.g., `"Medical"`, `"Casual"`).

---

## 4. Attendance Logic & Notification Rules

* **30-Minute Edit Window**:
  * Saved attendance remains editable/overridable for 30 minutes after submission.
* **Delayed Absence Alerts**:
  * When student attendance is submitted, parent notifications (SMS & Push notifications) are held for 30 minutes.
  * After this edit window expires, the system checks the final status; if the student remains marked absent, notifications are dispatched to their guardians. This prevents false alarms from accidental teacher input.
