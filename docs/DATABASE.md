# ChoreoLab — Database

Database: **MongoDB Atlas**  
Database name: **`choreolab`**  
ODM: **Mongoose**

## Collection Overview

Collections are divided into **reference data** (shared, read-only for coaches) and **user data** (coach-scoped).

### Reference Collections

Populated via seed scripts. Coaches read but never write.

| Collection | Purpose |
|------------|---------|
| `bodyelements` | Body difficulty elements with values and categories |
| `risks` | Risk elements with values |
| `bases` | DA mastery bases (apparatus-specific) |
| `dacriteria` | DA criteria linked to eligible bases |
| `rcriteria` | Additional reference criteria |
| `rotations` | Acrobatic rotation definitions and limits |
| `artistrycomponents` | Artistry component definitions |
| `requirements` | Age-category rules (DB, DA, artistry limits) |
| `coprequirements` | Code of Points requirement rules |

### User Collections

| Collection | Purpose |
|------------|---------|
| `coaches` | Coach accounts (auth, profile) |
| `routines` | Coach-owned routines with timeline and scores |

---

## Reference Schemas

### BodyElement

```typescript
{
  code: string;           // unique identifier, e.g. "BB-001"
  name: string;
  category: string;       // e.g. "balance", "flexibility", "jump", "leap", "pivot", "rotation"
  value: number;          // DB value
  apparatus: Apparatus[]; // which apparatus this element applies to
  description?: string;
  tags: string[];         // flexible metadata for validation rules
  active: boolean;        // soft disable without deletion
}
```

### Risk

```typescript
{
  code: string;
  name: string;
  value: number;          // DB value contribution
  apparatus: Apparatus[]; // applicable apparatus
  description?: string;
  active: boolean;
}
```

### Base

```typescript
{
  id: string;              // e.g. "large-roll"
  name: string;
  value: number;           // DA base value (0.20 – 0.40)
  apparatuses: Apparatus[]; // one or more apparatus
  allowedCriteria: string[]; // DACriteria ids (N/A excluded per CoP table)
}
```

### DACriteria

```typescript
{
  id: string;              // e.g. "outside-visual-field"
  name: string;
}
```

### RCriteria

Risk criteria from CoP §4.8–4.10. See [domains/DB.md](./domains/DB.md).

```typescript
{
  id: string;
  name: string;
  type: "throw" | "catch" | "general";
  value: number;           // 0.10 or 0.20
  apparatuses: Apparatus[];
}
```

### Rotation

```typescript
{
  id: string;
  name: string;
  group: string;           // "v1" | "v2" | "v3" | "acro-1" … "acro-13"
}
```

### ArtistryComponent

```typescript
{
  id: string;
  name: string;
  type: "character" | "dance" | "dynamic" | "effect";
}
```

### Requirement

Age-category limits stored as two documents (`senior`, `junior`):

```typescript
{
  id: string;              // e.g. "requirements-senior"
  ageCategory: AgeCategory;
  DB: {
    minElements: number;
    maxElements: number;
    requiredElements: BodyCategory[];
    maxRisks: number;
  };
  DA: {
    minMasteries: number;
    maxMasteries: number;
    maxAcrobatics: number;
  };
  A: {
    minCharacterMoves: number;
    minDanceSteps: number;
    minDynamicEffects: number;
  };
}
```

### CoPRequirement

```typescript
{
  code: string;
  name: string;
  apparatus: Apparatus | "all";
  ageCategory: AgeCategory | "all";
  domain: "db" | "da" | "artistry" | "general";
  ruleType: string;        // e.g. "min_count", "max_count", "required_category", "min_value"
  parameters: Record<string, unknown>;  // rule-specific config
  message: string;         // human-readable description for validation panel
  active: boolean;
}
```

---

## User Schemas

### Coach

```typescript
{
  email: string;           // unique, indexed
  passwordHash: string;
  firstName: string;
  lastName: string;
  club?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Indexes: `{ email: 1 }` unique

### Routine

```typescript
{
  coach: ObjectId;         // ref Coach, indexed
  gymnastName: string;
  apparatus: Apparatus;
  ageCategory: AgeCategory;
  timeline: RoutineItem[];
  dbScore: number;
  daScore: number;
  validation: ValidationResult;
  createdAt: Date;
  updatedAt: Date;
}
```

Indexes: `{ coach: 1, updatedAt: -1 }`

### RoutineItem (embedded in Routine.timeline)

```typescript
{
  _id: ObjectId;           // stable ID for reorder/remove
  type: "body_element" | "risk" | "mastery" | "artistry";
  order: number;

  // type-specific reference (only one populated per item)
  bodyElementId?: ObjectId;       // ref BodyElement
  riskId?: ObjectId;              // ref Risk
  mastery?: MasteryComposition;
  artistryComponentId?: ObjectId; // ref ArtistryComponent
}
```

### MasteryComposition (embedded in RoutineItem)

```typescript
{
  bases: ObjectId[];       // ref Base, length 1 or 2
  criteria: ObjectId[];    // ref DACriteria, length 1 or 2
}
```

### ValidationResult (embedded in Routine)

```typescript
{
  isValid: boolean;
  dbValid: boolean;
  daValid: boolean;
  artistryValid: boolean;
  missingRequirements: MissingRequirement[];
  calculatedAt: Date;
}

