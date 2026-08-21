# ChoreoLab — API

GraphQL API served by Apollo Server.  
Base URL (dev): `http://localhost:4000`  
Base URL (prod): configured via Render environment.

## Conventions

### Authentication

Protected operations require a JWT in the request header:

```
Authorization: Bearer <token>
```

Public operations: `signUp`, `login`, `forgotPassword`, `resetPassword`, `health`.

All other operations require authentication.

### Error Handling

Errors follow GraphQL error format with extensions:

```json
{
  "errors": [
    {
      "message": "Routine not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

Standard error codes:

| Code                    | Meaning                             |
| ----------------------- | ----------------------------------- |
| `UNAUTHENTICATED`       | Missing or invalid JWT              |
| `FORBIDDEN`             | Valid JWT but not owner of resource |
| `NOT_FOUND`             | Resource does not exist             |
| `BAD_USER_INPUT`        | Validation failure                  |
| `INTERNAL_SERVER_ERROR` | Unexpected server error             |

### Naming

- Types: PascalCase (`Routine`, `BodyElement`)
- Fields: camelCase (`gymnastName`, `dbScore`)
- Enums: lowercase values in GraphQL schema (`hoop`, `senior`) matching MongoDB storage
- Mutations: verb-first (`createRoutine`, `updateRoutine`, `deleteRoutine`)
- Queries: noun-first (`routine`, `routines`, `bodyElements`)

---

## Enums

```graphql
enum Apparatus {
  hoop
  ball
  clubs
  ribbon
}

enum AgeCategory {
  senior
  junior
}

enum RoutineItemType {
  body_element
  risk
  mastery
  artistry
}

```

---

## Types

### Coach

```graphql
type Coach {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  club: String
  createdAt: String!
}
```

Password hash is never exposed.

### AuthPayload

```graphql
type AuthPayload {
  token: String!
  coach: Coach!
}
```

### BodyElement

```graphql
type BodyElement {
  id: ID!
  code: String!
  name: String!
  category: String!
  value: Float!
  apparatus: [Apparatus!]!
  description: String
}
```

### Requirement

```graphql
type Requirement {
  id: ID!
  ageCategory: AgeCategory!
  DB: DBRequirements!
  DA: DARequirements!
  A: ArtistryRequirements!
}

type DBRequirements {
  minElements: Int!
  maxElements: Int!
  requiredElements: [String!]!
  maxRisks: Int!
}

type DARequirements {
  minMasteries: Int!
  maxMasteries: Int!
  maxAcrobatics: Int!
}

type ArtistryRequirements {
  minCharacterMoves: Int!
  minDanceSteps: Int!
  minDynamicEffects: Int!
}
```

### Risk (embedded — not a reference query)

Composed on the routine timeline from `rcriteria` and `rotations`. See [DATABASE.md](./DATABASE.md).

```graphql
type RiskRotation {
  rotationId: ID!
  count: Int!
}

type Risk {
  criteriaIds: [ID!]!
  rotations: [RiskRotation!]!
  value: Float!
}
```

### Base

```graphql
type Base {
  id: ID!
  name: String!
  value: Float!
  apparatuses: [Apparatus!]!
  allowedCriteria: [ID!]!
}
```

### DACriteria

```graphql
type DACriteria {
  id: ID!
  name: String!
}
```

### RCriteria

```graphql
enum RCriteriaType {
  throw
  catch
  general
}

type RCriteria {
  id: ID!
  name: String!
  type: RCriteriaType!
  value: Float!
  apparatuses: [Apparatus!]!
}
```

### Rotation

```graphql
type Rotation {
  id: ID!
  name: String!
  group: String!
}
```

### ArtistryComponent

```graphql
enum ArtistryType {
  character
  dance
  dynamicChange
  effect
}

