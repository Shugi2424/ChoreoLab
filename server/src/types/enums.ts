export const APPARATUS = ["hoop", "ball", "clubs", "ribbon", "rope"] as const;
export type Apparatus = (typeof APPARATUS)[number];

export const AGE_CATEGORIES = ["senior", "junior"] as const;
export type AgeCategory = (typeof AGE_CATEGORIES)[number];

export const BODY_CATEGORIES = ["jump", "balance", "pivot"] as const;
export type BodyCategory = (typeof BODY_CATEGORIES)[number];

export const R_CRITERIA_TYPES = ["throw", "catch", "general"] as const;
export type RCriteriaType = (typeof R_CRITERIA_TYPES)[number];

export const ARTISTRY_TYPES = ["character", "dance", "dynamic-change", "effect"] as const;
export type ArtistryType = (typeof ARTISTRY_TYPES)[number];

export const ROUTINE_ITEM_TYPES = [
  "BodyElement",
  "Risk",
  "Mastery",
  "ArtistryComponent",
] as const;
export type RoutineItemType = (typeof ROUTINE_ITEM_TYPES)[number];
