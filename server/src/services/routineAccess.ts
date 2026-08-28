import { Routine } from "../models/Routine.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";

export async function getRoutineDocForCoach(id: string, coachId: string) {
  const routine = await Routine.findById(id);
  if (!routine) {
    throw new NotFoundError("Routine not found");
  }
  if (routine.coach.toString() !== coachId) {
    throw new ForbiddenError();
  }
  return routine;
}
