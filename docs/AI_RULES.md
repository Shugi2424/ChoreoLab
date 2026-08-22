# ChoreoLab — AI Development Rules

Rules for AI assistants (Cursor, Copilot, etc.) working on this codebase.

---

## Before Writing Code

1. **Read the docs** — especially [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE.md](./DATABASE.md), [API.md](./API.md), and [ROADMAP.md](./ROADMAP.md)
2. **Check the current milestone** in [ROADMAP.md](./ROADMAP.md) — only implement what belongs to the active milestone
3. **Inspect existing code** — understand patterns before adding new files
4. **Explain the plan** — list files to create/modify and why, before implementing
5. **Ask before architectural changes** — do not restructure without confirmation

---

## Code Standards

### TypeScript

- Use TypeScript everywhere — no `.js` files in `src/`
- Strict mode enabled — no `any` unless absolutely necessary with a comment explaining why
- Prefer interfaces for object shapes, types for unions/intersections
- Use explicit return types on service functions

### Backend

- **No business logic in resolvers** — resolvers call services; services contain logic
- **Use Mongoose models** — one model file per collection in `server/src/models/`
- **Use async/await** — no raw Promise chains
- **Services are classes or plain objects** — consistent within the project, prefer plain exported functions initially
- **Validate inputs** at the service layer, not in resolvers
- **Authorization in services** — every service method that accesses coach data receives and checks `coachId`
- **Never expose password hashes** in GraphQL responses

### Frontend

- **Functional React components** only — no class components
- **Material UI** for all UI components — no raw HTML/CSS for interactive elements
- **Colocate GraphQL operations** in `client/src/graphql/`
- **Page components** in `client/src/pages/` — one file per route
- **Reusable components** in `client/src/components/`
- **Custom hooks** in `client/src/hooks/` for shared logic
- **No inline GraphQL strings in components** — import from `graphql/`

### General

- **Don't duplicate logic** — extract shared code into utils or services
- **Keep commits small** — one logical change per commit
- **No placeholder code** — no `TODO: implement later`, no empty functions, no `console.log` left in production code
- **No commented-out code** in commits
- **Match existing conventions** — naming, folder structure, import style

---

## File Naming

| Type        | Convention                  | Example               |
| ----------- | --------------------------- | --------------------- |
| Model       | PascalCase                  | `BodyElement.ts`      |
| Service     | camelCase                   | `routineService.ts`   |
| Resolver    | camelCase                   | `routineResolvers.ts` |
| Page        | PascalCase                  | `DashboardPage.tsx`   |
| Component   | PascalCase                  | `TimelinePanel.tsx`   |
| Hook        | camelCase with `use` prefix | `useAuth.ts`          |
| GraphQL ops | camelCase                   | `routineQueries.ts`   |
| Util        | camelCase                   | `formatScore.ts`      |

---

## GraphQL Rules

- Schema changes must be reflected in [API.md](./API.md)
- New mutations that modify routines must trigger score recalculation and validation
- All coach-scoped operations must verify ownership in the service layer
- Use input types for mutation arguments — no loose argument lists

---

## Database Rules

- Schema changes must be reflected in [DATABASE.md](./DATABASE.md)
- Reference data uses `code` as unique identifier — seed scripts upsert by code
- Never hard-delete reference data — use `active: false`
- Embedded documents (RoutineItem, ValidationResult) follow schemas in DATABASE.md
- Add indexes for any field used in queries

---

## Testing Expectations

**No task is complete until `npm test` and `npm run build` pass from the repo root.**

After every code change that affects behavior:

- Update or add Vitest tests in the same turn — do not leave suites stale or failing.
- **Shared CoP logic** → `shared/src/cop/*.test.ts`
- **Server-only** (Mongoose, throws, fouetté/validation orchestration) → `server/src/**/*.test.ts`
- **Client-only** (UI helpers, preview wrappers) → `client/src/**/*.test.ts`

Commands (see [TESTING.md](./TESTING.md)):

| Command | Purpose |
| ------- | ------- |
| `npm test` | All unit tests (shared + server + client) |
| `npm run build` | Full compile (shared → server → client) |
| `npm run test:coverage --prefix shared` | Coverage for shared + server utils/services |

Milestone acceptance criteria in [ROADMAP.md](./ROADMAP.md) still apply; automated tests are required for regressions in scoring, validation, and composition rules.

---

## Documentation Rules

- Update docs when changing architecture, schema, API, or domain rules
- [CODE_OF_POINTS.md](./docs/CODE_OF_POINTS.md) is the overview — detailed rules live in [docs/domains/](./docs/domains/)
- Mark new sections with `[TBD]` until filled in with the product owner

---

## What NOT to Do

- Do not recreate infrastructure that already exists (Apollo, Mongoose, Atlas connection)
- Do not add libraries without explaining why and asking if significant
- Do not implement features from future milestones
- Do not commit `.env` files or secrets
- Do not use Redux, MobX, or other state managers unless discussed
- Do not generate large seed datasets without product owner input
- Do not skip the service layer "just for now"

---

## Commit Message Format

```
<type>: <short description>

<optional body explaining why>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`

Examples:

- `feat: add JWT authentication with sign up and login`
- `refactor: extract element queries into elementService`
- `docs: add body element catalog to CODE_OF_POINTS`

---

## Getting Context

When starting a new session, read these files in order:

1. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
2. [README.md](./README.md) — docs index and current phase
3. [ROADMAP.md](./ROADMAP.md) — find current milestone
4. [ARCHITECTURE.md](./ARCHITECTURE.md)
5. Relevant domain doc in [domains/](./domains/) if working on scoring/validation
6. Relevant technical doc (DATABASE, API, or UI_UX)
7. Existing code in the area being modified
