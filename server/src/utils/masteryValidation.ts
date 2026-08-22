import {
  ALTERNATE_CATCH_BASE_IDS,
  CATCH_FROM_HIGH_THROW_BASE_ID,
  getMasteryBaseCombinationError,
} from "@choreolab/shared/cop/masteryRules.js";
import { Base } from "../models/reference.js";
import type { Apparatus } from "../types/enums.js";
import { UserInputError } from "./errors.js";

export { ALTERNATE_CATCH_BASE_IDS, CATCH_FROM_HIGH_THROW_BASE_ID as CATCH_FROM_HIGH_THROW_ID };

export interface MasteryInput {
  baseIds: string[];
  criteriaIds: string[];
  rotationId?: string;
}

export async function validateMasteryInput(
  input: MasteryInput,
  apparatus: string,
): Promise<MasteryInput> {
  const baseIds = input.baseIds ?? [];
  const criteriaIds = input.criteriaIds ?? [];

  if (baseIds.length < 1 || baseIds.length > 2) {
    throw new UserInputError("Mastery must have 1 or 2 bases.");
  }

  if (criteriaIds.length < 1 || criteriaIds.length > 2) {
    throw new UserInputError("Mastery must have 1 or 2 criteria.");
  }

  const totalParts = baseIds.length + criteriaIds.length;
  if (totalParts !== 3) {
    throw new UserInputError(
      "Mastery must be 1 base + 2 criteria, or 2 bases + 1 criterion.",
    );
  }

  const baseCombinationError = getMasteryBaseCombinationError(baseIds);
  if (baseCombinationError) {
    throw new UserInputError(baseCombinationError);
  }

  const bases = await Base.find({ id: { $in: baseIds } }).lean();
  if (bases.length !== baseIds.length) {
    throw new UserInputError("One or more bases were not found.");
  }

  for (const base of bases) {
    if (!base.apparatuses.includes(apparatus as Apparatus)) {
      throw new UserInputError(`Base "${base.name}" is not valid for this apparatus.`);
    }
  }

  const allowedCriteriaSets = bases.map((base) => new Set(base.allowedCriteria));
  for (const criterionId of criteriaIds) {
    const validForAnyBase = allowedCriteriaSets.some((set) => set.has(criterionId));
    if (!validForAnyBase) {
      throw new UserInputError(
        `Criterion "${criterionId}" is not allowed for the selected base(s).`,
      );
    }
  }

  if (baseIds.length === 2 && !baseIds.includes(CATCH_FROM_HIGH_THROW_BASE_ID)) {
    throw new UserInputError(
      "Two-base masteries must include Catch from a High Throw.",
    );
  }

  return {
    baseIds,
    criteriaIds,
    rotationId: input.rotationId,
  };
}

export async function calculateMasteryValue(
  baseIds: string[],
  criteriaIds: string[],
): Promise<number> {
  const bases = await Base.find({ id: { $in: baseIds } }).lean();
  if (bases.length === 0) {
    return 0;
  }

  if (baseIds.length === 1 && criteriaIds.length === 2) {
    return bases[0].value;
  }

  if (baseIds.length === 2 && criteriaIds.length === 1) {
    const highestBase = Math.max(...bases.map((base) => base.value));
    return highestBase + 0.1;
  }

  return Math.max(...bases.map((base) => base.value));
}
