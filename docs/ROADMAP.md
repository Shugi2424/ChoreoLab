# ChoreoLab — Roadmap

Each milestone is **independently testable** and should be completed before moving to the next. Do not skip milestones.

---

## Phase 0 — Documentation (current)

**Goal:** Finalize domain documentation collaboratively before writing feature code.

### Domain docs (with product owner)
- [ ] [domains/DB.md](./domains/DB.md) — body elements, risks, categories
- [ ] [domains/DA.md](./domains/DA.md) — bases, criteria, rotations, R criteria
- [ ] [domains/ARTISTRY.md](./domains/ARTISTRY.md) — artistry components
- [ ] [domains/VALIDATION.md](./domains/VALIDATION.md) — validation rule catalog

### Technical docs (aligned with domain docs)
- [x] Project structure and architecture docs
- [x] Entity model aligned with spec (Risk as separate collection)
- [x] Confirmed decisions recorded (Resend, master, deployment targets)
- [ ] Review and sign-off from product owner

**Test:** Domain docs have no unresolved `[TBD]` items needed for Milestone 4+ OR product owner explicitly defers them.

---

## Milestone 0 — Foundation & Code Quality

**Goal:** Restructure the existing scaffold to match the target architecture. No new features.

### Server
- [ ] Create `server/src/services/` directory structure
- [ ] Extract logic from resolvers into services (start with `bodyElementService`)
- [x] Rename `Element` model → `BodyElement` (model, schema, resolvers); legacy `elements` collection removed
- [ ] Add GraphQL context interface (prepare for auth)
- [ ] Split schema into `server/src/schema/` modules
- [ ] Add `server/src/config/` for environment validation
- [ ] Migrate from Apollo standalone to Express + Apollo (CORS, health endpoint, graceful shutdown)
- [ ] Add `client/.env.example`

### Client
- [ ] Install MUI, React Router, Emotion
- [ ] Create MUI theme (`client/src/theme/theme.ts`)
- [ ] Set up React Router with placeholder routes
- [ ] Reorganize folder structure (`pages/`, `components/`, `graphql/`)
- [ ] Move queries out of `apollo/client.ts` into `graphql/`

### Tooling
- [ ] Add ESLint + Prettier (root or per-package)
- [ ] Add `client/.env.example` and document env vars

**Test:** Server starts, health query works, client renders routed placeholder pages with MUI theme applied.

---

## Milestone 1 — Authentication

**Goal:** Coaches can sign up, log in, and access protected routes.

### Server
- [ ] `Coach` Mongoose model
- [ ] `authService` — register, login, JWT issue/verify, password hashing (bcrypt)
- [ ] Auth middleware — extract JWT, attach `coachId` to context
- [ ] GraphQL mutations: `signUp`, `login`
- [ ] GraphQL query: `me`
- [ ] Protected operation enforcement

### Client
- [ ] Auth context / token storage
- [ ] Apollo auth link
- [ ] Login page
- [ ] Sign up page
- [ ] Protected route wrapper
- [ ] Redirect unauthenticated users to login

**Test:** Sign up → login → `me` query returns coach → unauthenticated requests to protected ops fail.

---

## Milestone 2 — Password Reset & Profile

**Goal:** Coaches can reset passwords and manage their profile.

### Server
- [ ] `forgotPassword` / `resetPassword` mutations
- [ ] Email integration (**Resend**)
- [ ] `updateProfile` / `changePassword` mutations
- [ ] `coachService`

### Client
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Profile page (edit name, club, change password)

**Test:** Request reset → receive email → reset password → login with new password → edit profile.

---

## Milestone 3 — Dashboard & Routine CRUD

**Goal:** Coaches can create, list, open, and delete routines.

### Server
- [ ] `Routine` Mongoose model (without timeline items initially)
- [ ] `routineService` — create, list, get, delete (coach-scoped)
- [ ] GraphQL: `createRoutine`, `routines`, `routine`, `deleteRoutine`
- [ ] Initial scores (0) and empty validation on create

### Client
- [ ] Dashboard page (Create Routine, My Routines, Profile cards)
- [ ] Create Routine form (gymnast name, apparatus, age category)
- [ ] My Routines list page
- [ ] Delete routine with confirmation
- [ ] Navigation between pages

**Test:** Create routine → appears in My Routines → open → delete → gone from list.

---

## Milestone 4 — Reference Data & Seeding

**Goal:** Body elements, bases, criteria, and CoP requirements exist in the database.

