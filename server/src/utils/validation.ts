import { validateFouetteBodyElements } from "./fouetteValidation.js";

export interface MissingRequirement {
  id: string;
  domain: "db" | "da" | "a";
  message: string;
}

export interface ValidationWarning {
  id: string;
  domain: "db" | "da" | "a";
  severity: "warning" | "info";
  message: string;
}

export interface ValidationLimits {
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
}

export interface ValidationTimelineEntry {
  type: string;
  bodyElementId?: string | null;
  risk?: unknown;
  mastery?: { isAcro?: boolean } | null;
  artistryComponentId?: string | null;
}

export interface ValidationContext {
  limits: ValidationLimits;
  bodyElementCategoryById: Map<string, string>;
  artistryTypeById: Map<string, string>;
}

const BODY_GROUP_LABELS: Record<string, string> = {
  jump: "jump/leap",
  balance: "balance",
  pivot: "pivot/rotation",
};

export function validateRoutineTimeline(
  timeline: readonly ValidationTimelineEntry[],
  context: ValidationContext,
): {
  missingRequirements: MissingRequirement[];
  warnings: ValidationWarning[];
  dbValid: boolean;
  daValid: boolean;
  artistryValid: boolean;
  isValid: boolean;
} {
  const missing: MissingRequirement[] = [];
  const warnings: ValidationWarning[] = [];
  const { limits, bodyElementCategoryById, artistryTypeById } = context;

  const bodyCategoriesPresent = new Set<string>();
  let bodyElementCount = 0;
  let riskCount = 0;
  let masteryCount = 0;

  const artistryCounts = {
    character: 0,
    dance: 0,
    dynamicChange: 0,
    effect: 0,
  };

  let acroStreak = 0;
  let maxAcroStreak = 0;

  for (const item of timeline) {
    switch (item.type) {
      case "body_element": {
        bodyElementCount++;
        if (item.bodyElementId) {
          const category = bodyElementCategoryById.get(item.bodyElementId);
          if (category) {
            bodyCategoriesPresent.add(category);
          }
        }
        break;
      }
      case "risk":
        riskCount++;
        break;
      case "mastery": {
        masteryCount++;
        if (item.mastery?.isAcro) {
          acroStreak++;
          maxAcroStreak = Math.max(maxAcroStreak, acroStreak);
        } else {
          acroStreak = 0;
        }
        break;
      }
      case "artistry": {
        if (item.artistryComponentId) {
          const artType = artistryTypeById.get(item.artistryComponentId);
          if (artType === "character") {
            artistryCounts.character++;
          } else if (artType === "dance") {
            artistryCounts.dance++;
          } else if (artType === "dynamicChange") {
            artistryCounts.dynamicChange++;
          } else if (artType === "effect") {
            artistryCounts.effect++;
          }
        }
        break;
      }
    }
  }

  for (const category of limits.DB.requiredElements) {
    if (!bodyCategoriesPresent.has(category)) {
      const label = BODY_GROUP_LABELS[category] ?? category;
      missing.push({
        id: `missing-${category}`,
        domain: "db",
        message: `Add at least 1 ${label} body element.`,
      });
    }
  }

  if (bodyElementCount > limits.DB.maxElements) {
    missing.push({
      id: "excess-body-elements",
      domain: "db",
      message: `Too many body elements on timeline (${bodyElementCount}); only ${limits.DB.maxElements} count toward DB.`,
    });
  }

  if (riskCount > limits.DB.maxRisks) {
    missing.push({
      id: "excess-risks",
      domain: "db",
      message: `Too many risks on timeline (${riskCount}); only ${limits.DB.maxRisks} count toward DB.`,
    });
  }

  for (const fouetteIssue of validateFouetteBodyElements(timeline)) {
    missing.push({
      id: fouetteIssue.id,
      domain: "db",
      message: fouetteIssue.message,
    });
  }

  if (masteryCount < limits.DA.minMasteries) {
    missing.push({
      id: "min-masteries",
      domain: "da",
      message: `Add at least ${limits.DA.minMasteries} masteries (${masteryCount} on timeline).`,
    });
  }

  if (masteryCount > limits.DA.maxMasteries) {
    missing.push({
      id: "excess-masteries",
      domain: "da",
      message: `Too many masteries on timeline (${masteryCount}); only ${limits.DA.maxMasteries} count toward DA.`,
    });
  }

  if (maxAcroStreak > limits.DA.maxAcrobatics) {
    missing.push({
      id: "excess-consecutive-acrobatics",
      domain: "da",
      message: `Too many consecutive acrobatic masteries (${maxAcroStreak}); maximum is ${limits.DA.maxAcrobatics}.`,
    });
  }

  if (artistryCounts.character < limits.A.minCharacterMoves) {
    missing.push({
      id: "min-character-moves",
      domain: "a",
      message: `Add ${limits.A.minCharacterMoves - artistryCounts.character} more character moment(s) (${artistryCounts.character}/${limits.A.minCharacterMoves}).`,
    });
  }

  if (artistryCounts.dance < limits.A.minDanceSteps) {
    missing.push({
      id: "min-dance-steps",
      domain: "a",
      message: `Add ${limits.A.minDanceSteps - artistryCounts.dance} more dance combination(s) (${artistryCounts.dance}/${limits.A.minDanceSteps}).`,
    });
  }

  const dynamicTotal = artistryCounts.dynamicChange + artistryCounts.effect;
  if (dynamicTotal < limits.A.minDynamicEffects) {
    missing.push({
      id: "min-dynamic-effects",
      domain: "a",
      message: `Add ${limits.A.minDynamicEffects - dynamicTotal} more dynamic change(s) or effect(s) (${dynamicTotal}/${limits.A.minDynamicEffects}).`,
    });
  }

  const dbValid = !missing.some((entry) => entry.domain === "db");
  const daValid = !missing.some((entry) => entry.domain === "da");
  const artistryValid = !missing.some((entry) => entry.domain === "a");

  if (bodyElementCount < limits.DB.maxElements && !missing.some((e) => e.id === "excess-body-elements")) {
    warnings.push({
      id: "under-max-body-elements",
      domain: "db",
      severity: "info",
      message: `${bodyElementCount} of ${limits.DB.maxElements} body element slots used — more can count toward DB if added.`,
    });
  }

  if (riskCount < limits.DB.maxRisks && !missing.some((e) => e.id === "excess-risks")) {
    warnings.push({
      id: "under-max-risks",
      domain: "db",
      severity: "info",
      message: `${riskCount} of ${limits.DB.maxRisks} risk slots used — more can count toward DB if added.`,
    });
  }

  if (
    masteryCount < limits.DA.maxMasteries &&
    !missing.some((e) => e.id === "excess-masteries")
  ) {
    warnings.push({
      id: "under-max-masteries",
      domain: "da",
      severity: "info",
      message: `${masteryCount} of ${limits.DA.maxMasteries} mastery slots used — more can count toward DA if added.`,
    });
  }

  return {
    missingRequirements: missing,
    warnings,
    dbValid,
    daValid,
    artistryValid,
    isValid: dbValid && daValid && artistryValid,
  };
}
