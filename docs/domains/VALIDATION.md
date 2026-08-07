# Validation Rules

FIG Rhythmic Gymnastics Code of Points **2025–2028** — individual senior & junior.

> **Status:** Requirements seeded in `requirements` collection. Rule engine not yet implemented.

---

## Requirements documents

Two documents in the `requirements` collection:

| id | ageCategory |
|----|-------------|
| `requirements-senior` | `senior` |
| `requirements-junior` | `junior` |

### Schema

```typescript
{
  id: string;
  ageCategory: "senior" | "junior";
  DB: {
    minElements: int;      // minimum body groups present (3 = jump + balance + pivot)
    maxElements: int;      // max DB elements counted (8 senior, 6 junior)
    requiredElements: ["jump", "balance", "pivot"];
    maxRisks: int;         // max R elements (4 senior, 3 junior)
  };
  DA: {
    minMasteries: int;     // 0 — no CoP minimum
    maxMasteries: int;     // 15 senior, 12 junior
    maxAcrobatics: int;     // max acrobatic DA (3 senior, 3 junior)
  };
  A: {
    minCharacterMoves: int;  // 20 senior, 15 junior (ChoreoLab simplification)
    minDanceSteps: int;      // 2
    minDynamicEffects: int;  // 2 (dynamic changes + effects combined)
  };
}
```

---

## Senior requirements (CoP + ChoreoLab)

| Domain | Rule | Value |
|--------|------|-------|
| DB | Max elements counted | 8 |
| DB | Required groups | jump, balance, pivot (min 1 each) |
| DB | Max Risks (R) | 4 |
| DA | Max masteries | 15 |
| DA | Max acrobatics | 3 |
| A | Min character moments | 20 |
| A | Min dance combinations | 2 |
| A | Min dynamic + effects | 2 |

## Junior requirements (CoP + ChoreoLab)

| Domain | Rule | Value |
|--------|------|-------|
| DB | Max elements counted | 6 |
| DB | Required groups | jump, balance, pivot (min 1 each) |
| DB | Max Risks (R) | 3 |
| DA | Max masteries | 12 |
| DA | Max acrobatics | 3 |
| A | Min character moments | 15 |
| A | Min dance combinations | 2 |
| A | Min dynamic + effects | 2 |

---

## Validation engine (planned)

On every routine change, compare timeline against the `requirements` document for the routine's `ageCategory`:

1. Count body elements by category → check required groups and maxElements
2. Count Risk items → check maxRisks
3. Count Mastery items → check maxMasteries and maxAcrobatics
4. Count ArtistryComponent items by type → check A requirements

Return `missingRequirements[]` with human-readable messages for the validation panel.

---

## Query example

```graphql
query {
  requirements(ageCategory: senior) {
    id
    DB { minElements maxElements requiredElements maxRisks }
    DA { minMasteries maxMasteries maxAcrobatics }
    A { minCharacterMoves minDanceSteps minDynamicEffects }
  }
}
```
