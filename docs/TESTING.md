# Testing

ChoreoLab uses **Vitest** for automated tests. CoP business logic is covered by fast unit tests with no database (Mongoose models are mocked where needed).

**M8 (complete)** delivers unit tests + CI. **M9 (complete)** adds React component tests and manual phone QA checklist. **M10** adds production deploy configs and [DEPLOYMENT.md](./DEPLOYMENT.md). **M11 (in progress)** adds MongoDB/GraphQL integration tests, index verification, error boundaries, auth rate limiting, and input validation.

## Commands

| Command | Scope |
| ------- | ----- |
| `npm test` (repo root) | Shared + server + client unit and integration tests |
| `npm run test:coverage` (repo root) | Server coverage — `server/src/utils/` and `server/src/services/` |
| `npm run test:watch` | Shared tests in watch mode (root script) |
| `npm test --prefix server` | Server only (includes `*.integration.test.ts` via MongoDB Memory Server) |

## Layout

| Location | What is tested |
| -------- | -------------- |
| `shared/src/cop/*.test.ts` | **Single source of truth** — scoring, risk/mastery rules, pivot rotation, formatCopValue |
| `server/src/utils/*.test.ts` | Validation, fouetté, JWT, auth helpers |
| `server/src/middleware/context.test.ts` | GraphQL context from Bearer JWT |
| `server/src/services/*.test.ts` | Scoring and validation services (mocked Mongoose) |
| `server/src/services/*.integration.test.ts` | Timeline mutations against MongoDB Memory Server |
| `server/src/graphql/integration.test.ts` | Auth and coach isolation via Apollo `executeOperation` |
| `server/src/models/indexes.integration.test.ts` | Routine list index and unique coach email |
| `client/src/utils/*.test.ts` | Login errors, pivot preview, re-export parity |
| `client/src/types/routineTimelineLabels.test.ts` | Timeline primary/meta label formatting |
| `client/src/components/**/*.test.tsx` | ScorePanel, TimelinePanel (M9) |
| `client/src/pages/LoginPage.test.tsx` | Auth error display (M9) |

## Manual phone QA (M9)

Run on a real iOS or Android device before production deploy:

1. **Login** — sign in; confirm no input zoom and fast redirect to Home
2. **Create routine** — new gymnast, apparatus, age category
3. **Routine builder (mobile tabs)** — Scores | Timeline | Inventory; add body element, risk, mastery, artistry via inventory buttons (not drag)
4. **Risk editor** — throw/catch criteria pickers readable; rotation selects without zoom clipping
5. **Reorder** — arrow buttons move timeline items; scores update
6. **Edit** — tap timeline item, edit in inventory, save
7. **Delete item** — remove from timeline
8. **My Routines** — open list, delete routine with confirmation dialog
9. **Profile** — update name/club; change password validation messages

Local URL: `http://192.168.68.118:5173` (same Wi‑Fi as dev machine).

## Shared package (`@choreolab/shared`)

Pure CoP logic lives in `shared/src/cop/` and is imported by both apps:

- `scoring.ts`, `formatCopValue.ts`, `pivotRotation.ts`, `riskValidation.ts`, `masteryRules.ts`

**Server** re-exports or thin-wraps (e.g. `validateRiskComposition` throws `UserInputError`).

**Client** re-exports; `pivotRotation.ts` adds a lenient `calculatePivotValue` for live preview while editing.

Build shared before server/client: `npm run build --prefix shared` (also runs on root `postinstall`).

## Client / server parity

Risk and mastery validation exist on **both** sides. Shared `getRiskCompositionError` / `getMasteryBaseCombinationError` return `string | null`. The server wrapper throws; the client uses the same messages inline in the UI.

Pivot rotation logic is shared; only the client preview softens invalid turn counts.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `master`:

1. `npm run lint`
2. `npm test`
3. `npm run build`

## Integration tests (M11)

Server integration tests connect to **`TEST_MONGODB_URI`**. CI uses a MongoDB 6 service container; locally, vitest `globalSetup` starts MongoDB Memory Server on first run (binary is cached afterward).

| File | Coverage |
| ---- | -------- |
| `routineTimelineService.integration.test.ts` | Add, reorder, remove timeline items; scores and validation recalc |
| `graphql/integration.test.ts` | UNAUTHENTICATED mutations, FORBIDDEN cross-coach access |
| `models/indexes.integration.test.ts` | `{ coach: 1, updatedAt: -1 }` index, unique `coaches.email` |

See [ROADMAP.md](./ROADMAP.md) milestones 8–11 for details.
