/** Round to one decimal place (CoP display precision). */
export function roundCopScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export interface DbScoringLimits {
  maxElements: number;
  maxRisks: number;
}

export interface DaScoringLimits {
  maxMasteries: number;
}

/**
 * DB = highest-valued body elements (each id counted once) + highest-valued risks,
 * capped by age-category limits.
 */
export function calculateDBScore(
  bodyElementValues: number[],
  riskValues: number[],
  limits: DbScoringLimits,
): number {
  const countedBodies = [...bodyElementValues]
    .sort((a, b) => b - a)
    .slice(0, limits.maxElements);
  const countedRisks = [...riskValues].sort((a, b) => b - a).slice(0, limits.maxRisks);
  const total = [...countedBodies, ...countedRisks].reduce((sum, value) => sum + value, 0);
  return roundCopScore(total);
}

/** DA = highest-valued masteries, capped by age-category maxMasteries. */
export function calculateDAScore(
  masteryValues: number[],
  limits: DaScoringLimits,
): number {
  const counted = [...masteryValues]
    .sort((a, b) => b - a)
    .slice(0, limits.maxMasteries);
  const total = counted.reduce((sum, value) => sum + value, 0);
  return roundCopScore(total);
}
