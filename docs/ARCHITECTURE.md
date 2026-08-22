# ChoreoLab — Architecture

## Design Principles

1. **Layered backend** — resolvers delegate; services own business logic
2. **Single source of truth** — reference data lives in MongoDB; scoring rules are data-driven where possible
3. **Real-time feedback** — routine changes trigger immediate recalculation on the server
4. **Coach isolation** — every coach accesses only their own routines and profile
5. **Incremental delivery** — each milestone is independently testable and deployable
6. **Shared CoP logic** — pure rules in `@choreolab/shared`; server and client import the same source
7. **No placeholder code** — every file shipped should be production-quality

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Client)                       │
│  React + TypeScript + MUI + React Router + Apollo Client    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / GraphQL
                           │ Authorization: Bearer <JWT>
┌──────────────────────────▼──────────────────────────────────┐
│                       Render (Server)                        │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   GraphQL   │───▶│  Resolvers  │───▶│  Services   │     │
│  │   Schema    │    │  (thin)     │    │  (logic)    │     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘     │
│                                                  │           │
│                           ┌──────────────────────┼───────┐   │
│                           │                      ▼       │   │
│                           │  ┌─────────────────────────┐ │   │
│                           │  │  Scoring Engine         │ │   │
│                           │  │  Validation Engine      │ │   │
│                           │  │  Auth Service           │ │   │
│                           │  └─────────────────────────┘ │   │
│                           │                      │       │   │
│                           │                      ▼       │   │
│                           │  ┌─────────────────────────┐ │   │
│                           │  │  Mongoose Models        │ │   │
│                           │  └─────────────────────────┘ │   │
└───────────────────────────┼──────────────────────┼───────┼───┘
                            │                      │       │
┌───────────────────────────▼──────────────────────▼───────▼───┐
│                     MongoDB Atlas                             │
│  Reference collections          User collections              │
└───────────────────────────────────────────────────────────────┘
```

## Backend Layers

### 1. GraphQL Schema (`server/src/schema/`)

- Defines types, inputs, queries, and mutations
- No business logic
- Uses enums and input types for validation at the API boundary
- Auth-required operations documented in [API.md](./API.md)

### 2. Resolvers (`server/src/resolvers/`)

Resolvers are **thin adapters**:

```typescript
// Pattern: resolver delegates to service
Query: {
  routine: (_parent, { id }, context) =>
    routineService.getById(id, context.coachId),
}
```

Responsibilities:

- Extract arguments and context
- Call the appropriate service method
- Map service results to GraphQL types
- Handle authorization checks via context (or delegate to auth middleware)

**Must not contain:** scoring logic, validation rules, complex DB queries, password hashing.

### 3. Services (`server/src/services/`)

All business logic lives here:

| Service                | Responsibility                                   |
| ---------------------- | ------------------------------------------------ |
| `authService`          | Sign up, login, JWT issue/verify, password reset |
| `coachService`         | Profile CRUD                                     |
| `routineService`       | Routine CRUD; refreshes scores/validation on list/get |
| `routineTimelineService` | Timeline add/remove/reorder/update, risk/mastery validation |
| `routineDerivedFields` | Shared score + validation recalculation        |
| `scoringService`       | DB and DA calculation (M6)                       |
| `validationService`    | CoP requirement checking (M7)                    |
| `referenceDataService` | Read-only access to all reference collections    |

Services may call other services (composition). They receive `coachId` from context for authorization.

### 4. Models (`server/src/models/`)

Mongoose schemas and models. One file per collection. Models define:

- Field types and constraints
- Indexes
- Virtuals and instance methods (minimal — prefer services)

### 5. Shared + supporting modules

```
shared/src/cop/       Pure CoP rules (@choreolab/shared) — scoring, risk, pivot, mastery
server/src/
├── schema/           GraphQL typeDefs (split by domain)
├── resolvers/        Thin resolver maps
├── services/         Business logic
├── models/           Mongoose schemas
├── middleware/       Auth context, error formatting
├── utils/            Mappers, server wrappers, fouetteValidation, validation orchestration
├── config/           Environment validation
├── seeds/            Reference data seed scripts
└── index.ts          Server bootstrap
```

Client `src/utils/` re-exports shared CoP modules; only pivot preview and UI-specific helpers stay client-local.

## GraphQL Context

Every authenticated request carries:

```typescript
interface GraphQLContext {
  coachId: string | null; // null for public operations
  coach: CoachDocument | null;
}
```

JWT is extracted from the `Authorization: Bearer <token>` header in middleware and attached to context before resolvers run.

## Frontend Architecture

```
client/src/
├── apollo/           Client, auth link, error link
├── theme/            MUI theme (pink/purple palette)
├── routes/           React Router route definitions
├── pages/            Top-level page components
├── components/       Reusable UI components
│   ├── layout/       App shell, nav, protected route
│   ├── routine/      Timeline, inventory panel, score panel (M5)
│   └── auth/         Login, signup, reset password forms
├── hooks/            Custom React hooks
├── graphql/          Queries, mutations, fragments
├── types/            Shared TypeScript interfaces
└── utils/            Formatting, risk/mastery validation helpers (M5)
```

### State Management

- **Server state:** Apollo Client cache (routines, reference data, profile)
- **UI state:** React local state and context (builder selection, panel visibility)
- **Auth state:** JWT stored in memory + `localStorage`; Apollo auth link attaches token

No Redux unless complexity demands it later.

## Scoring & Validation Flow

When a routine changes (add, remove, reorder item) or is loaded (`routines` / `routine`):

```
Client mutation or query ──▶ routineTimelineService / routineService
                        │
                        ├──▶ routineDerivedFields.applyDerivedRoutineFields()
                        │         ├──▶ scoringService (DB + DA)
                        │         └──▶ validationService (requirements + fouetteValidation)
                        │
                        ▼
                   Save updated scores + validation result
                        │
                        ▼
                   Return full Routine to client
