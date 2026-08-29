import { Routine } from "../models/Routine.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import { assertObjectId } from "../utils/inputValidation.js";

export async function getRoutineDocForCoach(id: string, coachId: string) {
  const routineId = assertObjectId(id, "routine id");
  const routine = await Routine.findById(routineId);
  if (!routine) {
    throw new NotFoundError("Routine not found");
  }
  if (routine.coach.toString() !== coachId) {
    throw new ForbiddenError();
  }
  return routine;
}
