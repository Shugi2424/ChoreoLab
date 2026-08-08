# Validation Rules

FIG Rhythmic Gymnastics Code of Points **2025–2028** — individual senior & junior.

> **Status:** Requirements seeded in `requirements` collection. Full rule engine planned for M7. Risk and mastery **composition** rules are enforced at save time in M5 (`riskValidation.ts`, `masteryValidation.ts`).

Validation reports **what is missing** — ChoreoLab does not apply CoP penalties to scores.

---

## Requirements (collection: `requirements`)

Two documents — one per age category:

| id                    | ageCategory |
| --------------------- | ----------- |
| `requirements-senior` | `senior`    |
| `requirements-junior` | `junior`    |

### Limits

| Domain | Rule                         | Senior | Junior |
| ------ | ---------------------------- | ------ | ------ |
| DB     | Min body groups present      | 3      | 3      |
| DB     | Max body elements counted    | 8      | 6      |
| DB     | Required groups              | jump, balance, pivot (min 1 each) | jump, balance, pivot (min 1 each) |
| DB     | Max Risks (R)                | 4      | 3      |
| DA     | Min masteries                | 0      | 0      |
| DA     | Max masteries                | 15     | 12     |
| DA     | Max acrobatics               | 3      | 3      |
| A      | Min character moments        | 20     | 20     |
| A      | Min dance combinations       | 2      | 2      |
| A      | Min dynamic changes + effects | 2     | 2      |

`minElements: 3` = one element from each required body group (jump, balance, pivot).

`minDynamicEffects` counts `dynamicChange` and `effect` artistry items combined.

---

## Implemented in M5 (composition validation only)

Before a risk or mastery is saved on the timeline, `routineTimelineService` validates composition:

| Domain | Rules enforced at save |
| ------ | ---------------------- |
| Risk   | Min 2 rotations, apparatus criteria, direct-catch mutual exclusion, throw-after-roll pairing — see [DB.md](./DB.md) |
| Mastery | Base/criteria counts, apparatus eligibility, catch-from-high-throw pairing, alternate-catch exclusion — see [DA.md](./DA.md) |

Routine-level limits (max risks, required body groups, artistry counts) are **not** yet evaluated — those require M7.

---

## Validation engine (planned — M7)

On every routine change, compare the timeline against the `requirements` document for the routine's `ageCategory`:

1. Count body elements by category → check required groups and `maxElements`
2. Count Risk items → check `maxRisks`
3. Count Mastery items → check `maxMasteries` and `maxAcrobatics`
4. Count ArtistryComponent items by type → check A requirements

Return `missingRequirements[]` with human-readable messages for the validation panel.

---

## Query example

```graphql
query {
  requirements(ageCategory: senior) {
    id
    DB {
      minElements
      maxElements
      requiredElements
      maxRisks
    }
    DA {
      minMasteries
      maxMasteries
      maxAcrobatics
    }
    A {
      minCharacterMoves
      minDanceSteps
      minDynamicEffects
    }
  }
}
```
