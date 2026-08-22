import type { ValidationContext, ValidationLimits } from "../../utils/validation.js";

/** Senior limits from seeds/data/requirements.json */
export const SENIOR_LIMITS: ValidationLimits = {
  DB: {
    minElements: 3,
    maxElements: 8,
    requiredElements: ["jump", "balance", "pivot"],
    maxRisks: 4,
  },
  DA: {
    minMasteries: 0,
    maxMasteries: 15,
    maxAcrobatics: 3,
  },
  A: {
    minCharacterMoves: 20,
    minDanceSteps: 2,
    minDynamicEffects: 2,
  },
};

export function seniorContext(
  overrides: Partial<{
    bodyElementCategoryById: Map<string, string>;
    artistryTypeById: Map<string, string>;
  }> = {},
): ValidationContext {
  return {
    limits: SENIOR_LIMITS,
    bodyElementCategoryById: overrides.bodyElementCategoryById ?? new Map(),
    artistryTypeById: overrides.artistryTypeById ?? new Map(),
  };
}
