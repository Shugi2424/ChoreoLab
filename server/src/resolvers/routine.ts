import { referenceDataService } from "../services/referenceDataService.js";

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
