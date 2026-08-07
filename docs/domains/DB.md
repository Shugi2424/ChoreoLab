# DB — Body Difficulty

FIG Rhythmic Gymnastics Code of Points **2025–2028**, individual exercises only.

> **Status:** Body element catalog seeded (163 elements). Source: [FIG Body Difficulties Brochure](https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20RG%20Code%20of%20Points%202025-2028%20-%20Brochure%20of%20all%20current%20Body%20Difficulties.pdf).

---

## Categories

ChoreoLab uses three body element categories (maps to CoP Tables #9, #11, #13):

| Category | CoP table | Code prefix |
|----------|-----------|-------------|
| `jump` | Table #9 — Jumps/Leaps | `1.xxx` |
| `balance` | Table #11 — Balances | `2.xxx` |
| `pivot` | Table #13 — Rotations (pivots) | `3.xxx` |

---

## BodyElement (reference collection: `bodyelements`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | CoP code, e.g. `1.101`, `2.305`, `3.505` |
| `name` | string | Official element name |
| `category` | enum | `jump` \| `balance` \| `pivot` |
| `value` | number | DB value (0.1 – 0.8) |

**Seeded:** 163 elements (80 jumps, 42 balances, 41 pivots).

---

## DB scoring rules (CoP 2025–2028)

- The **8 highest** body difficulties are counted (senior); **6 highest** (junior).
- Each box in the CoP tables is a distinct element — repetitions of the same box are not counted twice.
- Series of jumps/pivots: each item in the series counts separately if valid.

---

## Risk (Dynamic Elements with Rotation — R)

In ChoreoLab, **Risk** is a separate timeline item type (not a BodyElement).

CoP definition (§4): A Risk is a **high throw + minimum 2 base rotations (360° each) + catch**.

When building a Risk, the rotation count starts at **0** — validation requires at least 2 base rotations (360° each) under the flight for a valid R.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Generated when saved in routine |
| `criteria` | RCriteria[] | Additional R criteria applied |
| `rotations` | RiskRotation[] | Rotation references + counts |
| `apparatus` | enum | Routine apparatus |
| `value` | number | Calculated R value (base 0.20 + criteria) |

### Risk limits

| Age category | Max Risks (R) evaluated |
|--------------|-------------------------|
| Senior | 4 |
| Junior | 3 |

Risk rotations may come from:
- Pre-acrobatic elements (walkover, cartwheel, roll, etc.) — groups `acro-1` … `acro-13`
- Vertical rotations (chainé, passé pivot, etc.) — groups `v1`, `v2`, `v3`
- DB pivots/jumps with rotation ≥ 360° and value ≥ 0.20 (max 1 per R)

### RCriteria (reference collection: `rcriteria`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable slug |
| `name` | string | Official criterion name |
| `type` | enum | `throw` \| `catch` \| `general` |
| `value` | number | +0.10 or +0.20 added to R base (0.20) |
| `apparatuses` | Apparatus[] | Which apparatus the criterion applies to |

**Seeded:** 15 criteria from CoP §4.8–4.10.

| Type | Count | Apparatus |
|------|-------|-----------|
| `general` | 3 | all four (hoop, ball, clubs, ribbon) |
| `throw` / `catch` | 4 | all four (outside visual field, without hands) |
| `throw` | 1 | hoop (throw after roll on floor) |
| `catch` | 2 | hoop (passing through, catch with rotation on body) |
| `catch` | 2 | ball (direct rebound on body, catch with 1 hand) |
| `throw` | 1 | clubs (throw 2 unlocked clubs) |
| `catch` | 1 | clubs (simultaneous catch 2 unlocked) |
| `catch` | 1 | all four (catch with roll over body) |

Ribbon has no apparatus-specific throw/catch criteria — only general and shared criteria apply.

### Rotation (reference collection: `rotations`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable slug |
| `name` | string | Group name |
| `group` | string | `v1` \| `v2` \| `v3` \| `acro-1` … `acro-13` |

**Seeded:** 16 rotation groups — 3 vertical + 13 pre-acrobatic.

| Group | Description | CoP limit per routine |
|-------|-------------|----------------------|
| `v1` | Upright (jump/skip/hop, turning steps) | max 2 R |
| `v2` | Seated/kneeling | max 1 R |
| `v3` | Lateral roll | max 1 R |
| `acro-1` … `acro-13` | Pre-acrobatic groups (walkover, cartwheel, roll, etc.) | max 1 R per group |

---

## Required body groups (validation)

Every routine must include **at least 1 element from each group**:

- Minimum 1 jump/leap
- Minimum 1 balance
- Minimum 1 pivot/rotation

Penalty if missing: 0.30 p. per missing group (CoP §2.3.2).

Stored in `requirements` collection as `DB.requiredElements: ["jump", "balance", "pivot"]`.

---

## Requirements summary (from `requirements` collection)

| Rule | Senior | Junior |
|------|--------|--------|
| Max body elements counted | 8 | 6 |
| Required groups | jump, balance, pivot | jump, balance, pivot |
| Max Risks (R) | 4 | 3 |

`minElements: 3` reflects the three required body groups (one from each category).

---

## Query examples

```graphql
query {
  bodyElements(category: jump) { id name value }
  requirements(ageCategory: senior) {
    DB { maxElements requiredElements maxRisks }
  }
}
```
