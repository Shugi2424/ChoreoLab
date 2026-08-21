# ChoreoLab Documentation

This folder is the **source of truth** for the project. Read these docs before implementing features.

## Document Index

| Document                                     | Purpose                                  | Status                              |
| -------------------------------------------- | ---------------------------------------- | ----------------------------------- |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Purpose, audience, user flow, tech stack | Stable                              |
| [ARCHITECTURE.md](./ARCHITECTURE.md)         | System design, layers, deployment        | Stable                              |
| [DATABASE.md](./DATABASE.md)                 | Collections, schemas, relationships      | Stable (refine as domain docs grow) |
| [API.md](./API.md)                           | GraphQL schema and operations            | Stable (implement incrementally)    |
| [CODE_OF_POINTS.md](./CODE_OF_POINTS.md)     | CoP overview and index                   | Stable                              |
| [UI_UX.md](./UI_UX.md)                       | Design system, layouts, components       | Stable                              |
| [ROADMAP.md](./ROADMAP.md)                   | Milestone plan                           | Stable                              |
| [AI_RULES.md](./AI_RULES.md)                 | Development standards                    | Stable                              |

### Domain docs (collaborative — fill in together)

These hold the detailed CoP data that drives seed files and validation rules.

| Document                                         | Purpose                                              | Status                       |
| ------------------------------------------------ | ---------------------------------------------------- | ---------------------------- |
| [domains/DB.md](./domains/DB.md)                 | Body elements, risks, categories, DB rules           | **Complete** |
| [domains/DA.md](./domains/DA.md)                 | Masteries, bases, DA criteria, rotations             | **Complete** |
| [domains/ARTISTRY.md](./domains/ARTISTRY.md)     | Artistry components and requirements                 | **Complete** |
| [domains/VALIDATION.md](./domains/VALIDATION.md) | CoP requirement rules per apparatus/age              | **Complete** |

---

## How we edit documentation

1. **Domain rules** go in `docs/domains/` — you provide the gymnastics knowledge, we structure it
2. **Technical docs** (`ARCHITECTURE`, `DATABASE`, `API`) are updated when the domain docs change
3. **Seed data** (`server/seeds/data/`) is derived from domain docs during Milestone 4 — not before
4. Mark incomplete sections with `[TBD]` and a short note about what's needed
5. Never invent difficulty values or CoP rules — ask or leave `[TBD]`

---

## Confirmed decisions

| Decision                        | Choice        |
| ------------------------------- | ------------- |
| Git default branch              | `master`      |
| Email provider (password reset) | **Resend**    |
| Database                        | MongoDB Atlas |
| Frontend deployment             | Vercel        |
| Backend deployment              | Render        |
| UI library                      | Material UI   |
| Auth                            | JWT + bcrypt  |

---

## Entity quick reference

| Entity            | Collection             | Type      | Description                                  |
| ----------------- | ---------------------- | --------- | -------------------------------------------- |
| Coach             | `coaches`              | User      | Account and profile                          |
| Routine           | `routines`             | User      | Coach-owned routine with timeline and scores |
| RoutineItem       | embedded in `routines` | User      | One item in the timeline                     |
| BodyElement       | `bodyelements`         | Reference | Body difficulty element                      |
| Risk              | composed in timeline | Reference | Risk composition (rcriteria + rotations)       |
| Base              | `bases`                | Reference | DA mastery base                              |
| DACriteria        | `dacriteria`           | Reference | DA criterion                                 |
| RCriteria         | `rcriteria`            | Reference | Risk criteria (throw / catch / general)      |
| Rotation          | `rotations`            | Reference | Rotation groups (v1–v3, acro-1…13)           |
| ArtistryComponent | `artistrycomponents`   | Reference | Artistry component                           |
| Requirement       | `requirements`         | Reference | Age-category DB/DA/A limits                  |

**Risk** and **Mastery** are not collections — they are compositions embedded in a `RoutineItem`.

---

## Current phase

**Milestone 6 complete** — live DB/DA scoring on every timeline change.

Next: **Milestone 7 — Validation Engine** ([ROADMAP.md](./ROADMAP.md)).

### Local dev shortcuts (Windows)

Double-click in Explorer:

- [`scripts/run-dev.cmd`](../scripts/run-dev.cmd) — start server + client in two windows
- [`scripts/stop-dev.cmd`](../scripts/stop-dev.cmd) — stop processes on ports 4000 and 5173
