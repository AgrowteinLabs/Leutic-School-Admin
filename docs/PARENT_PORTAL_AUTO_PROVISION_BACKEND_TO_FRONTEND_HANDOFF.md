# Parent Portal Auto-Provision — Backend Handoff

> **Status:** COMPLETED (identity-service)

## Behavior

When a **STUDENT** is created via `createUser` or `bulkCreateUsers` / CSV import:

1. Reads **`guardians[0]`** as the primary portal parent (frontend ordering convention).
2. If `guardians[0].mobileNo` is present:
   - Finds existing `PARENT` user by `mobileNo`, or creates one (`password: null`, `isActive: true`).
   - Creates `ParentChild` link `{ parentId, studentId }` (upsert — idempotent).
3. Secondary guardians (`guardians[1+]`) remain `StudentGuardian` contact rows only.

## Parent login

Parents authenticate via **mobile OTP** — no password required. Reuses existing `User.mobileNo` uniqueness.

## Frontend contract (unchanged)

- Put the selected portal parent at **`guardians[0]`** in `createUser` / `bulkCreateUsers`.
- Bulk CSV: `ParentPortalAccess` column → frontend reorders guardians before API call.

## Verify

```graphql
mutation {
  createUser(createUserInput: {
    role: "STUDENT"
    name: "Test Student"
    schoolId: "<schoolId>"
    classId: "<classId>"
    admissionNumber: "ADM-TEST-001"
    guardians: [{
      relationship: "Mother"
      fullName: "Portal Parent"
      mobileNo: "+919999999901"
    }]
  }) { id }
}

query {
  parentsByStudentId(studentId: "<studentId>") {
    id
    name
    mobileNo
  }
}
```
