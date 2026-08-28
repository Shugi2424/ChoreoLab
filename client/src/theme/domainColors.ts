/** CoP domain accent colors — distinct from the app brand violet. */
export const DOMAIN_COLORS = {
  db: "#3B82F6",
  /** Bright violet — apparatus / DA (mastery), matched to DB and artistry saturation. */
  da: "#8B5CF6",
  /** Teal — artistry (A). */
  a: "#0EA5A4",
} as const;

export type CopDomain = keyof typeof DOMAIN_COLORS;
