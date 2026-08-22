import { BodyElement } from "../models/BodyElement.js";
import { ArtistryComponent } from "../models/reference.js";
import { Requirement } from "../models/Requirement.js";
import type { RoutinePersistTarget } from "../types/routineScoring.js";
import { NotFoundError } from "../utils/errors.js";
import {
  validateRoutineTimeline,
  type ValidationTimelineEntry,
} from "../utils/validation.js";

async function loadRequirements(ageCategory: string) {
  const requirements = await Requirement.findOne({ ageCategory }).lean();
  if (!requirements) {
    throw new NotFoundError(`Requirements not found for age category: ${ageCategory}`);
  }
  return requirements;
}

async function buildValidationContext(
  timeline: readonly ValidationTimelineEntry[],
  ageCategory: string,
) {
  const requirements = await loadRequirements(ageCategory);

  const bodyElementIds = [
    ...new Set(
      timeline
        .filter((item) => item.type === "body_element" && item.bodyElementId)
        .map((item) => item.bodyElementId as string),
    ),
  ];

  const artistryIds = [
    ...new Set(
      timeline
        .filter((item) => item.type === "artistry" && item.artistryComponentId)
        .map((item) => item.artistryComponentId as string),
    ),
  ];

  const [bodyElements, artistryComponents] = await Promise.all([
    bodyElementIds.length > 0
      ? BodyElement.find({ id: { $in: bodyElementIds } }).lean()
      : Promise.resolve([]),
    artistryIds.length > 0
      ? ArtistryComponent.find({ id: { $in: artistryIds } }).lean()
      : Promise.resolve([]),
  ]);

  return {
    limits: {
      DB: requirements.DB,
      DA: requirements.DA,
      A: requirements.A,
    },
    bodyElementCategoryById: new Map(bodyElements.map((element) => [element.id, element.category])),
    artistryTypeById: new Map(
      artistryComponents.map((component) => [component.id, component.type]),
    ),
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

export const validationService = {
  async validateTimeline(timeline: readonly unknown[], ageCategory: string) {
    const normalizedTimeline = await toValidationTimeline(timeline);
    const context = await buildValidationContext(normalizedTimeline, ageCategory);
    const result = validateRoutineTimeline(normalizedTimeline, context);
    return {
      ...result,
      calculatedAt: new Date(),
    };
  },

  async applyValidation(routine: RoutinePersistTarget): Promise<void> {
    const result = await this.validateTimeline(routine.timeline, routine.ageCategory);
    routine.validation = {
      isValid: result.isValid,
      dbValid: result.dbValid,
      daValid: result.daValid,
      artistryValid: result.artistryValid,
      missingRequirements: result.missingRequirements,
      warnings: result.warnings,
      calculatedAt: result.calculatedAt,
    };
  },
};
