# Backend Integration Feedback: Bulk Import Class Mapping Gaps

This document details the root causes and recommendations regarding the class mapping and teacher assignment gaps discovered during the integration of bulk imports (CSV/JSON).

---

## 1. Mismatch in Grade Format Resolution
* **Service**: `identity-service`
* **File Reference**: services/identity-service/src/users/users.service.ts

### The Issue
Spreadsheet imports for students and staff frequently contain numeric grade representations (e.g., `"8"`, `"9"`, `"10"`) or ordinals (e.g., `"8th"`). The class mapping lookup in the backend uses strict string matching against the database grade names (e.g., `"Grade 8"`):

```typescript
const key = `${sid}|${input.enrollmentGrade.toLowerCase()}|${input.enrollmentSection.toLowerCase()}`;
const cid = classMapping.get(key); // Fails for "8" because catalog has "grade 8"
```

If this check fails, the user is successfully created but has a `null` `classId`, resulting in `0 enrolled students` displaying in the frontend class grids.

### Recommendations
Implement fuzzy grade resolution in the backend interceptor to handle raw numbers and ordinals:
```typescript
const normalizeGradeString = (val?: string): string | undefined => {
  if (!val) return undefined;
  const num = val.replace(/\D/g, ""); // Extract digits
  return num ? `grade ${num}` : val.toLowerCase().trim();
};
```
And use this normalization when building the map keys and doing lookup keys.

---

## 2. Strict Check on `classId === null`
* **Service**: `identity-service`
* **File Reference**: `bulkCreateUsers` / `importUsersCsv` interceptor checks.

### The Issue
The dynamic mapping logic is only triggered if the `classId` field is explicitly passed as `null`. If the frontend omits the key (meaning it is `undefined` in JavaScript/GraphQL), the backend creates the user record without running the dynamic lookup.

### Recommendations
Modify the resolver check to execute resolution when `classId` is *either* `null` or `undefined` (absent) and both `enrollmentGrade` and `enrollmentSection` are present:
```typescript
if (!input.classId && input.enrollmentGrade && input.enrollmentSection) {
  // Execute resolution...
}
```

---

## 3. Missing Class Teacher Sync (Identity to Structure Sync Gap)
* **Services**: `identity-service` & `school-structure-service`
* **File Reference**: services/identity-service/src/users/users.service.ts

### The Issue
When a user with the role of `TEACHER` is imported with a class designation, the resolved class UUID is successfully appended to their **`classIds`** array in the `identity-service` database.

However, the Class itself (located in the `school-structure-service` database) is **never updated** to set its **`classTeacherId`** field to this new teacher's ID. As a result:
- The teacher sees the class in their profile scope.
- The class itself lists **`No Teacher Assigned`** on the Classes dashboard.

### Recommendations
When a teacher is created or imported with a class mapping:
1. **Event-Driven**: Publish a `user.teacher.created` event from `identity-service` containing `userId`, `schoolId`, and the resolved `classId`.
2. **Subscription**: Subscribe to this event in the `school-structure-service` and execute an update to set the class's `classTeacherId` equal to the teacher's `userId`.

Alternatively, if direct synchronous client calls are acceptable, expose an endpoint on `StructureClientService` to assign the class teacher during user transaction finalization.
