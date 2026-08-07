import { BodyElement } from "../models/BodyElement.js";
import { Requirement } from "../models/Requirement.js";
import { Base, DACriteria } from "../models/reference.js";

export const resolvers = {
  Query: {
    health: () => "ChoreoLab API is running",

    bodyElements: async (
      _: unknown,
      { category }: { category?: string },
    ) => {
      const filter = category ? { category } : {};
      const docs = await BodyElement.find(filter).sort({ id: 1 }).lean();
      return docs.map(toGraphQLBodyElement);
    },

    bodyElement: async (_: unknown, { id }: { id: string }) => {
      const doc = await BodyElement.findOne({ id }).lean();
      return doc ? toGraphQLBodyElement(doc) : null;
    },

    requirements: async (
      _: unknown,
      { ageCategory }: { ageCategory: string },
    ) => {
      const doc = await Requirement.findOne({ ageCategory }).lean();
      return doc ? toGraphQLRequirement(doc) : null;
    },

    daCriteria: async () => {
      const docs = await DACriteria.find().sort({ id: 1 }).lean();
      return docs.map(toGraphQLDACriteria);
    },

    daCriterion: async (_: unknown, { id }: { id: string }) => {
      const doc = await DACriteria.findOne({ id }).lean();
      return doc ? toGraphQLDACriteria(doc) : null;
    },

    bases: async (_: unknown, { apparatus }: { apparatus?: string }) => {
      const filter = apparatus ? { apparatuses: apparatus } : {};
      const docs = await Base.find(filter).sort({ id: 1 }).lean();
      return docs.map(toGraphQLBase);
    },

    base: async (_: unknown, { id }: { id: string }) => {
      const doc = await Base.findOne({ id }).lean();
      return doc ? toGraphQLBase(doc) : null;
    },
  },
};

function toGraphQLBodyElement(doc: {
  id: string;
  name: string;
  category: string;
  value: number;
}) {
  return {
    id: doc.id,
    name: doc.name,
    category: doc.category,
    value: doc.value,
  };
}

function toGraphQLRequirement(doc: {
  id: string;
  ageCategory: string;
  DB: {
    minElements: number;
    maxElements: number;
    requiredElements: string[];
    maxRisks: number;
  };
  DA: {
    minMasteries: number;
    maxMasteries: number;
    maxAcrobatics: number;
  };
  A: {
    minCharacterMoves: number;
    minDanceSteps: number;
    minDynamicEffects: number;
  };
}) {
  return {
    id: doc.id,
    ageCategory: doc.ageCategory,
    DB: doc.DB,
    DA: doc.DA,
    A: doc.A,
  };
}

function toGraphQLDACriteria(doc: { id: string; name: string }) {
  return { id: doc.id, name: doc.name };
}

function toGraphQLBase(doc: {
  id: string;
  name: string;
  value: number;
  apparatuses: string[];
  allowedCriteria: string[];
}) {
  return {
    id: doc.id,
    name: doc.name,
    value: doc.value,
    apparatuses: doc.apparatuses,
    allowedCriteria: doc.allowedCriteria,
  };
}