type ArtistryComponent {
  id: ID!
  name: String!
  type: ArtistryType!
}
```

### Mastery (embedded)

```graphql
type Mastery {
  baseIds: [ID!]!
  criteriaIds: [ID!]!
  rotationId: ID
  value: Float!
  isAcro: Boolean!
}
```

### RoutineItem

```graphql
type RoutineItem {
  id: ID!
  type: RoutineItemType!
  order: Int!
  bodyElement: BodyElement
  risk: Risk
  mastery: Mastery
  artistryComponent: ArtistryComponent
}
```

### ValidationResult

```graphql
type MissingRequirement {
  id: ID!
  domain: String!
  message: String!
}

type ValidationResult {
  isValid: Boolean!
  dbValid: Boolean!
  daValid: Boolean!
  artistryValid: Boolean!
  missingRequirements: [MissingRequirement!]!
  calculatedAt: String!
}
```

### Routine

```graphql
type Routine {
  id: ID!
  gymnastName: String!
  apparatus: Apparatus!
  ageCategory: AgeCategory!
  timeline: [RoutineItem!]!
  dbScore: Float!
  daScore: Float!
  validation: ValidationResult!
  createdAt: String!
  updatedAt: String!
}
```

---

## Queries

### Public

```graphql
health: String!
```

### Auth

```graphql
me: Coach!
```

Returns the authenticated coach's profile.

### Reference Data (authenticated, read-only)

```graphql
bodyElements(apparatus: Apparatus, category: String): [BodyElement!]!
bodyElement(id: ID!): BodyElement
requirements(ageCategory: AgeCategory!): Requirement

bases(apparatus: Apparatus!): [Base!]!
daCriteria(apparatus: Apparatus!, baseId: ID): [DACriteria!]!
rCriteria(apparatus: Apparatus, type: RCriteriaType): [RCriteria!]!
rCriterion(id: ID!): RCriteria
rotations(group: String): [Rotation!]!
rotation(id: ID!): Rotation
artistryComponents(type: ArtistryType): [ArtistryComponent!]!
artistryComponent(id: ID!): ArtistryComponent
```

### Routines (authenticated, coach-scoped)

```graphql
routines: [Routine!]!
routine(id: ID!): Routine
```

`routine` returns `null` if not found or not owned by the authenticated coach.

---

## Mutations

### Auth (public)

```graphql
signUp(input: SignUpInput!): AuthPayload!
login(input: LoginInput!): AuthPayload!
forgotPassword(email: String!): MessagePayload!
resetPassword(input: ResetPasswordInput!): MessagePayload!
```

```graphql
input SignUpInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String!
  club: String
}

input LoginInput {
  email: String!
  password: String!
}

input ResetPasswordInput {
  token: String!
  password: String!
}

type MessagePayload {
  message: String!
}
```

### Profile (authenticated)

```graphql
updateProfile(input: UpdateProfileInput!): Coach!
changePassword(currentPassword: String!, newPassword: String!): MessagePayload!
```

### Routines (authenticated, coach-scoped)

```graphql
createRoutine(input: CreateRoutineInput!): Routine!

updateRoutine(id: ID!, input: UpdateRoutineInput!): Routine!

deleteRoutine(id: ID!): MessagePayload!

addRoutineItem(routineId: ID!, input: AddRoutineItemInput!, insertIndex: Int): Routine!

removeRoutineItem(routineId: ID!, itemId: ID!): Routine!

reorderRoutineItems(routineId: ID!, itemIds: [ID!]!): Routine!

updateRoutineItem(routineId: ID!, itemId: ID!, input: UpdateRoutineItemInput!): Routine!
```

```graphql
input CreateRoutineInput {
  gymnastName: String!
  apparatus: Apparatus!
  ageCategory: AgeCategory!
}

input UpdateRoutineInput {
  gymnastName: String
  apparatus: Apparatus
  ageCategory: AgeCategory
}

input AddRoutineItemInput {
  type: RoutineItemType!
  bodyElementId: ID
  risk: RiskInput
  mastery: MasteryInput
  artistryComponentId: ID
}

