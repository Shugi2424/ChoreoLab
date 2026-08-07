import { Routine } from "../models/Routine.js";
import { AGE_CATEGORIES, APPARATUS } from "../types/enums.js";
import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from "../utils/errors.js";
import { toGraphQLRoutine } from "../utils/mappers.js";

export interface CreateRoutineInput {
  gymnastName: string;
  apparatus: string;
  ageCategory: string;
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

async function getRoutineDocForCoach(id: string, coachId: string) {
  const routine = await Routine.findById(id);
  if (!routine) {
    throw new NotFoundError("Routine not found");
  }
  if (routine.coach.toString() !== coachId) {
    throw new ForbiddenError();
  }
  return routine;
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
    return toGraphQLRoutine(doc.toObject());
  },

  async listByCoach(coachId: string) {
    const docs = await Routine.find({ coach: coachId })
      .sort({ updatedAt: -1 })
      .lean();
    return docs.map(toGraphQLRoutine);
  },

  async getById(coachId: string, id: string) {
    const routine = await getRoutineDocForCoach(id, coachId);
    return toGraphQLRoutine(routine.toObject());
  },

  async delete(coachId: string, id: string) {
    const routine = await getRoutineDocForCoach(id, coachId);
    await routine.deleteOne();
    return { message: "Routine deleted." };
  },
};
