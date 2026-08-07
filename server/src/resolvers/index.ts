import { bodyElementService } from "../services/bodyElementService.js";
import { requirementService } from "../services/requirementService.js";
import { referenceDataService } from "../services/referenceDataService.js";

export const resolvers = {
  Query: {
    health: () => "ChoreoLab API is running",

    bodyElements: (_: unknown, { category }: { category?: string }) =>
      bodyElementService.list(category),

    bodyElement: (_: unknown, { id }: { id: string }) => bodyElementService.getById(id),

    requirements: (_: unknown, { ageCategory }: { ageCategory: string }) =>
      requirementService.getByAgeCategory(ageCategory),

    daCriteria: () => referenceDataService.listDACriteria(),

    daCriterion: (_: unknown, { id }: { id: string }) =>
      referenceDataService.getDACriterion(id),

    bases: (_: unknown, { apparatus }: { apparatus?: string }) =>
      referenceDataService.listBases(apparatus),

    base: (_: unknown, { id }: { id: string }) => referenceDataService.getBase(id),

    rCriteria: (
      _: unknown,
      { apparatus, type }: { apparatus?: string; type?: string },
    ) => referenceDataService.listRCriteria(apparatus, type),

    rCriterion: (_: unknown, { id }: { id: string }) =>
      referenceDataService.getRCriterion(id),

    rotations: (_: unknown, { group }: { group?: string }) =>
      referenceDataService.listRotations(group),

    rotation: (_: unknown, { id }: { id: string }) =>
      referenceDataService.getRotation(id),

    artistryComponents: (_: unknown, { type }: { type?: string }) =>
      referenceDataService.listArtistryComponents(type),

    artistryComponent: (_: unknown, { id }: { id: string }) =>
      referenceDataService.getArtistryComponent(id),
  },
};
