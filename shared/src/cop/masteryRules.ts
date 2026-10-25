// Standard "catch from high throw" base. Required when you use 2 bases in one mastery.
export const CATCH_FROM_HIGH_THROW_BASE_ID = "catch-from-high-throw";

// Special catch bases. Pick one of these OR regular high throw, not both in the same mastery.
export const ALTERNATE_CATCH_BASE_IDS = [
  "catch-one-hand-high-throw",
  "catch-one-club-held",
  "simultaneous-catch-2-unlocked",
] as const;

export function isAlternateCatchBase(id: string): boolean {
  return (ALTERNATE_CATCH_BASE_IDS as readonly string[]).includes(id);
}

// Shared rule for client preview + server save. null = bases OK together.
export function getMasteryBaseCombinationError(baseIds: string[]): string | null {
  if (
    baseIds.includes(CATCH_FROM_HIGH_THROW_BASE_ID) &&
    baseIds.some(isAlternateCatchBase)
  ) {
    return "Alternate catch bases (one-hand ball, club in same hand, or 2 clubs) cannot combine with Catch from a High Throw.";
  }
  return null;
}
