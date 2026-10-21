import { referenceDataService } from "../services/referenceDataService.js";

export const routineResolvers = {
  timeline: (parent: { timeline?: unknown[] }) =>
    Array.isArray(parent.timeline) ? parent.timeline : [],
};

export const validationResultResolvers = {
  calculatedAt: (parent: { calculatedAt?: Date | string }) => {
    if (typeof parent.calculatedAt === "string") {
      return parent.calculatedAt;
    }
    return parent.calculatedAt?.toISOString() ?? new Date().toISOString();
  },
  missingRequirements: (parent: {
    missingRequirements?: Array<{ id: string; domain: string; message: string }>;
  }) => parent.missingRequirements ?? [],
  warnings: (parent: {
    warnings?: Array<{ id: string; domain: string; severity: string; message: string }>;
  }) => parent.warnings ?? [],
};

export const routineItemResolvers = {
  bodyElement: (item: { bodyElementId?: string | null }) =>
    item.bodyElementId
      ? referenceDataService.getBodyElement(item.bodyElementId)
      : null,

  artistryComponent: (item: { artistryComponentId?: string | null }) =>
    item.artistryComponentId
      ? referenceDataService.getArtistryComponent(item.artistryComponentId)
      : null,
};
