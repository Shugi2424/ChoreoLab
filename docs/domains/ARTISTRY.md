# Artistry

FIG Rhythmic Gymnastics Code of Points **2025–2028**, individual exercises only.

> **Status:** Artistry components seeded (4 types). Execution penalties and full Artistry jury scoring are **out of scope**.

---

## ChoreoLab artistry model

Instead of the full CoP artistry evaluation (character "parts", expression penalties, etc.), ChoreoLab tracks:

| Component | CoP reference | ChoreoLab tracking |
|-----------|---------------|-------------------|
| Character moments | §3 Guiding Idea and Character | Count `character` items (20 senior / 15 junior) |
| Dance steps combinations | §5 Dance Steps Combinations | Count `dance` items (min 2) |
| Dynamic changes + Effects | §6 Dynamic Changes and Effects | Count `dynamic` + `effect` items (min 2 combined) |

**Ignored:** Expression (§4), Connections (§7), Rhythm (§8), Space (§9), Continuity (§10), Execution (Section D).

---

## ArtistryComponent (timeline item type)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Generated when saved |
| `name` | string | Coach label for the moment |
| `type` | enum | `character` \| `dance` \| `dynamic` \| `effect` |

**Seeded:** 4 component types — Character moment, Dance combination, Dynamic change, Effect.

### Type definitions

| Type | CoP meaning | ChoreoLab rule |
|------|-------------|----------------|
| `character` | A movement/detail expressing the routine's guiding idea | One counted "character moment" |
| `dance` | A valid 8-second dance steps combination (§5.2) | One counted dance combination |
| `dynamic` | A contrast in tempo/intensity (§6.1.4) | One counted dynamic change |
| `effect` | Movement highlighting a significant musical moment (§6.2) | One counted effect |

CoP §6.3.1: Minimum **2** Dynamic changes **or** Effects combined — ChoreoLab tracks `minDynamicEffects: 2` across `dynamic` + `effect` types.

---

## Requirements (from `requirements` collection)

| Rule | Senior | Junior |
|------|--------|--------|
| Min character moments | 20 | 15 |
| Min dance steps combinations | 2 | 2 |
| Min dynamic changes + effects | 2 | 2 |

---

## Dance steps combination (CoP §5.2 recap)

A valid dance combination requires:
- Minimum **8 seconds** with apparatus in motion
- Movements in harmony with rhythm throughout
- Defined character/style (not generic walking/stepping)
- Minimum **2 different step types** with displacement
- Part in upright position
- No pre-acrobatic elements, high throws, DA, or DB ≥ 0.20

---

## Dynamic change (CoP §6.1.4 recap)

Recognized methods:
1. Instant contrast between parts of the exercise
2. Gradual increase/reduction within a part
3. Minimum 2 movements demonstrating opposite tempo/intensity

---

## Effect with music (CoP §6.2 recap)

Strategic placement of body/apparatus movement to highlight a significant musical accent or phrase.

---

## Validation (future)

The validation engine will count timeline items by artistry type and compare against `requirements.A` for the routine's age category.
