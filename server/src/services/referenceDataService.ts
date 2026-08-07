import {
  ArtistryComponent,
  Base,
  DACriteria,
  RCriteria,
  Rotation,
} from "../models/reference.js";
import {
  toGraphQLArtistryComponent,
  toGraphQLBase,
  toGraphQLDACriteria,
  toGraphQLRCriteria,
  toGraphQLRotation,
} from "../utils/mappers.js";

export const referenceDataService = {
  async listDACriteria() {
    const docs = await DACriteria.find().sort({ id: 1 }).lean();
    return docs.map(toGraphQLDACriteria);
  },

  async getDACriterion(id: string) {
    const doc = await DACriteria.findOne({ id }).lean();
    return doc ? toGraphQLDACriteria(doc) : null;
  },

  async listBases(apparatus?: string) {
    const filter = apparatus ? { apparatuses: apparatus } : {};
    const docs = await Base.find(filter).sort({ id: 1 }).lean();
    return docs.map(toGraphQLBase);
  },

  async getBase(id: string) {
    const doc = await Base.findOne({ id }).lean();
    return doc ? toGraphQLBase(doc) : null;
  },

  async listRCriteria(apparatus?: string, type?: string) {
    const filter: Record<string, unknown> = {};
    if (apparatus) filter.apparatuses = apparatus;
    if (type) filter.type = type;
    const docs = await RCriteria.find(filter).sort({ id: 1 }).lean();
    return docs.map(toGraphQLRCriteria);
  },

  async getRCriterion(id: string) {
    const doc = await RCriteria.findOne({ id }).lean();
    return doc ? toGraphQLRCriteria(doc) : null;
  },

  async listRotations(group?: string) {
    const filter = group ? { group } : {};
    const docs = await Rotation.find(filter).sort({ id: 1 }).lean();
    return docs.map(toGraphQLRotation);
  },

  async getRotation(id: string) {
    const doc = await Rotation.findOne({ id }).lean();
    return doc ? toGraphQLRotation(doc) : null;
  },

  async listArtistryComponents(type?: string) {
    const filter = type ? { type } : {};
    const docs = await ArtistryComponent.find(filter).sort({ id: 1 }).lean();
    return docs.map(toGraphQLArtistryComponent);
  },

  async getArtistryComponent(id: string) {
    const doc = await ArtistryComponent.findOne({ id }).lean();
    return doc ? toGraphQLArtistryComponent(doc) : null;
  },
};
