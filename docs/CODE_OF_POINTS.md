# ChoreoLab — Code of Points

Overview of the **FIG Code of Points** rules implemented in ChoreoLab.

Detailed catalogs and rules live in the domain docs — this file is the index.

---

## Score domains

| Domain               | Code | Description                   | Detail doc                                       |
| -------------------- | ---- | ----------------------------- | ------------------------------------------------ |
| Body Difficulty      | DB   | Body elements and risks       | [domains/DB.md](./domains/DB.md)                 |
| Apparatus Difficulty | DA   | Masteries (bases + criteria)  | [domains/DA.md](./domains/DA.md)                 |
| Artistry             | A    | Artistry components           | [domains/ARTISTRY.md](./domains/ARTISTRY.md)     |
| Validation           | —    | Cross-domain CoP requirements | [domains/VALIDATION.md](./domains/VALIDATION.md) |

---

## Dimensions

Rules vary by:

- **Apparatus** — hoop, ball, clubs, ribbon
- **Age category** — senior, junior

Each routine has exactly one apparatus and one age category.

---

## Routine timeline item types

| Type           | Source collection      | Contributes to               |
| -------------- | ---------------------- | ---------------------------- |
| `body_element` | `bodyelements`         | DB score                     |
| `risk`         | `rcriteria` + `rotations` (composed) | DB score + risk requirements |
| `mastery`      | `bases` + `dacriteria` | DA score                     |
| `artistry`     | `artistrycomponents`   | A validation (no score)      |

---

## Scoring summary

ChoreoLab calculates **numeric scores for DB and DA only**. Artistry (A) has no score — it is checked by the validation engine.

| Score  | Calculation                                                                     |
| ------ | ------------------------------------------------------------------------------- |
| **DB** | Sum of the **highest-valued** body elements (each id once) up to `maxElements`, plus the **highest-valued** risks up to `maxRisks`, for the routine's age category |
| **DA** | Sum of the **highest-valued** masteries up to `maxMasteries` for the age category |
| **A**  | No calculation — requirement counts validated against `requirements.A`          |

DB and DA are recalculated server-side on every routine change.

---

## Validation summary

The validation engine loads the `requirements` document for the routine's age category and evaluates the timeline in `validationService`, with Fouetté limits in `fouetteValidation.ts` and pivot rotation values in `pivotRotation.ts`.

See [domains/VALIDATION.md](./domains/VALIDATION.md) for rule types and catalogs. See [domains/DB.md](./domains/DB.md) for pivot rotation and Fouetté limits.

---

## Engine implementation

Both engines live in the service layer:

- `scoringService` — DB and DA calculation only
- `validationService` — CoP requirement checking (including artistry / A rules)

Rules are evaluated in `validationService` against the `requirements` collection (age-category limits) plus CoP logic in code handlers (`validation.ts`, `fouetteValidation.ts`, `pivotRotation.ts`).

---

## How to extend

1. Add or update the rule in the appropriate domain doc
2. Update [DATABASE.md](./DATABASE.md) if schema changes
3. Update [API.md](./API.md) if GraphQL changes
4. Add seed data in `server/seeds/data/` (Milestone 4+)
5. Implement or extend handler in `validationService` or `scoringService`

---

## Domain documentation

Detailed catalogs and rules live in [docs/domains/](./domains/). Phase 0 domain docs (DB, DA, Artistry, Validation) are complete.

Remaining **implementation** work (seed data, scoring/validation handlers, UI) is tracked in [ROADMAP.md](./ROADMAP.md) — not here.
