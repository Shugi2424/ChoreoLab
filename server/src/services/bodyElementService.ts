import { BodyElement } from "../models/BodyElement.js";
import { toGraphQLBodyElement } from "../utils/mappers.js";

export const bodyElementService = {
  async list(category?: string) {
    const filter = category ? { category } : {};
    const docs = await BodyElement.find(filter).sort({ id: 1 }).lean();
    return docs.map(toGraphQLBodyElement);
  },

  async getById(id: string) {
    const doc = await BodyElement.findOne({ id }).lean();
    return doc ? toGraphQLBodyElement(doc) : null;
  },
};
