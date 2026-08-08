/** Regular high-throw catch base (CoP DA). */
export const CATCH_FROM_HIGH_THROW_BASE_ID = "catch-from-high-throw";

/**
 * Alternate catch bases that replace the regular high-throw catch —
 * cannot be combined with `catch-from-high-throw` in the same mastery.
 */
export const ALTERNATE_CATCH_BASE_IDS = [
  "catch-one-hand-high-throw",
  "catch-one-club-held",
  "simultaneous-catch-2-unlocked",
] as const;

export interface MasteryCompositionInput {
  baseIds: string[];
  criteriaIds: string[];
  rotationId?: string;
}

export function isAlternateCatchBase(id: string): boolean {
  return (ALTERNATE_CATCH_BASE_IDS as readonly string[]).includes(id);
}

export function validateMasteryBaseCombination(baseIds: string[]): string | null {
  if (
    baseIds.includes(CATCH_FROM_HIGH_THROW_BASE_ID) &&
    baseIds.some(isAlternateCatchBase)
  ) {
    return "Alternate catch bases (one-hand ball, club in same hand, or 2 clubs) cannot combine with Catch from a High Throw.";
  }
  return null;
}
