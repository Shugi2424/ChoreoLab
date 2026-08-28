import { Routine } from "../models/Routine.js";
import { AGE_CATEGORIES, APPARATUS } from "../types/enums.js";
import { UserInputError } from "../utils/errors.js";
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
  const gymnastName = input.gymnastName?.trim();
  if (!gymnastName) {
    throw new UserInputError("Gymnast name is required.");
  }

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
    const gymnastName = input.gymnastName.trim();
    if (!gymnastName) {
      throw new UserInputError("Gymnast name is required.");
    }
    patch.gymnastName = gymnastName;
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

  /** Fresh scores/validation for display; does not write (preserves updatedAt sort order). */
  async listByCoach(coachId: string) {
    const docs = await Routine.find({ coach: coachId }).sort({ updatedAt: -1 });
    await Promise.all(
      docs.map((routine) =>
        applyDerivedRoutineFields(routine as unknown as RoutinePersistTarget),
      ),
    );
    return docs.map((doc) => toGraphQLRoutine(doc.toObject()));
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
