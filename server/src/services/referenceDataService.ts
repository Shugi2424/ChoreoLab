import { BodyElement } from "../models/BodyElement.js";
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
  toGraphQLBodyElement,
  toGraphQLDACriteria,
  toGraphQLRCriteria,
  toGraphQLRequirement,
  toGraphQLRotation,
} from "../utils/mappers.js";
import { getRequirementsByAgeCategory } from "./requirementsCache.js";

type GraphQLBodyElement = ReturnType<typeof toGraphQLBodyElement>;
type GraphQLArtistryComponent = ReturnType<typeof toGraphQLArtistryComponent>;

const bodyElementById = new Map<string, GraphQLBodyElement | null>();
const artistryComponentById = new Map<string, GraphQLArtistryComponent | null>();
const listCache = new Map<string, unknown[]>();

function listCacheKey(prefix: string, parts: unknown[]): string {
  return `${prefix}:${JSON.stringify(parts)}`;
}

export const referenceDataService = {
  async listBodyElements(category?: string) {
    const key = listCacheKey("bodyElements", [category ?? null]);
    const cached = listCache.get(key);
    if (cached) {
      return cached as GraphQLBodyElement[];
    }

    const filter = category ? { category } : {};
    const docs = await BodyElement.find(filter).sort({ id: 1 }).lean();
    const result = docs.map(toGraphQLBodyElement);
    listCache.set(key, result);
    return result;
  },

  async getBodyElement(id: string) {
    if (bodyElementById.has(id)) {
      return bodyElementById.get(id)!;
    }

    const doc = await BodyElement.findOne({ id }).lean();
    const result = doc ? toGraphQLBodyElement(doc) : null;
    bodyElementById.set(id, result);
    return result;
  },

  async getRequirements(ageCategory: string) {
    const doc = await getRequirementsByAgeCategory(ageCategory);
    return toGraphQLRequirement(doc);
  },

  async listDACriteria() {
    const key = listCacheKey("daCriteria", []);
    const cached = listCache.get(key);
    if (cached) {
      return cached as ReturnType<typeof toGraphQLDACriteria>[];
    }

    const docs = await DACriteria.find().sort({ id: 1 }).lean();
    const result = docs.map(toGraphQLDACriteria);
    listCache.set(key, result);
    return result;
  },

  async getDACriterion(id: string) {
    const doc = await DACriteria.findOne({ id }).lean();
    return doc ? toGraphQLDACriteria(doc) : null;
  },

  async listBases(apparatus?: string) {
    const key = listCacheKey("bases", [apparatus ?? null]);
    const cached = listCache.get(key);
    if (cached) {
      return cached as ReturnType<typeof toGraphQLBase>[];
    }

    const filter = apparatus ? { apparatuses: apparatus } : {};
    const docs = await Base.find(filter).sort({ id: 1 }).lean();
    const result = docs.map(toGraphQLBase);
    listCache.set(key, result);
    return result;
  },

  async getBase(id: string) {
    const doc = await Base.findOne({ id }).lean();
    return doc ? toGraphQLBase(doc) : null;
  },

  async listRCriteria(apparatus?: string, type?: string) {
    const key = listCacheKey("rCriteria", [apparatus ?? null, type ?? null]);
    const cached = listCache.get(key);
    if (cached) {
      return cached as ReturnType<typeof toGraphQLRCriteria>[];
    }

    const filter: Record<string, unknown> = {};
    if (apparatus) filter.apparatuses = apparatus;
    if (type) filter.type = type;
    const docs = await RCriteria.find(filter).sort({ id: 1 }).lean();
    const result = docs.map(toGraphQLRCriteria);
    listCache.set(key, result);
    return result;
  },

  async getRCriterion(id: string) {
    const doc = await RCriteria.findOne({ id }).lean();
    return doc ? toGraphQLRCriteria(doc) : null;
  },

  async listRotations(group?: string) {
    const key = listCacheKey("rotations", [group ?? null]);
    const cached = listCache.get(key);
    if (cached) {
      return cached as ReturnType<typeof toGraphQLRotation>[];
    }

    const filter = group ? { group } : {};
    const docs = await Rotation.find(filter).sort({ id: 1 }).lean();
    const result = docs.map(toGraphQLRotation);
    listCache.set(key, result);
    return result;
  },

  async getRotation(id: string) {
    const doc = await Rotation.findOne({ id }).lean();
    return doc ? toGraphQLRotation(doc) : null;
  },

  async listArtistryComponents(type?: string) {
    const key = listCacheKey("artistry", [type ?? null]);
    const cached = listCache.get(key);
    if (cached) {
      return cached as GraphQLArtistryComponent[];
    }

    const filter = type ? { type } : {};
    const docs = await ArtistryComponent.find(filter).sort({ id: 1 }).lean();
    const result = docs.map(toGraphQLArtistryComponent);
    listCache.set(key, result);
    return result;
  },

  async getArtistryComponent(id: string) {
    if (artistryComponentById.has(id)) {
      return artistryComponentById.get(id)!;
    }

    const doc = await ArtistryComponent.findOne({ id }).lean();
    const result = doc ? toGraphQLArtistryComponent(doc) : null;
    artistryComponentById.set(id, result);
    return result;
  },
};
