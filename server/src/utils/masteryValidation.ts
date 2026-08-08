import { Base } from "../models/reference.js";
import type { Apparatus } from "../types/enums.js";
import { UserInputError } from "./errors.js";

const CATCH_FROM_HIGH_THROW_ID = "catch-from-high-throw";

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

  if (baseIds.length === 2 && !baseIds.includes(CATCH_FROM_HIGH_THROW_ID)) {
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

export async function calculateMasteryValue(baseIds: string[]): Promise<number> {
  const bases = await Base.find({ id: { $in: baseIds } }).lean();
  return bases.reduce((sum, base) => sum + base.value, 0);
}
