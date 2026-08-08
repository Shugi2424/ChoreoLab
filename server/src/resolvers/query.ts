import { authService } from "../services/authService.js";
import { referenceDataService } from "../services/referenceDataService.js";
import { routineService } from "../services/routineService.js";
import type { GraphQLContext } from "../types/context.js";
import { AuthenticationError, requireAuth } from "../utils/errors.js";

export const queryResolvers = {
  health: () => "ChoreoLab API is running",

  me: async (_: unknown, __: unknown, context: GraphQLContext) => {
    const coachId = requireAuth(context);
    const coach = await authService.getCoachById(coachId);
    if (!coach) {
      throw new AuthenticationError();
    }
    return coach;
  },

  bodyElements: (
    _: unknown,
    { category }: { category?: string },
    context: GraphQLContext,
  ) => {
    requireAuth(context);
    return referenceDataService.listBodyElements(category);
  },

  bodyElement: (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    requireAuth(context);
    return referenceDataService.getBodyElement(id);
  },

  requirements: (
    _: unknown,
    { ageCategory }: { ageCategory: string },
    context: GraphQLContext,
  ) => {
    requireAuth(context);
    return referenceDataService.getRequirements(ageCategory);
  },

  daCriteria: (_: unknown, __: unknown, context: GraphQLContext) => {
    requireAuth(context);
    return referenceDataService.listDACriteria();
  },

  daCriterion: (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    requireAuth(context);
    return referenceDataService.getDACriterion(id);
  },

  bases: (
    _: unknown,
    { apparatus }: { apparatus?: string },
    context: GraphQLContext,
  ) => {
    requireAuth(context);
    return referenceDataService.listBases(apparatus);
  },

  base: (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    requireAuth(context);
    return referenceDataService.getBase(id);
  },

  rCriteria: (
    _: unknown,
    { apparatus, type }: { apparatus?: string; type?: string },
    context: GraphQLContext,
  ) => {
    requireAuth(context);
    return referenceDataService.listRCriteria(apparatus, type);
  },

  rCriterion: (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    requireAuth(context);
    return referenceDataService.getRCriterion(id);
  },

  rotations: (
    _: unknown,
    { group }: { group?: string },
    context: GraphQLContext,
  ) => {
    requireAuth(context);
    return referenceDataService.listRotations(group);
  },

  rotation: (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    requireAuth(context);
    return referenceDataService.getRotation(id);
  },

  artistryComponents: (
    _: unknown,
    { type }: { type?: string },
    context: GraphQLContext,
  ) => {
    requireAuth(context);
    return referenceDataService.listArtistryComponents(type);
  },

  artistryComponent: (
    _: unknown,
    { id }: { id: string },
    context: GraphQLContext,
  ) => {
    requireAuth(context);
    return referenceDataService.getArtistryComponent(id);
  },

  routines: (_: unknown, __: unknown, context: GraphQLContext) => {
    const coachId = requireAuth(context);
    return routineService.listByCoach(coachId);
  },

  routine: (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
    const coachId = requireAuth(context);
    return routineService.getById(coachId, id);
  },
};
