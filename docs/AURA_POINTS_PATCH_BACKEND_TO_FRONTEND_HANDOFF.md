# Handoff: Aura Points System Patch

> [!NOTE]
> **STATUS: COMPLETED**
> 
> The Aura Points System fixes have been implemented in the backend, addressing issues with the On-Time Bonus, Perfect Week Booster, rule atomicity, and `academicYearId` handling. The backend is fully tested and verified.

---

## 1. GraphQL Schema Updates

### A. Dynamic Academic Year Parameter Added
The mutations and queries that process Aura Points have been updated to require or accept `academicYearId` to ensure points map to the correct active session.

**Quiz Submissions:**
```graphql
extend type Mutation {
  submitQuizAttempt(
    quizId: ID!
    studentId: ID!
    score: Int!
    academicYearId: String!
  ): StudentQuizAttempt!
}
```

**Assignment Submissions:**
```graphql
input UpdateAssignmentSubmissionDto {
  status: String!
  score: Int!
  academicYearId: String!
}

extend type Mutation {
  updateAssignmentSubmission(
    id: ID!
    input: UpdateAssignmentSubmissionDto!
  ): AssignmentSubmission!
}
```

### B. Rule Configuration Re-Architecture
The Aura Rules configuration is no longer updated one-by-one. We now accept a complete JSON string payload that is atomically updated to maintain data integrity.

```graphql
extend type Mutation {
  updateAuraRules(rulesJson: String!): Boolean!
}
```

---


- **Assignment On-Time Calculation:** The `submittedAt` timestamp is now automatically populated when transitioning an assignment's status to `SUBMITTED`, ensuring the backend can accurately compute the On-Time Bonus based on the Assignment's due date.
- **Perfect Week Booster Engine:** The backend actively runs the perfect week checks at the end of both `processQuizAura` and `processAssignmentAura` pipelines. It cross-references weekly attendance records via the logistics-service integration.
- **Reduced DB Round-trips:** Quiz attempt submission flows no longer redundantly query the attempt ID out of the database, boosting performance.

Please ensure that your frontend requests are passing the current session's `academicYearId` for all the above mutations!
