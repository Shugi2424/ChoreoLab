export interface ScoringTimelineEntry {
  type: string;
  bodyElementId?: string | null;
  bodyElementConfig?: { rotationCount?: number; value?: number } | null;
  risk?: { value: number } | null;
  mastery?: { value: number; isAcro?: boolean } | null;
  artistryComponentId?: string | null;
}

/** Minimal routine shape needed for score calculation and persistence. */
export interface RoutineScoreTarget {
  ageCategory: string;
  timeline: readonly ScoringTimelineEntry[];
  dbScore: number;
  daScore: number;
  save(): Promise<unknown>;
  toObject(): Record<string, unknown>;
}

export interface RoutineValidationResult {
  isValid: boolean;
  dbValid: boolean;
  daValid: boolean;
  artistryValid: boolean;
  missingRequirements: Array<{
    id: string;
    domain: string;
    message: string;
  }>;
  warnings: Array<{
    id: string;
    domain: string;
    severity: string;
    message: string;
  }>;
  calculatedAt: Date;
}

/** Routine document fields updated on every timeline save. */
export interface RoutinePersistTarget extends RoutineScoreTarget {
  validation: RoutineValidationResult;
}
