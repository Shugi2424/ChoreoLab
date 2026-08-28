import { Requirement } from "../models/Requirement.js";
import { NotFoundError } from "../utils/errors.js";

export type RequirementsDocument = {
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
};

const cache = new Map<string, RequirementsDocument>();

export async function getRequirementsByAgeCategory(
  ageCategory: string,
): Promise<RequirementsDocument> {
  const cached = cache.get(ageCategory);
  if (cached) {
    return cached;
  }

  const doc = await Requirement.findOne({ ageCategory }).lean();
  if (!doc) {
    throw new NotFoundError(`Requirements not found for age category: ${ageCategory}`);
  }

  cache.set(ageCategory, doc as RequirementsDocument);
  return doc as RequirementsDocument;
}

/** For tests that mutate requirement seeds. */
export function clearRequirementsCache(): void {
  cache.clear();
}
