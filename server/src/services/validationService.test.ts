import { beforeEach, describe, expect, it, vi } from "vitest";
import { validationService } from "./validationService.js";

const { mockRequirementLean, mockBodyElementLean, mockArtistryLean } = vi.hoisted(() => ({
  mockRequirementLean: vi.fn(),
  mockBodyElementLean: vi.fn(),
  mockArtistryLean: vi.fn(),
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

vi.mock("../models/reference.js", () => ({
  ArtistryComponent: {
    find: vi.fn(() => ({ lean: mockArtistryLean })),
  },
}));

const seniorRequirements = {
  DB: {
    minElements: 3,
    maxElements: 8,
    requiredElements: ["jump", "balance", "pivot"],
    maxRisks: 4,
  },
  DA: { minMasteries: 0, maxMasteries: 15, maxAcrobatics: 3 },
  A: { minCharacterMoves: 20, minDanceSteps: 2, minDynamicEffects: 2 },
};

describe("validationService", () => {
  beforeEach(() => {
    mockRequirementLean.mockReset();
    mockBodyElementLean.mockReset();
    mockArtistryLean.mockReset();
    mockRequirementLean.mockResolvedValue(seniorRequirements);
  });

  it("returns missing required body groups from seeded senior limits", async () => {
    mockBodyElementLean.mockResolvedValue([{ id: "1.101", category: "jump" }]);
    mockArtistryLean.mockResolvedValue([]);

    const result = await validationService.validateTimeline(
      [{ type: "body_element", bodyElementId: "1.101" }],
      "senior",
    );

    expect(result.dbValid).toBe(false);
    expect(result.missingRequirements.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["missing-balance", "missing-pivot"]),
    );
    expect(result.calculatedAt).toBeInstanceOf(Date);
  });

  it("normalizes mongoose-like timeline entries via toObject", async () => {
    mockBodyElementLean.mockResolvedValue([
      { id: "1.101", category: "jump" },
      { id: "2.101", category: "balance" },
      { id: "3.1601", category: "pivot" },
    ]);
    mockArtistryLean.mockResolvedValue([]);

    const timeline = [
      {
        toObject() {
          return {
            type: "body_element",
            bodyElementId: "1.101",
          };
        },
      },
      {
        toObject() {
          return {
            type: "body_element",
            bodyElementId: "2.101",
          };
        },
      },
      {
        toObject() {
          return {
            type: "body_element",
            bodyElementId: "3.1601",
          };
        },
      },
    ];

    const result = await validationService.validateTimeline(timeline, "senior");
    expect(result.dbValid).toBe(true);
  });

  it("applyValidation writes validation snapshot on routine", async () => {
    mockBodyElementLean.mockResolvedValue([]);
    mockArtistryLean.mockResolvedValue([]);

    const routine = {
      ageCategory: "senior",
      timeline: [],
      validation: undefined as unknown,
    };

    await validationService.applyValidation(routine);
    expect(routine.validation?.isValid).toBe(false);
    expect(routine.validation?.calculatedAt).toBeInstanceOf(Date);
  });
});
