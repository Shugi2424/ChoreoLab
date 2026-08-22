# Testing

ChoreoLab uses **Vitest** for automated tests. CoP business logic is covered by fast unit tests with no database (Mongoose models are mocked where needed).

**M8 (complete)** delivers unit tests + CI. **M9** adds React component tests during UI polish. **M11** adds MongoDB integration and optional E2E after deployment.

## Commands

| Command | Scope |
| ------- | ----- |
| `npm test` (repo root) | Shared + server + client unit tests |
| `npm run test:coverage` (repo root) | Server coverage — `server/src/utils/` and `server/src/services/` |
| `npm run test:watch` | Shared tests in watch mode (root script) |

## Layout

| Location | What is tested |
| -------- | -------------- |
| `shared/src/cop/*.test.ts` | **Single source of truth** — scoring, risk/mastery rules, pivot rotation, formatCopValue |
| `server/src/utils/*.test.ts` | Validation, fouetté, JWT, auth helpers |
| `server/src/middleware/context.test.ts` | GraphQL context from Bearer JWT |
| `server/src/services/*.test.ts` | Scoring and validation services (mocked Mongoose) |
| `client/src/utils/*.test.ts` | Login errors, pivot preview, re-export parity |

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

## Planned (not in M8)

| Type | Milestone | Notes |
| ---- | --------- | ----- |
| React component tests (`@testing-library/react`) | M9 | ScorePanel, TimelinePanel, auth error display |
| MongoDB integration tests | M11 | `routineTimelineService`, JWT-protected GraphQL |
| E2E browser tests | M11 | Optional after deploy if manual QA is insufficient |
| Post-deploy smoke checklist | M10 | Manual verification on production URLs |

See [ROADMAP.md](./ROADMAP.md) milestones 8–11 for details.
