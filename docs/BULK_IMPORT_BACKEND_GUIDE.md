# Backend Developer Specification: Bulk Import Integration & Transaction Rules

This document outlines critical backend requirements for the **Bulk Import** API mutations (`bulkCreateUsers` and `bulkCreateClasses`). It addresses rate-limiting, transaction boundaries, password generation logic, and error-handling requirements.

---

## 1. Rate-Limiting & Performance Requirements

When bulk importing datasets (e.g., 50+ classes or teachers), the client sends a single GraphQL mutation with an array of inputs.

* **Mutation**: `bulkCreateUsers(inputs: [CreateUserDto!]!)`
* **Mutation**: `bulkCreateClasses(inputs: [CreateClassInput!]!)`

**Requirement**: The gateway and microservice routers MUST skip throttling/rate limits for these bulk endpoints, or explicitly exclude requests originating from authenticated administrators (`SCHOOL_ADMIN` or `SUPER_ADMIN` roles).

---

## 2. Database Transaction Atomicity ("All-or-Nothing")

### 2.1 Transaction Rollback

If a single validation or database insertion error occurs anywhere in the batch import payload (e.g. Row 42 has a duplicate email or invalid field), **no data must be saved to the database**.

* The backend must wrap the entire batch operation inside a single transaction block (e.g., Prisma's `$transaction`).
* If any row throws an error, the transaction **must roll back completely**, leaving the database in its original clean state. Partial imports are unacceptable.

### 2.2 Fix Cascading Foreign Key Failures

We observed Prisma throwing foreign key constraint errors during batch rollback:

```text
Foreign key constraint violated on the constraint: `EmailVerificationToken_userId_fkey`
```

**Requirement**: Downstream operations, such as generating verification tokens (`EmailVerificationToken.upsert`), MUST only execute if the user was successfully created and persisted. Ensure token creation calls are executed inside the same transaction boundary as the user creations, or skipped entirely for failed user models.

---

## 3. Password Generation & Credentials Export

### 3.1 Autogeneration Logic

* If the `password` field in `CreateUserDto` is **empty or omitted**, the backend must dynamically generate a strong temporary password.
* The generated password must strictly comply with all security validation decorators (e.g., minimum length, containing at least one digit, one uppercase letter, and one special character).

### 3.2 Password Feedback Response

To allow administrators to distribute credentials to teachers and students, the backend must return the generated/assigned password in the API response.

* Update `ImportRowResult` to include a `tempPassword` field:

```graphql
type ImportRowResult {
  rowNumber: Int!
  identifier: String!
  status: ImportStatus! # SUCCESS or FAILED
  error: String
  tempPassword: String # <--- Return the generated password here
}

enum ImportStatus {
  SUCCESS
  FAILED
}

type BulkImportResponse {
  totalCount: Int!
  succeededCount: Int!
  failedCount: Int!
  results: [ImportRowResult!]!
}
```

* When the import is successful, the client will read the `tempPassword` array to generate a downloadable Excel/CSV listing each staff member's Username (Email) and password.

---

## 4. User-Friendly Error Formatting

The API must catch database exceptions and return readable, human-friendly error messages instead of raw SQL/Prisma stack traces.

### Required Error Mappings

| Database/Validation Error | Friendly Output Message |
| :--- | :--- |
| Prisma unique constraint failure on `email` | `"Email address is already registered in the system."` |
| Prisma unique constraint failure on `employeeId` | `"Employee ID is already assigned to another staff member."` |
| Password strength validation failure | `"Password must be at least 8 characters long and include a digit, an uppercase letter, and a special character."` |
| Missing required parameters (e.g. `name`, `mobileNo`) | `"Required field '[Field Name]' is missing or blank."` |
| Class reference check failed | `"Class '[Grade] - [Section]' does not exist in this school. Create the class first."` |

---

## 5. Summary Checklist for Backend Engineers

* Implement `$transaction` around bulk insertions.
* Skip NestJS Throttler for `bulkCreateUsers` and `bulkCreateClasses` endpoints.
* If `input.password` is empty, autogenerate a valid password.
* Add `tempPassword` to the `ImportRowResult` GraphQL response type.
* Intercept Prisma errors and convert them to human-readable strings.
* Verify that token generation is bound strictly to active transaction commits.
