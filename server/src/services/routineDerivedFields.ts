import type { RoutinePersistTarget } from "../types/routineScoring.js";
import { getRequirementsByAgeCategory } from "./requirementsCache.js";
import { scoringService } from "./scoringService.js";
import { loadTimelineCatalogMaps } from "./timelineCatalogCache.js";
import { validationService } from "./validationService.js";

// After any timeline change: refresh scores + validation panel, then persist elsewhere.
export async function applyDerivedRoutineFields(routine: RoutinePersistTarget): Promise<void> {
  const requirements = await getRequirementsByAgeCategory(routine.ageCategory);
  const catalog = await loadTimelineCatalogMaps(routine.timeline);

  await scoringService.applyScores(routine, { requirements, catalog });
  await validationService.applyValidation(routine, { requirements, catalog });
}
