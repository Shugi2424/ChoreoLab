import { Requirement } from "../models/Requirement.js";
import { toGraphQLRequirement } from "../utils/mappers.js";

export const requirementService = {
  async getByAgeCategory(ageCategory: string) {
    const doc = await Requirement.findOne({ ageCategory }).lean();
    return doc ? toGraphQLRequirement(doc) : null;
  },
};
