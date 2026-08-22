import { describe, expect, it } from "vitest";
import { seniorContext, SENIOR_LIMITS } from "../test/fixtures/requirements.js";
import { validateRoutineTimeline } from "./validation.js";

describe("validateRoutineTimeline", () => {
  const bodyMaps = new Map([
    ["1.101", "jump"],
    ["2.101", "balance"],
    ["3.1601", "pivot"],
  ]);

  const artistryMaps = new Map([
    ["char-1", "character"],
    ["dance-1", "dance"],
    ["dyn-1", "dynamicChange"],
    ["effect-1", "effect"],
  ]);

  it("flags missing required body groups", () => {
    const result = validateRoutineTimeline(
      [{ type: "body_element", bodyElementId: "1.101" }],
      seniorContext({ bodyElementCategoryById: bodyMaps }),
    );
    expect(result.dbValid).toBe(false);
    expect(result.missingRequirements.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["missing-balance", "missing-pivot"]),
    );
  });

  it("flags excess body elements beyond maxElements", () => {
    const timeline = Array.from({ length: 9 }, (_, index) => ({
      type: "body_element" as const,
      bodyElementId: `1.10${index}`,
    }));
    const categories = new Map(timeline.map((item, index) => [item.bodyElementId!, "jump"]));
    categories.set("2.101", "balance");
    categories.set("3.1601", "pivot");

    const result = validateRoutineTimeline(
      timeline,
      seniorContext({ bodyElementCategoryById: categories }),
    );
    expect(result.missingRequirements.some((entry) => entry.id === "excess-body-elements")).toBe(
      true,
    );
  });

  it("flags too many consecutive acrobatic masteries", () => {
    const timeline = Array.from({ length: 4 }, () => ({
      type: "mastery" as const,
      mastery: { isAcro: true },
    }));
    const result = validateRoutineTimeline(timeline, seniorContext());
    expect(result.missingRequirements.some((entry) => entry.id === "excess-consecutive-acrobatics")).toBe(
      true,
    );
  });

  it("flags fouetté duplicates", () => {
    const result = validateRoutineTimeline(
      [
        { type: "body_element", bodyElementId: "3.1601" },
        { type: "body_element", bodyElementId: "3.1602" },
      ],
      seniorContext({ bodyElementCategoryById: bodyMaps }),
    );
    expect(result.missingRequirements.some((entry) => entry.id === "multiple-fouette-pivots")).toBe(
      true,
    );
  });

  it("adds info warnings when under max countable slots", () => {
    const result = validateRoutineTimeline(
      [
        { type: "body_element", bodyElementId: "1.101" },
        { type: "body_element", bodyElementId: "2.101" },
        { type: "body_element", bodyElementId: "3.1601" },
        { type: "risk" },
      ],
      seniorContext({ bodyElementCategoryById: bodyMaps }),
    );
    expect(result.warnings.some((entry) => entry.id === "under-max-body-elements")).toBe(true);
    expect(result.warnings.some((entry) => entry.id === "under-max-risks")).toBe(true);
  });

  it("passes DB/DA when minimums met and artistry still pending", () => {
    const characterMoments = Array.from({ length: SENIOR_LIMITS.A.minCharacterMoves }, (_, index) => ({
      type: "artistry" as const,
      artistryComponentId: `char-${index}`,
    }));
    const timeline = [
      { type: "body_element" as const, bodyElementId: "1.101" },
      { type: "body_element" as const, bodyElementId: "2.101" },
      { type: "body_element" as const, bodyElementId: "3.1601" },
      ...characterMoments,
      { type: "artistry" as const, artistryComponentId: "dance-1" },
      { type: "artistry" as const, artistryComponentId: "dance-1" },
      { type: "artistry" as const, artistryComponentId: "dyn-1" },
      { type: "artistry" as const, artistryComponentId: "effect-1" },
    ];
    const artistryTypes = new Map<string, string>();
    for (let index = 0; index < SENIOR_LIMITS.A.minCharacterMoves; index++) {
      artistryTypes.set(`char-${index}`, "character");
    }
    artistryTypes.set("dance-1", "dance");
    artistryTypes.set("dyn-1", "dynamicChange");
    artistryTypes.set("effect-1", "effect");

    const result = validateRoutineTimeline(
      timeline,
      seniorContext({
        bodyElementCategoryById: bodyMaps,
        artistryTypeById: artistryTypes,
      }),
    );
    expect(result.dbValid).toBe(true);
    expect(result.daValid).toBe(true);
    expect(result.artistryValid).toBe(true);
    expect(result.isValid).toBe(true);
  });
});
