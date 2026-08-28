import { BodyElement } from "../models/BodyElement.js";
import type { RoutinePersistTarget, ScoringTimelineEntry } from "../types/routineScoring.js";
import {
  calculateDAScore,
  calculateDBScore,
  type DaScoringLimits,
  type DbScoringLimits,
} from "../utils/scoring.js";
import type { RequirementsDocument } from "./requirementsCache.js";
import { getRequirementsByAgeCategory } from "./requirementsCache.js";
import type { TimelineCatalogMaps } from "./timelineCatalogCache.js";

function scoringLimitsFromRequirements(requirements: RequirementsDocument): {
  db: DbScoringLimits;
  da: DaScoringLimits;
} {
  return {
    db: {
      maxElements: requirements.DB.maxElements,
      maxRisks: requirements.DB.maxRisks,
    },
    da: {
      maxMasteries: requirements.DA.maxMasteries,
    },
  };
}

async function resolveBodyElementValues(
  timeline: readonly ScoringTimelineEntry[],
  catalogValues?: Map<string, number>,
): Promise<number[]> {
  const bodyItems = timeline.filter(
    (item) => item.type === "body_element" && item.bodyElementId,
  );

  if (bodyItems.length === 0) {
    return [];
  }

  let catalogValueById = catalogValues;

  if (!catalogValueById) {
    const idsNeedingCatalog = [
      ...new Set(
        bodyItems
          .filter((item) => item.bodyElementConfig?.value == null)
          .map((item) => item.bodyElementId as string),
      ),
    ];

    const catalogElements =
      idsNeedingCatalog.length > 0
        ? await BodyElement.find({ id: { $in: idsNeedingCatalog } }).lean()
        : [];
    catalogValueById = new Map(catalogElements.map((element) => [element.id, element.value]));
  }

  const maxValueByElementId = new Map<string, number>();

  for (const item of bodyItems) {
    const id = item.bodyElementId as string;
    const value = item.bodyElementConfig?.value ?? catalogValueById.get(id);
    if (value == null) {
      continue;
    }
    const existing = maxValueByElementId.get(id) ?? 0;
    maxValueByElementId.set(id, Math.max(existing, value));
  }

  return [...maxValueByElementId.values()];
}

function collectRiskValues(timeline: readonly ScoringTimelineEntry[]): number[] {
  return timeline
    .filter((item) => item.type === "risk" && item.risk)
    .map((item) => item.risk!.value);
}

function collectMasteryValues(timeline: readonly ScoringTimelineEntry[]): number[] {
  return timeline
    .filter((item) => item.type === "mastery" && item.mastery)
    .map((item) => item.mastery!.value);
}

interface ApplyScoresOptions {
  requirements?: RequirementsDocument;
  catalog?: TimelineCatalogMaps;
}

export const scoringService = {
  async calculateDB(
    timeline: readonly ScoringTimelineEntry[],
    ageCategory: string,
  ): Promise<number> {
    const requirements = await getRequirementsByAgeCategory(ageCategory);
    const { db: limits } = scoringLimitsFromRequirements(requirements);
    const bodyValues = await resolveBodyElementValues(timeline);
    const riskValues = collectRiskValues(timeline);
    return calculateDBScore(bodyValues, riskValues, limits);
  },

  async calculateDA(
    timeline: readonly ScoringTimelineEntry[],
    ageCategory: string,
  ): Promise<number> {
    const requirements = await getRequirementsByAgeCategory(ageCategory);
    const { da: limits } = scoringLimitsFromRequirements(requirements);
    const masteryValues = collectMasteryValues(timeline);
    return calculateDAScore(masteryValues, limits);
  },

  /** Recalculate and write dbScore / daScore on the routine document (does not save). */
  async applyScores(
    routine: RoutinePersistTarget,
    options?: ApplyScoresOptions,
  ): Promise<void> {
    const requirements =
      options?.requirements ?? (await getRequirementsByAgeCategory(routine.ageCategory));
    const { db: dbLimits, da: daLimits } = scoringLimitsFromRequirements(requirements);
    const timeline = routine.timeline;
    const bodyValues = await resolveBodyElementValues(
      timeline,
      options?.catalog?.bodyValueById,
    );
    routine.dbScore = calculateDBScore(bodyValues, collectRiskValues(timeline), dbLimits);
    routine.daScore = calculateDAScore(collectMasteryValues(timeline), daLimits);
  },
};
