// Base R value before criteria and extra rotations (CoP: 0.20).
export const RISK_BASE_VALUE = 0.2;

// Need at least 2 full rotations under the flight or it's not a valid risk.
export const MIN_BASE_ROTATIONS = 2;

// Extra full turns beyond the first 2 add 0.10 each (not the "rotation" criterion row).
export const ROTATION_CRITERION_ID = "rotation";
export const ROTATION_BONUS_VALUE = 0.1;

export const THROW_AFTER_ROLL_ON_FLOOR_ID = "throw-after-roll-on-floor";
export const WITHOUT_HANDS_THROW_ID = "without-hands-throw";
export const WITHOUT_HANDS_CATCH_ID = "without-hands-catch";

// These catches can't be combined with "without hands" on the catch.
export const WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS = [
  "catch-ball-one-hand",
  "catch-2-unlocked-clubs-simultaneous",
] as const;

// Normal catch bonuses (outside visual field, without hands, etc.).
export const STANDARD_CATCH_CRITERIA_IDS = [
  "outside-visual-field-catch",
  "without-hands-catch",
] as const;

// Apparatus "direct catch" options. Only one per risk; you can still add other catch criteria too.
export const DIRECT_CATCH_CRITERIA_IDS = [
  "catch-roll-over-body",
  "passing-through-hoop",
  "catch-hoop-rotation-on-body",
  "direct-rebound-on-body",
  "catch-ball-one-hand",
  "catch-2-unlocked-clubs-simultaneous",
] as const;

export type DirectCatchCriteriaId = (typeof DIRECT_CATCH_CRITERIA_IDS)[number];

export interface RiskRotationInput {
  rotationId: string;
  count: number;
}

export interface RiskCompositionInput {
  criteriaIds: string[];
  rotations: RiskRotationInput[];
}

// Same criterion picked twice shouldn't count twice in value or validation.
export function normalizeRiskCriteriaIds(criteriaIds: string[]): string[] {
  return [...new Set(criteriaIds)];
}

export function isDirectCatchCriterion(id: string): boolean {
  return (DIRECT_CATCH_CRITERIA_IDS as readonly string[]).includes(id);
}

export function isStandardCatchCriterion(id: string): boolean {
  return (STANDARD_CATCH_CRITERIA_IDS as readonly string[]).includes(id);
}

export function isWithoutHandsIncompatibleCatch(id: string): boolean {
  return (WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS as readonly string[]).includes(id);
}

// Check throw/catch/rotation rules before save. null = OK, string = show in UI.
export function getRiskCompositionError(input: RiskCompositionInput): string | null {
  const criteriaIds = normalizeRiskCriteriaIds(input.criteriaIds ?? []);
  const rotations = input.rotations ?? [];

  const totalRotationCount = rotations.reduce((sum, rotation) => sum + rotation.count, 0);
  if (totalRotationCount < MIN_BASE_ROTATIONS) {
    return "A valid Risk requires at least 2 rotations under the flight.";
  }

  for (const rotation of rotations) {
    if (!rotation.rotationId) {
      return "Choose a rotation for each entry.";
    }
    if (rotation.count < 1) {
      return "Each rotation entry must have a count of at least 1.";
    }
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

// Stored on the timeline item when the risk is created. Routine DB uses this number later.
export function calculateRiskValue(
  criteriaIds: string[],
  criteriaValues: Map<string, number>,
  totalRotationCount: number,
): number {
  const uniqueIds = normalizeRiskCriteriaIds(criteriaIds);
  let value = RISK_BASE_VALUE;

  for (const id of uniqueIds) {
    if (id === ROTATION_CRITERION_ID) {
      continue; // turn bonus comes from rotation counts, not this row
    }
    value += criteriaValues.get(id) ?? 0;
  }

  const additionalRotations = Math.max(0, totalRotationCount - MIN_BASE_ROTATIONS);
  value += additionalRotations * ROTATION_BONUS_VALUE;

  return Math.round(value * 100) / 100;
}
