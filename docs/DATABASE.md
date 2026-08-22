# ChoreoLab — Database

Database: **MongoDB Atlas**  
Database name: **`choreolab`**  
ODM: **Mongoose**

## Collection Overview

Collections are divided into **reference data** (shared, read-only for coaches) and **user data** (coach-scoped).

### Reference Collections

Populated via seed scripts. Coaches read but never write.

| Collection           | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| `bodyelements`       | Body difficulty elements with values and categories |
| `bases`              | DA mastery bases (apparatus-specific)               |
| `dacriteria`         | DA criteria linked to eligible bases                |
| `rcriteria`          | Risk criteria (throw / catch / general)             |
| `rotations`          | Rotation groups — vertical (`v1`, `v2`, `v3`) and pre-acrobatic (`acro-1` … `acro-13`) |
| `artistrycomponents` | Artistry component definitions                      |
| `requirements`       | Age-category limits (DB, DA, A)                     |

There is **no `risks` reference collection**. A Risk is composed on the routine timeline from `rcriteria` and `rotations` references (see [Risk embedded schema](#risk-embedded-in-routineitem) below).

There is **no `coprequirements` collection**. Validation uses the `requirements` collection plus rule handlers in `validationService` (see [Validation](#validationresult-embedded-in-routine) below).

### User Collections

| Collection | Purpose                                       |
| ---------- | --------------------------------------------- |
| `coaches`  | Coach accounts (auth, profile)                |
| `routines` | Coach-owned routines with timeline and scores |

---

## Reference Schemas

All reference documents use a string **`id`** as the stable primary key (CoP code for body elements, slug for everything else). Seed scripts upsert by `id`. There is no separate `code` field.

### BodyElement

```typescript
{
  id: string;       // CoP code, e.g. "1.101", "2.305", "3.505"
  name: string;
  category: "jump" | "balance" | "pivot";
  value: number;    // DB value (0.1 – 0.8)
}
```

### Base

```typescript
{
  id: string;              // e.g. "large-roll"
  name: string;
  value: number;           // DA base value (0.20 – 0.40)
  apparatuses: Apparatus[];
  allowedCriteria: string[]; // DACriteria ids
}
```

### DACriteria

```typescript
{
  id: string; // e.g. "outside-visual-field"
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
  value: number;           // 0.10 or 0.20 added to R base (0.20)
  apparatuses: Apparatus[];
}
```

### Rotation

Rotation groups used by **Risks** and **Masteries**. Includes vertical rotations and pre-acrobatic groups.

```typescript
{
  id: string;
  name: string;
  group: string; // "v1" | "v2" | "v3" | "acro-1" … "acro-13"
}
```

| Group                | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `v1`                 | Upright (jump/skip/hop, turning steps)                 |
| `v2`                 | Seated/kneeling                                        |
| `v3`                 | Lateral roll                                           |
| `acro-1` … `acro-13` | Pre-acrobatic groups (walkover, cartwheel, roll, etc.) |

### ArtistryComponent

```typescript
{
  id: string;
  name: string;
  type: "character" | "dance" | "dynamicChange" | "effect";
}
```

### Requirement

Age-category limits stored as two documents (`requirements-senior`, `requirements-junior`):

```typescript
{
  id: string;
  ageCategory: "senior" | "junior";
  DB: {
    minElements: number;
    maxElements: number;
    requiredElements: ("jump" | "balance" | "pivot")[];
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

  // type-specific (only one populated per item)
  bodyElementId?: string;         // ref BodyElement.id
  bodyElementConfig?: {          // calculated on save (all body_element items)
    rotationCount?: number;      // pivot only — CoP §12 additional turns
    value: number;               // scored DB value for this timeline entry
  };
  risk?: Risk;
  mastery?: Mastery;
  artistryComponentId?: string;   // ref ArtistryComponent.id
}
```

Reference collections are **not** embedded in routines. Timeline items store **string `id` references** (or embedded Risk/Mastery compositions) so reference data updates propagate on recalculation.

### Risk (embedded in RoutineItem)

Not a separate collection. A Risk is a **composition** of R criteria and rotations under a high throw + catch (CoP §4).

```typescript
{
  criteriaIds: string[];   // ref RCriteria.id
  rotations: {
    rotationId: string;    // ref Rotation.id
    count: number;
  }[];
  value: number;             // calculated: 0.20 + max(0, totalRotations − 2) × 0.10 + Σ criteria values
}
```

### Mastery (embedded in RoutineItem)

Not a separate collection. A Mastery is a **composition** of bases and DA criteria (CoP §5).

```typescript
{
  baseIds: string[];       // ref Base.id, length 1 or 2
  criteriaIds: string[];   // ref DACriteria.id, length 1 or 2
  rotationId?: string;       // optional ref Rotation.id
  value: number;             // calculated from bases + criteria combo
  isAcro: boolean;           // true when rotation.group starts with "acro-"
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
  warnings: ValidationWarning[];  // optional-capacity hints (do not affect isValid)
  calculatedAt: Date;
}

interface MissingRequirement {
  id: string;      // stable slug for the rule, e.g. "missing-balance"
  domain: string;  // "db" | "da" | "a"
  message: string; // human-readable text for the validation panel
}

interface ValidationWarning {
  id: string;
  domain: string;  // "db" | "da" | "a"
  severity: string; // "info"
  message: string; // e.g. under max countable body elements / risks / masteries
}
```

Validation reads the `requirements` document for the routine's age category and evaluates the timeline in `validationService`, with additional handlers in `fouetteValidation.ts` and `pivotRotation.ts`. No separate rule collection.

Scores and validation are recalculated on every timeline mutation, on `createRoutine`, and when loading routines via `routines` / `routine` queries (`routineDerivedFields.ts`).

---

## Enums

```typescript
enum Apparatus {
  HOOP = "hoop",
  BALL = "ball",
  CLUBS = "clubs",
  RIBBON = "ribbon",
}

enum AgeCategory {
  SENIOR = "senior",
  JUNIOR = "junior",
}
```

---

## Relationships

```
Coach 1 ──▶ * Routine

Routine.timeline[*] ──▶ BodyElement.id     (type: body_element)
Routine.timeline[*].risk ──▶ RCriteria.id, Rotation.id, BodyElement.id (optional)
Routine.timeline[*].mastery ──▶ Base.id, DACriteria.id, Rotation.id (optional)
Routine.timeline[*] ──▶ ArtistryComponent.id (type: artistry)

ValidationEngine reads ──▶ requirements (by ageCategory)
ScoringEngine reads    ──▶ BodyElement, RCriteria (via Risk), DACriteria (via Mastery)
```

---

## Current State vs Target

| Collection           | Status                                             |
| -------------------- | -------------------------------------------------- |
| `bodyelements`       | ✅ Seeded (163 elements)                           |
| `requirements`       | ✅ Seeded (senior + junior)                        |
| `bases`              | ✅ Seeded (34 bases)                               |
| `dacriteria`         | ✅ Seeded (7 criteria)                             |
| `rcriteria`          | ✅ Seeded (15 risk criteria)                       |
| `rotations`          | ✅ Seeded (16 groups: v1–v3 + acro-1…13)           |
| `artistrycomponents` | ✅ Seeded (4 types)                                |
| `coaches`            | ✅ Created on sign-up                              |
| `routines`           | ✅ Created via createRoutine (M3)                  |

> **Note:** The legacy `elements` collection from the initial scaffold has been removed. Use `bodyelements` only.

## Mongoose conventions

All schemas set `versionKey: false` — documents do **not** include a `__v` field. Mongoose adds `__v` by default for optimistic concurrency; ChoreoLab disables it because documents are updated via full replace on seed, not concurrent versioned patches.

---

## Seed Strategy

Reference data is loaded from JSON under `server/seeds/data/`.

```
server/seeds/
├── data/
│   ├── body-elements.json
│   ├── bases.json
│   ├── da-criteria.json
│   ├── rcriteria.json
│   ├── rotations.json
│   ├── artistry-components.json
│   └── requirements.json
└── seed.ts               # npm run seed
```

Seed scripts are **idempotent** (upsert by `id`, never duplicate).

Detailed element values and CoP rules are defined in [docs/domains/](./domains/) and loaded via seed scripts.

---

## Indexing Strategy

| Collection        | Index                         | Reason           |
| ----------------- | ----------------------------- | ---------------- |
| `coaches`         | `{ email: 1 }` unique         | Login lookup     |
| `routines`        | `{ coach: 1, updatedAt: -1 }` | Dashboard list   |
| `bodyelements`    | `{ id: 1 }` unique            | Reference lookup |
| `bases`           | `{ id: 1 }` unique            | Reference lookup |
| `dacriteria`      | `{ id: 1 }` unique            | Reference lookup |
| `rcriteria`       | `{ id: 1 }` unique            | Reference lookup |
| `rotations`       | `{ id: 1 }` unique            | Reference lookup |
| `artistrycomponents` | `{ id: 1 }` unique         | Reference lookup |
| `requirements`    | `{ id: 1 }` unique            | Reference lookup |

---

## Data Integrity Rules

1. A coach can only read/write routines where `routine.coach === context.coachId`
2. Timeline `order` values must be contiguous integers starting at 0
3. Risk compositions must satisfy CoP §4.8–4.10 rules before being saved (`riskValidation.ts`)
4. Mastery compositions must satisfy DA combination rules before being saved (`masteryValidation.ts`)
5. Reference data is replaced on seed — no soft-delete `active` flag on reference collections
6. Scores and validation on a routine are always recalculated server-side — never trusted from the client
7. At most one Fouetté pivot and one Fouetté balance body element on the timeline (`fouetteValidation.ts`, CoP ID prefixes `3.160` / `2.180`)
8. Pivot body elements store `bodyElementConfig.rotationCount` and a calculated `value` per CoP §12 (`pivotRotation.ts`); `rotationCount` is rejected for non-pivot elements
