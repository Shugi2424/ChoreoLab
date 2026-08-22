export {
  DIRECT_CATCH_CRITERIA_IDS,
  getRiskCompositionError,
  isDirectCatchCriterion,
  isWithoutHandsIncompatibleCatch,
  MIN_BASE_ROTATIONS,
  normalizeRiskCriteriaIds,
  THROW_AFTER_ROLL_ON_FLOOR_ID,
  WITHOUT_HANDS_CATCH_ID,
  WITHOUT_HANDS_THROW_ID,
  type RiskCompositionInput,
} from "@choreolab/shared/cop/riskValidation.js";

/** @deprecated Use getRiskCompositionError — kept for existing imports. */
export { getRiskCompositionError as validateRiskComposition } from "@choreolab/shared/cop/riskValidation.js";
