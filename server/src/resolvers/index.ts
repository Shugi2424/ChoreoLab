import { BodyElement } from "../models/BodyElement.js";
import { Requirement } from "../models/Requirement.js";
import { Base, DACriteria, RCriteria, Rotation, ArtistryComponent } from "../models/reference.js";

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

    rCriteria: async (
      _: unknown,
      { apparatus, type }: { apparatus?: string; type?: string },
    ) => {
      const filter: Record<string, unknown> = {};
      if (apparatus) filter.apparatuses = apparatus;
      if (type) filter.type = type;
      const docs = await RCriteria.find(filter).sort({ id: 1 }).lean();
      return docs.map(toGraphQLRCriteria);
    },

    rCriterion: async (_: unknown, { id }: { id: string }) => {
      const doc = await RCriteria.findOne({ id }).lean();
      return doc ? toGraphQLRCriteria(doc) : null;
    },

    rotations: async (_: unknown, { group }: { group?: string }) => {
      const filter = group ? { group } : {};
      const docs = await Rotation.find(filter).sort({ id: 1 }).lean();
      return docs.map(toGraphQLRotation);
    },

    rotation: async (_: unknown, { id }: { id: string }) => {
      const doc = await Rotation.findOne({ id }).lean();
      return doc ? toGraphQLRotation(doc) : null;
    },

    artistryComponents: async (_: unknown, { type }: { type?: string }) => {
      const filter = type ? { type } : {};
      const docs = await ArtistryComponent.find(filter).sort({ id: 1 }).lean();
      return docs.map(toGraphQLArtistryComponent);
    },

    artistryComponent: async (_: unknown, { id }: { id: string }) => {
      const doc = await ArtistryComponent.findOne({ id }).lean();
      return doc ? toGraphQLArtistryComponent(doc) : null;
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

function toGraphQLRCriteria(doc: {
  id: string;
  name: string;
  type: string;
  value: number;
  apparatuses: string[];
}) {
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
    value: doc.value,
    apparatuses: doc.apparatuses,
  };
}

function toGraphQLRotation(doc: {
  id: string;
  name: string;
  group: string;
}) {
  return {
    id: doc.id,
    name: doc.name,
    group: doc.group,
  };
}

function toGraphQLArtistryComponent(doc: {
  id: string;
  name: string;
  type: string;
}) {
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
  };
}
