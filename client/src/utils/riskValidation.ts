export const THROW_AFTER_ROLL_ON_FLOOR_ID = "throw-after-roll-on-floor";
export const WITHOUT_HANDS_THROW_ID = "without-hands-throw";
export const WITHOUT_HANDS_CATCH_ID = "without-hands-catch";

export const WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS = [
  "catch-ball-one-hand",
  "catch-2-unlocked-clubs-simultaneous",
] as const;

export const MIN_BASE_ROTATIONS = 2;

/** Direct catch criteria — at most one per Risk; combinable with basic catch (§4.9). */
export const DIRECT_CATCH_CRITERIA_IDS = [
  "catch-roll-over-body",
  "passing-through-hoop",
  "catch-hoop-rotation-on-body",
  "direct-rebound-on-body",
  "catch-ball-one-hand",
  "catch-2-unlocked-clubs-simultaneous",
] as const;

export interface RiskCompositionInput {
  criteriaIds: string[];
  rotations: Array<{ rotationId: string; count: number }>;
}

export function normalizeRiskCriteriaIds(criteriaIds: string[]): string[] {
  return [...new Set(criteriaIds)];
}

export function isDirectCatchCriterion(id: string): boolean {
  return (DIRECT_CATCH_CRITERIA_IDS as readonly string[]).includes(id);
}

export function isWithoutHandsIncompatibleCatch(id: string): boolean {
  return (WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS as readonly string[]).includes(id);
}

export function validateRiskComposition(input: RiskCompositionInput): string | null {
  const criteriaIds = normalizeRiskCriteriaIds(input.criteriaIds);
  const rotations = input.rotations ?? [];

  const totalRotationCount = rotations.reduce((sum, rotation) => sum + rotation.count, 0);
  if (totalRotationCount < MIN_BASE_ROTATIONS) {
    return "A valid Risk requires at least 2 rotations (minimum 2×360° under the flight).";
  }

  if (rotations.some((rotation) => !rotation.rotationId)) {
    return "Choose a rotation for each entry.";
  }

  if (
    criteriaIds.includes(THROW_AFTER_ROLL_ON_FLOOR_ID) &&
    !criteriaIds.includes(WITHOUT_HANDS_THROW_ID)
  ) {
    return 'Throw after rolling on the floor requires "Without the help of the hands" on the throw.';
  }

  const directCatchSelected = criteriaIds.filter(isDirectCatchCriterion);
  if (directCatchSelected.length > 1) {
    return "Only one direct catch criterion (rolling, passing, rotation, rebound, one-hand, or 2-clubs) per Risk.";
  }

  if (
    criteriaIds.includes(WITHOUT_HANDS_CATCH_ID) &&
    criteriaIds.some(isWithoutHandsIncompatibleCatch)
  ) {
    return 'Catch with 1 hand cannot combine with "Without the help of the hands" on the catch.';
  }

  return null;
}
