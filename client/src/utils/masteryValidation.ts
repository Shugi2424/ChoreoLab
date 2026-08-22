export {
  ALTERNATE_CATCH_BASE_IDS,
  CATCH_FROM_HIGH_THROW_BASE_ID,
  getMasteryBaseCombinationError,
  isAlternateCatchBase,
} from "@choreolab/shared/cop/masteryRules.js";

/** @deprecated Use getMasteryBaseCombinationError — kept for existing imports. */
export { getMasteryBaseCombinationError as validateMasteryBaseCombination } from "@choreolab/shared/cop/masteryRules.js";

export type MasteryCompositionInput = {
  baseIds: string[];
  criteriaIds: string[];
  rotationId?: string;
};
