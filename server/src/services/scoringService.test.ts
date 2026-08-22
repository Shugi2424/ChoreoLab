import { beforeEach, describe, expect, it, vi } from "vitest";
import { scoringService } from "./scoringService.js";

const { mockRequirementLean, mockBodyElementLean } = vi.hoisted(() => ({
  mockRequirementLean: vi.fn(),
  mockBodyElementLean: vi.fn(),
}));

vi.mock("../models/Requirement.js", () => ({
  Requirement: {
    findOne: vi.fn(() => ({ lean: mockRequirementLean })),
  },
}));

vi.mock("../models/BodyElement.js", () => ({
  BodyElement: {
    find: vi.fn(() => ({ lean: mockBodyElementLean })),
  },
}));

describe("scoringService", () => {
  beforeEach(() => {
    mockRequirementLean.mockReset();
    mockBodyElementLean.mockReset();
    mockRequirementLean.mockResolvedValue({
      DB: { maxElements: 8, maxRisks: 4 },
      DA: { maxMasteries: 15 },
    });
  });

  it("calculateDB uses stored pivot values and deduplicates body elements", async () => {
    mockBodyElementLean.mockResolvedValue([]);
    const timeline = [
      {
        type: "body_element" as const,
        bodyElementId: "3.1601",
        bodyElementConfig: { value: 0.3, rotationCount: 3 },
      },
      {
        type: "body_element" as const,
        bodyElementId: "3.1601",
        bodyElementConfig: { value: 0.2, rotationCount: 2 },
      },
      { type: "risk" as const, risk: { value: 0.5 } },
      { type: "risk" as const, risk: { value: 0.4 } },
    ];

    const score = await scoringService.calculateDB(timeline, "senior");
    expect(score).toBe(1.2);
  });

  it("calculateDA sums top masteries up to age-category limit", async () => {
    const timeline = [
      { type: "mastery" as const, mastery: { value: 0.5 } },
      { type: "mastery" as const, mastery: { value: 0.3 } },
    ];
    const score = await scoringService.calculateDA(timeline, "senior");
    expect(score).toBe(0.8);
  });

  it("applyScores writes dbScore and daScore on the routine", async () => {
    mockBodyElementLean.mockResolvedValue([{ id: "1.101", value: 0.1 }]);
    const routine = {
      ageCategory: "senior",
      timeline: [
        { type: "body_element", bodyElementId: "1.101" },
        { type: "mastery", mastery: { value: 0.4 } },
      ],
      dbScore: 0,
      daScore: 0,
    };

    await scoringService.applyScores(routine);
    expect(routine.dbScore).toBe(0.1);
    expect(routine.daScore).toBe(0.4);
  });
});
