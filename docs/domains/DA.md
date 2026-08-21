# DA — Apparatus Difficulty

FIG Rhythmic Gymnastics Code of Points **2025–2028**, individual exercises only.

> **Status:** DA bases and criteria seeded from CoP Tables #5.4.3, #5.8–5.11 (hoop, ball, clubs, ribbon).

---

## Masteries (timeline item type)

A **Mastery** is not a reference collection — it is a composition saved inside a routine:

| Field       | Type       | Description                                                    |
| ----------- | ---------- | -------------------------------------------------------------- |
| `id`        | string     | Generated when saved                                         |
| `bases`     | Base[]     | 1 or 2 apparatus bases                                       |
| `criteria`  | DACriteria[] | 1 or 2 criteria                                            |
| `rotation`  | Rotation   | Optional — one rotation from the `rotations` collection        |
| `apparatus` | enum       | Routine apparatus                                              |
| `isAcro`    | boolean    | Calculated: `true` if `rotation.group` starts with `acro-`     |
| `value`     | number     | Calculated from bases + criteria combo (typically 0.20 – 0.50) |

### Valid combinations (CoP §5.1.3)

| Composition      | Bases | Criteria | Constraint                                 |
| ---------------- | ----- | -------- | ------------------------------------------ |
| Standard         | 1     | 2        | —                                          |
| High-throw catch | 2     | 1        | One base must be _Catch from a High Throw_ |

Validation rules:

1. All bases must belong to the routine's apparatus
2. Criteria must be eligible for their paired base(s) (`allowedCriteria` on Base)
3. If 2 bases: one must be catch-from-high-throw
4. Alternate catch bases (`catch-one-hand-high-throw`, `catch-one-club-held`, `simultaneous-catch-2-unlocked`) cannot combine with `catch-from-high-throw` in the same mastery

---

## Reference types

### Base (`bases`)

| Field             | Type        | Description                                               |
| ----------------- | ----------- | --------------------------------------------------------- |
| `id`              | string      | Unique slug, e.g. `large-roll`, `catch-from-high-throw`   |
| `name`            | string      | Generic CoP base name (apparatus-neutral where shared)    |
| `value`           | number      | DA base value (0.20 – 0.40)                               |
| `apparatuses`     | Apparatus[] | All apparatus where this base applies                     |
| `allowedCriteria` | string[]    | DACriteria ids valid for this base (N/A columns excluded) |

**Seeded:** 34 bases (7 shared across apparatus, 27 apparatus-specific). Source: CoP Tables #5.8–5.11.

Bases with identical value and criteria are merged into one record with multiple `apparatuses`. Example: `large-roll` applies to hoop, ball, clubs, and ribbon.

### DACriteria (`dacriteria`)

| Field  | Type   | Description             |
| ------ | ------ | ----------------------- |
| `id`   | string | Stable slug             |
| `name` | string | Official criterion name |

**Seeded:** 7 criteria (CoP Table #5.4.3 — valid for all apparatus):

| id                     | Name                          |
| ---------------------- | ----------------------------- |
| `outside-visual-field` | Outside the visual field      |
| `without-hands`        | Without the help of the hands |
| `under-leg`            | Under the leg/legs            |
| `on-floor`             | Position on the floor         |
| `full-body-wave`       | Full body wave                |
| `with-db`              | Difficulty of Body            |
| `rotation`             | Rotation                      |

Criteria marked **N/A** for a base in the CoP tables are omitted from that base's `allowedCriteria`.

### Rotation (`rotations`)

Same reference collection as Risks — see [DB.md](./DB.md). A mastery may include at most one rotation from this collection.

---

## DA scoring

- When **1 base + 2 criteria**: DA value = base value
- When **catch from high throw + 2nd base + 1 criterion**: DA value = highest base value + 0.10

DA does **not** contribute to DB score — separate difficulty component.

**Routine DA score (M6):** only the **highest-valued** masteries up to the age-category `maxMasteries` are summed into `daScore` (15 senior / 12 junior).

---

## DA limits (from `requirements` collection)

| Rule                       | Senior | Junior |
| -------------------------- | ------ | ------ |
| Min masteries              | 0      | 0      |
| Max masteries (DA) counted | 15     | 12     |
| Max acrobatics (DA)        | 3      | 3      |

`maxAcrobatics` enforces the CoP limit on acrobatic apparatus difficulty (max 3 consecutive DA on the floor).

---

## Implementation

Mastery composition validation is implemented in:

- `server/src/utils/masteryValidation.ts` — server-side enforcement on save
- `client/src/utils/masteryValidation.ts` — live UI feedback in the inventory panel

Value calculation: 1 base + 2 criteria → base value; catch-from-high-throw + 2nd base + 1 criterion → highest base + 0.10.
