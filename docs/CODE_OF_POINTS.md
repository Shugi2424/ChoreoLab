# ChoreoLab — Code of Points

Overview of the **FIG Code of Points** rules implemented in ChoreoLab.

Detailed catalogs and rules live in the domain docs — this file is the index.

---

## Score domains

| Domain | Code | Description | Detail doc |
|--------|------|-------------|------------|
| Body Difficulty | DB | Body elements and risks | [domains/DB.md](./domains/DB.md) |
| Apparatus Difficulty | DA | Masteries (bases + criteria) | [domains/DA.md](./domains/DA.md) |
| Artistry | — | Artistry components | [domains/ARTISTRY.md](./domains/ARTISTRY.md) |
| Validation | — | Cross-domain CoP requirements | [domains/VALIDATION.md](./domains/VALIDATION.md) |

---

## Dimensions

Rules vary by:

- **Apparatus** — hoop, ball, clubs, ribbon, rope
- **Age category** — senior, junior `[TBD: additional categories]`

Each routine has exactly one apparatus and one age category.

---

## Routine timeline item types

| Type | Source collection | Contributes to |
|------|-------------------|----------------|
| `body_element` | `bodyelements` | DB score |
| `risk` | `risks` | DB score + risk requirements |
| `mastery` | `bases` + `dacriteria` | DA score |
| `artistry` | `artistrycomponents` | Artistry validation |

---

## Scoring summary

| Score | Calculation |
|-------|-------------|
| **DB** | Sum of `BodyElement.value` + `Risk.value` for all timeline items of those types |
| **DA** | Sum of `DACriteria.value` across all mastery items |
| **Artistry** | `[TBD — see domains/ARTISTRY.md]` |

Scores are recalculated server-side on every routine change.

---

## Validation summary

The validation engine loads active rules from `coprequirements` filtered by apparatus and age category, then evaluates each rule against the routine timeline.

See [domains/VALIDATION.md](./domains/VALIDATION.md) for rule types and catalogs.

---

## Engine implementation

Both engines live in the service layer:

- `scoringService` — DB and DA calculation
- `validationService` — CoP requirement checking

Rules are **data-driven** where possible (stored in `coprequirements`), not hardcoded.

---

## How to extend

1. Add or update the rule in the appropriate domain doc
2. Update [DATABASE.md](./DATABASE.md) if schema changes
3. Update [API.md](./API.md) if GraphQL changes
4. Add seed data in `server/seeds/data/` (Milestone 4+)
5. Implement or extend handler in `validationService` or `scoringService`

---

## Open questions

Track these in domain docs as we fill them in together:

- [ ] Body element catalog per apparatus → [domains/DB.md](./domains/DB.md)
- [ ] Risk catalog per apparatus → [domains/DB.md](./domains/DB.md)
- [ ] Base and DA criteria catalogs → [domains/DA.md](./domains/DA.md)
- [ ] Rotation limits and R criteria → [domains/DA.md](./domains/DA.md)
- [ ] Artistry requirements → [domains/ARTISTRY.md](./domains/ARTISTRY.md)
- [ ] Full validation rule set → [domains/VALIDATION.md](./domains/VALIDATION.md)
