import { Routine } from "../models/Routine.js";
import { AGE_CATEGORIES, APPARATUS } from "../types/enums.js";
import { UserInputError } from "../utils/errors.js";
import {
  assertNonEmptyString,
  MAX_GYMNAST_NAME_LENGTH,
} from "../utils/inputValidation.js";
import type { RoutinePersistTarget } from "../types/routineScoring.js";
import { toGraphQLRoutine } from "../utils/mappers.js";
import { applyDerivedRoutineFields } from "./routineDerivedFields.js";
import { getRoutineDocForCoach } from "./routineAccess.js";

export interface CreateRoutineInput {
  gymnastName: string;
  apparatus: string;
  ageCategory: string;
}

export interface UpdateRoutineInput {
  gymnastName?: string;
  apparatus?: string;
  ageCategory?: string;
}

function validateCreateInput(input: CreateRoutineInput): CreateRoutineInput {
  const gymnastName = assertNonEmptyString(
    input.gymnastName,
    "Gymnast name",
    MAX_GYMNAST_NAME_LENGTH,
  );

  if (!APPARATUS.includes(input.apparatus as (typeof APPARATUS)[number])) {
    throw new UserInputError("Invalid apparatus.");
  }

  if (
    !AGE_CATEGORIES.includes(input.ageCategory as (typeof AGE_CATEGORIES)[number])
  ) {
    throw new UserInputError("Invalid age category.");
  }

  return {
    gymnastName,
    apparatus: input.apparatus,
    ageCategory: input.ageCategory,
  };
}

function validateUpdateInput(input: UpdateRoutineInput): UpdateRoutineInput {
  const patch: UpdateRoutineInput = {};

  if (input.gymnastName !== undefined) {
    patch.gymnastName = assertNonEmptyString(
      input.gymnastName,
      "Gymnast name",
      MAX_GYMNAST_NAME_LENGTH,
    );
  }

  if (input.apparatus !== undefined) {
    if (!APPARATUS.includes(input.apparatus as (typeof APPARATUS)[number])) {
      throw new UserInputError("Invalid apparatus.");
    }
    patch.apparatus = input.apparatus;
  }

  if (input.ageCategory !== undefined) {
    if (
      !AGE_CATEGORIES.includes(input.ageCategory as (typeof AGE_CATEGORIES)[number])
    ) {
      throw new UserInputError("Invalid age category.");
    }
    patch.ageCategory = input.ageCategory;
  }

  if (Object.keys(patch).length === 0) {
    throw new UserInputError("No routine fields to update.");
  }

  return patch;
}

export const routineService = {
  async create(coachId: string, input: CreateRoutineInput) {
    const validated = validateCreateInput(input);
    const doc = await Routine.create({
      coach: coachId,
      gymnastName: validated.gymnastName,
      apparatus: validated.apparatus,
      ageCategory: validated.ageCategory,
    });
    const persistTarget = doc as unknown as RoutinePersistTarget;
    await applyDerivedRoutineFields(persistTarget);
    await doc.save();
    return toGraphQLRoutine(doc.toObject());
  },

  async update(coachId: string, id: string, input: UpdateRoutineInput) {
    const patch = validateUpdateInput(input);
    const routine = await getRoutineDocForCoach(id, coachId);

    if (patch.gymnastName !== undefined) {
      routine.gymnastName = patch.gymnastName;
    }
    if (patch.apparatus !== undefined) {
      routine.apparatus = patch.apparatus as (typeof APPARATUS)[number];
    }
    if (patch.ageCategory !== undefined) {
      routine.ageCategory = patch.ageCategory as (typeof AGE_CATEGORIES)[number];
    }

    const persistTarget = routine as unknown as RoutinePersistTarget;
    await applyDerivedRoutineFields(persistTarget);
    await routine.save();
    return toGraphQLRoutine(routine.toObject());
  },

  /** Uses persisted scores/validation; recalculation happens on timeline mutations and getById. */
  async listByCoach(coachId: string) {
    const docs = await Routine.find({ coach: coachId }).sort({ updatedAt: -1 }).lean();
    return docs.map((doc) => toGraphQLRoutine(doc));
  },

  /** Fresh scores/validation for the builder; persisted on timeline mutations only. */
  async getById(coachId: string, id: string) {
    const routine = await getRoutineDocForCoach(id, coachId);
    await applyDerivedRoutineFields(routine as unknown as RoutinePersistTarget);
    return toGraphQLRoutine(routine.toObject());
  },

  async delete(coachId: string, id: string) {
    const routine = await getRoutineDocForCoach(id, coachId);
    await routine.deleteOne();
    return { message: "Routine deleted." };
  },
};