interface MissingRequirement {
  code: string;
  domain: string;
  message: string;
  severity: "error" | "warning";
}
```

---

## Enums

```typescript
enum Apparatus {
  HOOP = "hoop",
  BALL = "ball",
  CLUBS = "clubs",
  RIBBON = "ribbon",
  ROPE = "rope",
}

enum AgeCategory {
  SENIOR = "senior",
  JUNIOR = "junior",
  // additional categories as defined in CoP docs
}
```

---

## Relationships

```
Coach 1 ──▶ * Routine

Routine.timeline[*] ──▶ BodyElement     (type: body_element)
Routine.timeline[*] ──▶ Risk            (type: risk)
Routine.timeline[*] ──▶ MasteryComposition
  MasteryComposition.bases[*]    ──▶ Base
  MasteryComposition.criteria[*] ──▶ DACriteria
Routine.timeline[*] ──▶ ArtistryComponent

ValidationEngine reads ──▶ CoPRequirement (filtered by apparatus + ageCategory)
ScoringEngine reads    ──▶ BodyElement, Risk, DACriteria, ArtistryComponent
```

Reference collections are **not** embedded in routines. Timeline items store **ObjectId references** so that reference data updates propagate correctly on recalculation.

---

## Current State vs Target

| Collection | Status |
|------------|--------|
| `bodyelements` | ✅ Seeded (163 elements) |
| `requirements` | ✅ Seeded (senior + junior) |
| `risks` | ❌ Not created |
| `bases` | ✅ Seeded (34 bases — shared + apparatus-specific) |
| `dacriteria` | ✅ Seeded (7 criteria) |
| `rcriteria` | ✅ Seeded (15 criteria) |
| `rotations` | ✅ Seeded (16 groups) |
| `artistrycomponents` | ✅ Seeded (4 types) |
| `coprequirements` | ❌ Not created |
| `coaches` | ❌ Not created |
| `routines` | ❌ Not created |

> **Note:** The legacy `elements` collection from the initial scaffold has been removed. Use `bodyelements` only.

## Mongoose conventions

All schemas set `versionKey: false` — documents do **not** include a `__v` field. Mongoose adds `__v` by default for optimistic concurrency; ChoreoLab disables it because documents are updated via full replace on seed, not concurrent versioned patches.

---

## Seed Strategy

Reference data will be loaded from structured JSON or CSV files under `server/seeds/data/`, driven by scripts in `server/seeds/`.

```
server/seeds/
├── data/
│   ├── body-elements.json
│   ├── risks.json
│   ├── bases.json
│   ├── da-criteria.json
│   ├── rcriteria.json
│   ├── rotations.json
│   ├── artistry-components.json
│   └── cop-requirements.json
├── seedBodyElements.ts
├── seedReferenceData.ts
└── index.ts              # npm run seed
```

Seed scripts must be **idempotent** (upsert by `code`, never duplicate).

Detailed element values and CoP rules are defined in [docs/domains/](./domains/) and loaded via seed scripts.

---

## Indexing Strategy

| Collection | Index | Reason |
|------------|-------|--------|
| `coaches` | `{ email: 1 }` unique | Login lookup |
| `routines` | `{ coach: 1, updatedAt: -1 }` | Dashboard list |
| `bodyelements` | `{ code: 1 }` unique | Reference lookup |
| `risks` | `{ code: 1 }` unique | Reference lookup |
| `bases` | `{ code: 1 }` unique | Reference lookup |
| `dacriteria` | `{ code: 1 }` unique | Reference lookup |
| `coprequirements` | `{ apparatus: 1, ageCategory: 1 }` | Validation query |

---

## Data Integrity Rules

1. A coach can only read/write routines where `routine.coach === context.coachId`
2. Timeline `order` values must be contiguous integers starting at 0
3. Mastery compositions must satisfy DA combination rules before being saved
4. Reference data deactivation uses `active: false`, never hard delete
5. Scores and validation on a routine are always recalculated server-side — never trusted from the client
