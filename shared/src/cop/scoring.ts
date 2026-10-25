// Scores show one decimal like on the sheet.
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

// Routine DB: take the best body values (one per element id) + best risks, up to senior/junior caps.
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

// Routine DA: same idea. Only the highest masteries count, up to the limit for that age.
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
