# Backend Integration Guide: Student Parent Portal Account Auto-Creation

This guide outlines the GraphQL payload contract and API expectations for auto-creating Parent Portal accounts when enrolling new students.

---

## 1. Overview
When a student is enrolled (either singly or via bulk CSV upload), the system must automatically provision a parent account for the primary guardian. 

To specify which parent/guardian should have their account created without altering the existing GraphQL schema, the frontend uses an **array-ordering convention**.

---

## 2. API Contract & Ordering Convention

### Mutations Impacted
1. `createUser(createUserInput: CreateUserDto!)` (Single Student Enrollment)
2. `bulkCreateUsers(inputs: [CreateUserDto!]!)` (Bulk Student Import)

### The Payload Contract
In both mutations, the `CreateUserDto` accepts a `guardians` field of type `[StudentGuardianInput!]!`. 
The frontend orders this array based on the administrator's selection:
- **`guardians[0]` (Index 0)**: The primary parent/guardian for whom the parent portal account **must** be created.
- **Subsequent elements (`guardians[1]`, etc.)**: Secondary contacts for database recording only (no immediate portal login provisioning required).

#### Example GraphQL Variables Payload:
```json
{
  "input": {
    "role": "STUDENT",
    "name": "Arjun Sharma",
    "admissionNumber": "ADM-2026-0045",
    "classId": "class-uuid-123",
    "guardians": [
      {
        "relationship": "Mother",
        "fullName": "Priya Sharma",
        "mobileNo": "+919876543212",
        "email": "priya.s@example.com",
        "occupation": "Teacher"
      },
      {
        "relationship": "Father",
        "fullName": "Rajesh Sharma",
        "mobileNo": "+919876543211",
        "email": "rajesh.s@example.com",
        "occupation": "Engineer"
      }
    ]
  }
}
```
*In the above payload, a parent portal account must be created for the **Mother** (`Priya Sharma`), as she is placed first in the list.*

---

## 3. Backend Implementation Checklist

To support this flow, the backend user registration service should:
1. **Identify the Primary Guardian**: Read the first element (`guardians[0]`) from the incoming `StudentGuardianInput` array.
2. **Provision Parent User**:
   - Check if a user with role `PARENT` and mobile number matching `guardians[0].mobileNo` already exists.
   - If not, create a new `User` record with:
     - `role: "PARENT"`
     - `name: guardians[0].fullName`
     - `mobileNo: guardians[0].mobileNo`
     - `email: guardians[0].email`
     - `isActive: true`
3. **Map Parent-Child Relationship**:
   - Link the newly created student profile `ID` to the parent user's `childrenIds` list to allow access on login.
4. **Authentication Credentials**:
   - Parents log in using **OTP via Mobile Number** on the Parent Portal. The backend must ensure that parent accounts are compatible with mobile/OTP authentication and do not strictly require a password during portal login queries.

---

## 4. Bulk CSV Upload Specifications

For student bulk uploads via CSV, the sheet now contains a **`ParentPortalAccess`** column:
- **Allowed Values**: `Father`, `Mother`, or `Guardian` (case-insensitive).
- **Processing**: The frontend parses this column and orders the `guardians` payload array so that the selected guardian is placed at index `0`.
- **Backend CSV Support**: No backend CSV parser changes are required, since the frontend maps and normalizes the spreadsheet rows into structured `CreateUserDto` payloads prior to making the `bulkCreateUsers` request.