```

The client re-renders score panel and validation panel from the mutation response. No separate "recalculate" call needed.

## Authentication Flow

```
Sign Up ──▶ authService.register() ──▶ hash password ──▶ save Coach ──▶ return JWT

Login ──▶ authService.login() ──▶ verify password ──▶ return JWT

Protected query ──▶ middleware extracts JWT ──▶ verify ──▶ attach coachId to context
                                                      │
                                              invalid ──▶ GraphQL auth error

Forgot password ──▶ authService.requestReset() ──▶ Resend email with token
Reset password  ──▶ authService.resetPassword() ──▶ verify token ──▶ update hash
```

## Deployment Architecture

| Component | Platform      | Notes                                                              |
| --------- | ------------- | ------------------------------------------------------------------ |
| Client    | Vercel        | Static build from `client/`; env `VITE_GRAPHQL_URL`                |
| Server    | Render        | Web service; env: MongoDB, JWT secret, Resend API key, CORS origin |
| Database  | MongoDB Atlas | Production cluster; IP allowlist for Render                        |

CORS on the server must allow the Vercel domain in production.

## Existing Code — Migration Notes

Completed through Milestone 7:

- `BodyElement` model replaces the legacy `Element` scaffold
- `bodyelements` collection seeded; legacy `elements` collection removed
- Layered services (`authService`, `routineService`, `routineTimelineService`, `referenceDataService`, `routineDerivedFields`)
- GraphQL schema split by domain; auth context on all protected operations
- Routine Builder UI with inventory panel, timeline drag-and-drop (insert-at-position for body/artistry; pivot rotation dialog on drag), and composition validation
- `scoringService` — DB/DA recalculation on every timeline change (M6); pivot rotation values via `pivotRotation.ts`
- `validationService` — CoP requirement checking (M7), Fouetté limits (`fouetteValidation.ts`), capacity warnings; refreshed on routine load

Remaining:

- Automated test suite (M8)
- UI polish pass (M9)

See [ROADMAP.md](./ROADMAP.md) for the full milestone plan.

## Confirmed Decisions

| Decision                    | Choice                                                         |
| --------------------------- | -------------------------------------------------------------- |
| Git default branch          | `master`                                                       |
| Email provider              | **Resend**                                                     |
| Apollo Server hosting       | **Express** (health check, CORS, graceful shutdown for Render) |
| GraphQL schema organization | Split by domain once auth lands                                |
| Client code generation      | GraphQL Codegen once schema stabilizes (Milestone 4+)          |

Ask before changing any of these during implementation.
