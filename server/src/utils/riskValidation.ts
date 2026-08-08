import { UserInputError } from "./errors.js";

/** CoP §4.2.1 — base value includes minimum 2×360° rotations under the flight. */
export const RISK_BASE_VALUE = 0.2;

/** Minimum base rotations required for a valid R (CoP §4.1.2.2). */
export const MIN_BASE_ROTATIONS = 2;

/** CoP §4.8.1 — each additional complete 360° beyond the 2 base rotations. */
export const ROTATION_CRITERION_ID = "rotation";
export const ROTATION_BONUS_VALUE = 0.1;

export const THROW_AFTER_ROLL_ON_FLOOR_ID = "throw-after-roll-on-floor";
export const WITHOUT_HANDS_THROW_ID = "without-hands-throw";
export const WITHOUT_HANDS_CATCH_ID = "without-hands-catch";

/** Direct catch criteria incompatible with "without hands" on the catch. */
export const WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS = [
  "catch-ball-one-hand",
  "catch-2-unlocked-clubs-simultaneous",
] as const;

/** General catch criteria for a standard high-throw catch (CoP §4.9). */
export const STANDARD_CATCH_CRITERIA_IDS = [
  "outside-visual-field-catch",
  "without-hands-catch",
] as const;

/**
 * Apparatus-specific direct catch criteria (CoP §4.10).
 * At most one per Risk; may combine with basic catch criteria (§4.9).
 */
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

export interface RiskInput {
  criteriaIds: string[];
  rotations: RiskRotationInput[];
}

export interface RiskCompositionInput extends RiskInput {}

export function normalizeRiskCriteriaIds(criteriaIds: string[]): string[] {
  return [...new Set(criteriaIds)];
}

export function isDirectCatchCriterion(id: string): boolean {
  return (DIRECT_CATCH_CRITERIA_IDS as readonly string[]).includes(id);
}

export function isStandardCatchCriterion(id: string): boolean {
  return (STANDARD_CATCH_CRITERIA_IDS as readonly string[]).includes(id);
}

export function validateRiskComposition(input: RiskCompositionInput): void {
  const criteriaIds = normalizeRiskCriteriaIds(input.criteriaIds ?? []);
  const rotations = input.rotations ?? [];

  const totalRotationCount = rotations.reduce((sum, rotation) => sum + rotation.count, 0);
  if (totalRotationCount < MIN_BASE_ROTATIONS) {
    throw new UserInputError(
      "A valid Risk requires at least 2 rotations (minimum 2×360° under the flight).",
    );
  }

  for (const rotation of rotations) {
    if (rotation.count < 1) {
      throw new UserInputError("Each rotation entry must have a count of at least 1.");
    }
  }

  if (
    criteriaIds.includes(THROW_AFTER_ROLL_ON_FLOOR_ID) &&
    !criteriaIds.includes(WITHOUT_HANDS_THROW_ID)
  ) {
    throw new UserInputError(
      'Throw after rolling on the floor requires "Without the help of the hands" on the throw.',
    );
  }

  const directCatchSelected = criteriaIds.filter(isDirectCatchCriterion);
  if (directCatchSelected.length > 1) {
    throw new UserInputError(
      "Only one direct catch criterion (rolling, passing, rotation, rebound, one-hand, or 2-clubs) per Risk.",
    );
  }

  const incompatibleWithWithoutHands = criteriaIds.filter((id) =>
    (WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS as readonly string[]).includes(id),
  );
  if (
    criteriaIds.includes(WITHOUT_HANDS_CATCH_ID) &&
    incompatibleWithWithoutHands.length > 0
  ) {
    throw new UserInputError(
      'Catch with 1 hand cannot combine with "Without the help of the hands" on the catch.',
    );
  }
}

export function calculateRiskValue(
  criteriaIds: string[],
  criteriaValues: Map<string, number>,
  totalRotationCount: number,
): number {
  const uniqueIds = normalizeRiskCriteriaIds(criteriaIds);
  let value = RISK_BASE_VALUE;

  for (const id of uniqueIds) {
    if (id === ROTATION_CRITERION_ID) {
      continue;
    }
    value += criteriaValues.get(id) ?? 0;
  }

  const additionalRotations = Math.max(0, totalRotationCount - MIN_BASE_ROTATIONS);
  value += additionalRotations * ROTATION_BONUS_VALUE;

  return Math.round(value * 100) / 100;
}
