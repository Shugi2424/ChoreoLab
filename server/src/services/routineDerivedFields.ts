import type { RoutinePersistTarget } from "../types/routineScoring.js";
import { scoringService } from "./scoringService.js";
import { validationService } from "./validationService.js";

/** Recalculate dbScore, daScore, and validation from the current timeline (does not save). */
export async function applyDerivedRoutineFields(routine: RoutinePersistTarget): Promise<void> {
  await scoringService.applyScores(routine);
  await validationService.applyValidation(routine);
}