input RiskRotationInput {
  rotationId: ID!
  count: Int!
}

input RiskInput {
  criteriaIds: [ID!]!
  rotations: [RiskRotationInput!]!
}

input MasteryInput {
  baseIds: [ID!]!
  criteriaIds: [ID!]!
  rotationId: ID
}

input UpdateRoutineItemInput {
  bodyElementId: ID
  risk: RiskInput
  mastery: MasteryInput
  artistryComponentId: ID
}
```

`insertIndex` on `addRoutineItem` is optional (0-based). When omitted, the item is appended. Used when dragging from the inventory panel into a specific timeline position.

Risk and mastery inputs are validated server-side in `routineTimelineService` before save:

- **Risk** — minimum 2 rotations, apparatus-specific criteria, direct-catch mutual exclusion, throw-after-roll requires without-hands throw. Value = `0.20 + max(0, totalRotations − 2) × 0.10 + Σ criteria values`.
- **Mastery** — valid base/criteria combinations per CoP §5.1.3, apparatus eligibility, alternate-catch base exclusion. Value calculated from bases + criteria combo.

Every routine mutation recalculates `dbScore` and `daScore` before returning (via `scoringService`). Full CoP **validation** recalculation is M7 — `validation` remains placeholder until then.

### Scoring rules (M6)

**DB** — from `requirements.DB` for the routine's age category:

- Body elements: each distinct `bodyElementId` counted once; take the **highest values** up to `maxElements` (8 senior / 6 junior)
- Risks: take the **highest `risk.value`** entries up to `maxRisks` (4 senior / 3 junior)
- `dbScore` = sum of counted body values + counted risk values (rounded to 1 decimal)

**DA** — from `requirements.DA`:

- Masteries: take the **highest `mastery.value`** entries up to `maxMasteries` (15 senior / 12 junior)
- `daScore` = sum of counted mastery values (rounded to 1 decimal)

Implemented in `server/src/services/scoringService.ts` and `server/src/utils/scoring.ts`. Called from `routineTimelineService` on every timeline save.

---

## Current State vs Target

| Operation                                  | Status              |
| ------------------------------------------ | ------------------- |
| `health`                                   | ✅ Implemented      |
| `signUp` / `login` / `me`                  | ✅ Implemented      |
| `forgotPassword` / `resetPassword`         | ✅ Implemented      |
| `updateProfile` / `changePassword`           | ✅ Implemented      |
| `routines` / `routine`                     | ✅ Implemented (coach-scoped) |
| `createRoutine` / `deleteRoutine`          | ✅ Implemented (coach-scoped) |
| `bodyElements` / `bodyElement`             | ✅ Implemented (auth required) |
| `requirements`                             | ✅ Implemented      |
| `bases` / `base`                           | ✅ Implemented      |
| `rCriteria` / `rCriterion`                 | ✅ Implemented      |
| `rotations` / `rotation`                   | ✅ Implemented      |
| `artistryComponents` / `artistryComponent` | ✅ Implemented      |
| `daCriteria` / `daCriterion`               | ✅ Implemented      |
| `addRoutineItem` / `removeRoutineItem` / `reorderRoutineItems` / `updateRoutineItem` | ✅ Implemented (M5) |
| Scoring recalculation on timeline change   | ✅ Implemented (M6) |
| Live validation recalculation              | ❌ Not implemented (M7) |

---

## Client Integration

Apollo Client configuration:

```typescript
// client/src/apollo/client.ts
const httpLink = createHttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL });

const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

Environment variable: `VITE_GRAPHQL_URL` (see `client/.env.example`).

---

## Future Considerations

- **GraphQL Code Generator** — generate TypeScript types from schema once it stabilizes
- **Pagination** — add cursor-based pagination to `routines` and reference queries if lists grow large
- **Subscriptions** — not planned for v1; polling/refetch-on-mutation is sufficient for single-coach editing
