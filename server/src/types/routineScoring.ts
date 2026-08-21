export interface ScoringTimelineEntry {
  type: string;
  bodyElementId?: string | null;
  risk?: { value: number } | null;
  mastery?: { value: number } | null;
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
