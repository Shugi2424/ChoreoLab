import { BodyElement } from "../models/BodyElement.js";
import { Requirement } from "../models/Requirement.js";
import type { RoutinePersistTarget, ScoringTimelineEntry } from "../types/routineScoring.js";
import { NotFoundError } from "../utils/errors.js";
import {
  calculateDAScore,
  calculateDBScore,
  type DaScoringLimits,
  type DbScoringLimits,
} from "../utils/scoring.js";

async function loadScoringLimits(ageCategory: string): Promise<{
  db: DbScoringLimits;
  da: DaScoringLimits;
}> {
  const requirements = await Requirement.findOne({ ageCategory }).lean();
  if (!requirements) {
    throw new NotFoundError(`Requirements not found for age category: ${ageCategory}`);
  }

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
): Promise<number[]> {
  const bodyItems = timeline.filter(
    (item) => item.type === "body_element" && item.bodyElementId,
  );

  if (bodyItems.length === 0) {
    return [];
  }

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
  const catalogValueById = new Map(catalogElements.map((element) => [element.id, element.value]));

  const maxValueByElementId = new Map<string, number>();

  for (const item of bodyItems) {
    const id = item.bodyElementId as string;
    const value =
      item.bodyElementConfig?.value ?? catalogValueById.get(id);
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

export const scoringService = {
  async calculateDB(
    timeline: readonly ScoringTimelineEntry[],
    ageCategory: string,
  ): Promise<number> {
    const { db: limits } = await loadScoringLimits(ageCategory);
    const bodyValues = await resolveBodyElementValues(timeline);
    const riskValues = collectRiskValues(timeline);
    return calculateDBScore(bodyValues, riskValues, limits);
  },

  async calculateDA(
    timeline: readonly ScoringTimelineEntry[],
    ageCategory: string,
  ): Promise<number> {
    const { da: limits } = await loadScoringLimits(ageCategory);
    const masteryValues = collectMasteryValues(timeline);
    return calculateDAScore(masteryValues, limits);
  },

  /** Recalculate and write dbScore / daScore on the routine document (does not save). */
  async applyScores(routine: RoutinePersistTarget): Promise<void> {
    const timeline = routine.timeline;
    const [dbScore, daScore] = await Promise.all([
      this.calculateDB(timeline, routine.ageCategory),
      this.calculateDA(timeline, routine.ageCategory),
    ]);
    routine.dbScore = dbScore;
    routine.daScore = daScore;
  },
};
