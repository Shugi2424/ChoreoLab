import {
  calculateRiskValue,
  DIRECT_CATCH_CRITERIA_IDS,
  getRiskCompositionError,
  isDirectCatchCriterion,
  isStandardCatchCriterion,
  MIN_BASE_ROTATIONS,
  normalizeRiskCriteriaIds,
  RISK_BASE_VALUE,
  ROTATION_BONUS_VALUE,
  ROTATION_CRITERION_ID,
  STANDARD_CATCH_CRITERIA_IDS,
  THROW_AFTER_ROLL_ON_FLOOR_ID,
  WITHOUT_HANDS_CATCH_ID,
  WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS,
  WITHOUT_HANDS_THROW_ID,
  type DirectCatchCriteriaId,
  type RiskCompositionInput,
  type RiskRotationInput,
} from "@choreolab/shared/cop/riskValidation.js";
import { UserInputError } from "./errors.js";

export {
  calculateRiskValue,
  DIRECT_CATCH_CRITERIA_IDS,
  isDirectCatchCriterion,
  isStandardCatchCriterion,
  MIN_BASE_ROTATIONS,
  normalizeRiskCriteriaIds,
  RISK_BASE_VALUE,
  ROTATION_BONUS_VALUE,
  ROTATION_CRITERION_ID,
  STANDARD_CATCH_CRITERIA_IDS,
  THROW_AFTER_ROLL_ON_FLOOR_ID,
  WITHOUT_HANDS_CATCH_ID,
  WITHOUT_HANDS_INCOMPATIBLE_CATCH_IDS,
  WITHOUT_HANDS_THROW_ID,
  type DirectCatchCriteriaId,
  type RiskCompositionInput,
  type RiskRotationInput,
};

export type RiskInput = RiskCompositionInput;

export function validateRiskComposition(input: RiskCompositionInput): void {
  const error = getRiskCompositionError(input);
  if (error) {
    throw new UserInputError(error);
  }
}
