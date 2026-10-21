import { describe, expect, it } from "vitest";
import { toGraphQLRoutine, toGraphQLRoutineSummary } from "./mappers.js";

const baseDoc = {
  _id: { toString: () => "507f1f77bcf86cd799439011" },
  gymnastName: "Alex",
  apparatus: "hoop",
  ageCategory: "senior",
  dbScore: 1.2,
  daScore: 0.4,
  validation: {
    isValid: true,
    dbValid: true,
    daValid: true,
    artistryValid: true,
    missingRequirements: [],
    warnings: [],
    calculatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

describe("toGraphQLRoutineSummary", () => {
  it("does not map timeline items", () => {
    const doc = {
      ...baseDoc,
      timeline: [{ _id: { toString: () => "item-1" }, type: "body_element", order: 0 }],
    };

    const summary = toGraphQLRoutineSummary(doc);
    expect(summary).not.toHaveProperty("timeline");
    expect(summary.gymnastName).toBe("Alex");
    expect(summary.validation.isValid).toBe(true);
  });
});

describe("toGraphQLRoutine", () => {
  it("maps timeline items for builder responses", () => {
    const doc = {
      ...baseDoc,
      timeline: [
        {
          _id: { toString: () => "507f1f77bcf86cd799439012" },
          type: "body_element",
          order: 0,
          bodyElementId: "1.101",
        },
      ],
    };

    const routine = toGraphQLRoutine(doc);
    expect(routine.timeline).toHaveLength(1);
    expect(routine.timeline[0]?.id).toBe("507f1f77bcf86cd799439012");
  });
});
