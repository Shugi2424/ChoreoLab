# DA — Apparatus Difficulty

FIG Rhythmic Gymnastics Code of Points **2025–2028**, individual exercises only.

> **Status:** DA bases and criteria seeded from CoP Tables #5.4.3, #5.8–5.11 (hoop, ball, clubs, ribbon). R criteria and rotations not yet seeded.

---

## Masteries (timeline item type)

A **Mastery** is not a reference collection — it is a composition saved inside a routine:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Generated when saved |
| `bases` | Base[] | 1 or 2 apparatus bases |
| `criteria` | DACriteria[] | 1 or 2 criteria |
| `apparatus` | enum | Routine apparatus |

### Valid combinations (CoP §5.1.3)

| Composition | Bases | Criteria | Constraint |
|-------------|-------|----------|------------|
| Standard | 1 | 2 | — |
| High-throw catch | 2 | 1 | One base must be *Catch from a High Throw* |

Validation rules:
1. All bases must belong to the routine's apparatus
2. Criteria must be eligible for their paired base(s) (`allowedCriteria` on Base)
3. If 2 bases: performed without interruption; one must be catch-from-high-throw

---

## Reference types

### Base (`bases`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique slug, e.g. `large-roll`, `catch-from-high-throw` |
| `name` | string | Generic CoP base name (apparatus-neutral where shared) |
| `value` | number | DA base value (0.20 – 0.40) |
| `apparatuses` | Apparatus[] | All apparatus where this base applies |
| `allowedCriteria` | string[] | DACriteria ids valid for this base (N/A columns excluded) |

**Seeded:** 34 bases (7 shared across apparatus, 27 apparatus-specific). Source: CoP Tables #5.8–5.11.

Bases with identical value and criteria are merged into one record with multiple `apparatuses`. Example: `large-roll` applies to hoop, ball, clubs, and ribbon.

### DACriteria (`dacriteria`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable slug |
| `name` | string | Official criterion name |

**Seeded:** 7 criteria (CoP Table #5.4.3 — valid for all apparatus):

| id | Name |
|----|------|
| `outside-visual-field` | Outside the visual field |
| `without-hands` | Without the help of the hands |
| `under-leg` | Under the leg/legs |
| `on-floor` | Position on the floor |
| `full-body-wave` | Full body wave |
| `with-db` | Difficulty of Body |
| `rotation` | Rotation |

Criteria marked **N/A** for a base in the CoP tables are omitted from that base's `allowedCriteria`.

---

## DA scoring

- When **1 base + 2 criteria**: DA value = base value
- When **catch from high throw + 2nd base + 1 criterion**: DA value = highest base value + 0.10

DA does **not** contribute to DB score — separate difficulty component.

---

## DA limits (from `requirements` collection)

| Rule | Senior | Junior |
|------|--------|--------|
| Max masteries (DA) counted | 15 | 12 |
| Max acrobatics (DA) | 3 | 3 |
| Min masteries | 0 (no CoP minimum) | 0 |

`maxAcrobatics` in the `requirements` collection enforces the CoP limit on acrobatic apparatus difficulty (max 3 consecutive DA on the floor). This is separate from max Risks — see [DB.md](./DB.md) for R limits.

Additional CoP rules (not yet in validation engine):
- Max 1 slow turn balance on relevé and max 1 on flat foot

---

## Risks vs DA

| | Risk (R) | Mastery (DA) |
|---|----------|--------------|
| Domain | Body difficulty (with rotation) | Apparatus difficulty |
| Components | High throw + rotations + catch | Base(s) + criteria |
| Max count | 4 senior / 3 junior | 15 senior / 12 junior |
| Contributes to | DB-side scoring (R value) | DA score |

---

## Next steps

- Seed R criteria and rotations (Risk domain)
- Implement mastery composition validation in `routineService`
