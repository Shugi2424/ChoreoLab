# Validation Rules

FIG Rhythmic Gymnastics Code of Points **2025–2028** — individual senior & junior.

> **Status:** Requirements seeded in `requirements` collection. Rule engine not yet implemented.

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

`minDynamicEffects` counts `dynamic-change` and `effect` artistry items combined.

---

## Validation engine (planned)

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