### Server
- [x] `BodyElement` model and seed (163 elements)
- [x] `Requirement` model and seed (senior + junior)
- [x] `Base` and `DACriteria` models and seed (34 bases, 7 criteria)
- [ ] Remaining reference models (`RCriteria`, `Rotation`, `ArtistryComponent`, `CoPRequirement`)
- [ ] `referenceDataService`

### Documentation
- [ ] Domain docs populated (see Phase 0)
- [ ] Seed JSON files derived from domain docs

**Test:** Run seed → query reference data via GraphQL → data matches seed files.

---

## Milestone 5 — Routine Builder (Timeline)

**Goal:** Coaches can build a routine timeline with all item types.

### Server
- [ ] `RoutineItem` embedded schema with all types
- [ ] `addRoutineItem`, `removeRoutineItem`, `reorderRoutineItems`, `updateRoutineItem` mutations
- [ ] Mastery composition validation (combination rules)

### Client
- [ ] Routine Builder page (three-panel layout)
- [ ] Timeline panel — list, select, reorder, remove
- [ ] Editing panel — forms per item type with reference data dropdowns
- [ ] Add item flow for all four types

**Test:** Create routine → add body element, risk, mastery, artistry → reorder → remove → timeline persists on reload.

---

## Milestone 6 — Scoring Engine

**Goal:** DB and DA scores calculate automatically on every routine change.

### Server
- [ ] `scoringService` — `calculateDB`, `calculateDA`
- [ ] Integrate into routine mutations (recalculate on every change)
- [ ] Persist scores on routine document

### Client
- [ ] Score panel displays live DB and DA values
- [ ] Updates immediately after any timeline mutation

**Test:** Add elements with known values → DB score matches expected sum. Add masteries → DA score matches expected sum.

---

## Milestone 7 — Validation Engine

**Goal:** Code of Points requirements are checked and displayed in real time.

### Server
- [ ] `validationService` — rule handlers for each `ruleType`
- [ ] Integrate into routine mutations alongside scoring
- [ ] Populate `coprequirements` seed data (with product owner)

### Client
- [ ] Validation panel — green checks, red errors, grouped by domain
- [ ] Updates immediately after any timeline mutation

**Test:** Build routine missing a required element → validation shows specific missing requirement. Add it → validation passes.

---

## Milestone 8 — Deployment

**Goal:** Application accessible on the internet.

### Server (Render)
- [ ] Production build script
- [ ] Environment variables configured (MongoDB, JWT secret, email, CORS origin)
- [ ] Health check endpoint
- [ ] Graceful shutdown

### Client (Vercel)
- [ ] Production build
- [ ] `VITE_GRAPHQL_URL` pointing to Render backend
- [ ] Custom domain (optional)

### Database (Atlas)
- [ ] Production cluster or dedicated database
- [ ] IP allowlist for Render
- [ ] Run seed on production

**Test:** Access app via Vercel URL → sign up → create routine → scores and validation work.

---

## Milestone 9 — Polish & Hardening

**Goal:** Production-quality finishing touches.

- [ ] Error boundaries on client
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all mutations
- [ ] Loading states and empty states on all pages
- [ ] Mobile responsive testing
- [ ] Security review (JWT expiry, password strength, CORS)
- [ ] Performance: indexes verified, query optimization

**Test:** Full user flow on mobile and desktop without errors.

---

## Timeline Estimate

| Milestone | Estimated effort |
|-----------|-----------------|
| 0 — Foundation | 1–2 days |
| 1 — Authentication | 2–3 days |
| 2 — Password Reset & Profile | 1–2 days |
| 3 — Dashboard & Routine CRUD | 2–3 days |
| 4 — Reference Data & Seeding | 2–3 days (depends on CoP data input) |
| 5 — Routine Builder | 3–5 days |
| 6 — Scoring Engine | 2–3 days |
| 7 — Validation Engine | 3–5 days (depends on CoP rules input) |
| 8 — Deployment | 1–2 days |
| 9 — Polish | 2–3 days |

**Total estimate:** 8–12 weeks at a steady pace, depending on CoP data availability.

---

## Dependency Graph

```
Phase 0 Documentation (current)
  └── M0 Foundation
        └── M1 Auth
              └── M2 Password Reset & Profile
                    └── M3 Dashboard & Routine CRUD
                          └── M4 Reference Data
                                └── M5 Routine Builder
                                      ├── M6 Scoring Engine
                                      └── M7 Validation Engine
                                            └── M8 Deployment
                                                  └── M9 Polish
```

M6 and M7 can be developed in parallel after M5.

---

## Next Step

**Documentation phase in progress** — fill domain docs in `docs/domains/` together.

Milestone 0 (code foundation) begins after documentation sign-off or explicit deferral of TBD items.
