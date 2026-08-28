import type { RoutinePersistTarget } from "../types/routineScoring.js";
import {
  validateRoutineTimeline,
  type ValidationTimelineEntry,
} from "../utils/validation.js";
import type { RequirementsDocument } from "./requirementsCache.js";
import { getRequirementsByAgeCategory } from "./requirementsCache.js";
import { loadTimelineCatalogMaps, type TimelineCatalogMaps } from "./timelineCatalogCache.js";

function buildValidationContextFromCatalog(
  requirements: RequirementsDocument,
  catalog: TimelineCatalogMaps,
) {
  return {
    limits: {
      DB: requirements.DB,
      DA: requirements.DA,
      A: requirements.A,
    },
    bodyElementCategoryById: catalog.bodyCategoryById,
    artistryTypeById: catalog.artistryTypeById,
  };
}

async function toValidationTimeline(
  timeline: readonly unknown[],
): Promise<ValidationTimelineEntry[]> {
  return timeline.map((item) => {
    const raw =
      typeof (item as { toObject?: () => ValidationTimelineEntry }).toObject === "function"
        ? (item as { toObject: () => ValidationTimelineEntry }).toObject()
        : (item as ValidationTimelineEntry);
    return {
      type: raw.type,
      bodyElementId: raw.bodyElementId ?? null,
      risk: raw.risk ?? null,
      mastery: raw.mastery ?? null,
      artistryComponentId: raw.artistryComponentId ?? null,
    };
  });
}

interface ApplyValidationOptions {
  requirements?: RequirementsDocument;
  catalog?: TimelineCatalogMaps;
}

export const validationService = {
  async validateTimeline(timeline: readonly unknown[], ageCategory: string) {
    const normalizedTimeline = await toValidationTimeline(timeline);
    const requirements = await getRequirementsByAgeCategory(ageCategory);
    const catalog = await loadTimelineCatalogMaps(normalizedTimeline);
    const context = buildValidationContextFromCatalog(requirements, catalog);
    const result = validateRoutineTimeline(normalizedTimeline, context);
    return {
      ...result,
      calculatedAt: new Date(),
    };
  },

  async applyValidation(
    routine: RoutinePersistTarget,
    options?: ApplyValidationOptions,
  ): Promise<void> {
    const normalizedTimeline = await toValidationTimeline(routine.timeline);
    const requirements =
      options?.requirements ??
      (await getRequirementsByAgeCategory(routine.ageCategory));
    const catalog =
      options?.catalog ?? (await loadTimelineCatalogMaps(normalizedTimeline));
    const context = buildValidationContextFromCatalog(requirements, catalog);
    const result = validateRoutineTimeline(normalizedTimeline, context);
    routine.validation = {
      isValid: result.isValid,
      dbValid: result.dbValid,
      daValid: result.daValid,
      artistryValid: result.artistryValid,
      missingRequirements: result.missingRequirements,
      warnings: result.warnings,
      calculatedAt: new Date(),
    };
  },
};
