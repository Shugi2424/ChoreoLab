# Artistry

FIG Rhythmic Gymnastics Code of Points **2025–2028**, individual exercises only.

> **Status:** Artistry components seeded (4 types).

---

## ChoreoLab artistry model

ChoreoLab tracks four component types on the routine timeline:

| Component        | CoP reference                  | ChoreoLab tracking                          |
| ---------------- | ------------------------------ | ------------------------------------------- |
| Character moment | §3 Guiding Idea and Character  | Count `character` items (min 20)            |
| Dance combination | §5 Dance Steps Combinations   | Count `dance` items (min 2)               |
| Dynamic change   | §6 Dynamic Changes and Effects | Count `dynamicChange` items              |
| Effect           | §6 Dynamic Changes and Effects | Count `effect` items (min 2 with dynamic) |

**Not tracked:** Expression (§4), Connections (§7), Rhythm (§8), Space (§9), Continuity (§10).

---

## ArtistryComponent (reference collection: `artistrycomponents`)

Coach picks a component **type** from reference data when adding an artistry item to the timeline.

| Field  | Type   | Description                                                          |
| ------ | ------ | -------------------------------------------------------------------- |
| `id`   | string | Stable slug, e.g. `dance-combination`                                |
| `name` | string | Component name, e.g. _Dance combination_                             |
| `type` | enum   | `character` \| `dance` \| `dynamicChange` \| `effect`               |

**Seeded:** 4 component types.

| id                  | name             | type              |
| ------------------- | ---------------- | ----------------- |
| `character-moment`  | Character moment | `character`       |
| `dance-combination` | Dance combination | `dance`          |
| `dynamic-change`    | Dynamic change   | `dynamicChange`  |
| `effect`            | Effect           | `effect`          |

Each timeline item of this type counts as one instance toward the age-category minimum for that type.

---

## Requirements (from `requirements` collection)

| Rule                          | Senior | Junior |
| ----------------------------- | ------ | ------ |
| Min character moments         | 20     | 20     |
| Min dance combinations        | 2      | 2      |
| Min dynamic changes + effects | 2      | 2      |

`minDynamicEffects` counts `dynamicChange` and `effect` items combined.

---

## Validation (future)

The validation engine will count timeline items by artistry type and compare against `requirements.A` for the routine's age category.
