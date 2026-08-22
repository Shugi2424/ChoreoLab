import { roundCopScore } from "@choreolab/shared/cop/scoring.js";
import {
  calculatePivotValue as calculatePivotValueStrict,
  formatPivotRotationHint,
  getPivotRotationRule,
  validatePivotTurnCount,
  type PivotRotationRule,
  type PivotTurnUnit,
} from "@choreolab/shared/cop/pivotRotation.js";

export {
  formatPivotRotationHint,
  getPivotRotationRule,
  validatePivotTurnCount,
  type PivotRotationRule,
  type PivotTurnUnit,
};

/** Lenient preview while the rotation field is being edited (invalid input → base value). */
export function calculatePivotValue(
  baseValue: number,
  rule: PivotRotationRule,
  turnCount: number,
): number {
  try {
    return calculatePivotValueStrict(baseValue, rule, turnCount);
  } catch {
    return roundCopScore(baseValue);
  }
}
