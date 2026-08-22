import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserInputError } from "./errors.js";
import { calculateMasteryValue, validateMasteryInput } from "./masteryValidation.js";

const { mockLean, mockFind } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockFind = vi.fn(() => ({ lean: mockLean }));
  return { mockLean, mockFind };
});

vi.mock("../models/reference.js", () => ({
  Base: { find: mockFind },
}));

const catchFromHighThrow = {
  id: "catch-from-high-throw",
  name: "Catch from the flight of a high throw",
  value: 0.3,
  apparatuses: ["hoop", "ball", "clubs", "ribbon"],
  allowedCriteria: ["outside-visual-field", "without-hands", "rotation"],
};

const hoopBase = {
  id: "rotation-on-catch",
  name: "Rotation on the catch",
  value: 0.4,
  apparatuses: ["hoop"],
  allowedCriteria: ["rotation"],
};

describe("validateMasteryInput", () => {
  beforeEach(() => {
    mockFind.mockClear();
    mockLean.mockReset();
  });

  it("requires exactly 3 parts (1 base + 2 criteria or 2 bases + 1 criterion)", async () => {
    mockLean.mockResolvedValue([catchFromHighThrow]);
    await expect(
      validateMasteryInput(
        { baseIds: ["catch-from-high-throw"], criteriaIds: ["outside-visual-field"] },
        "hoop",
      ),
    ).rejects.toThrow(UserInputError);
  });

  it("rejects bases not valid for apparatus", async () => {
    mockLean.mockResolvedValue([{ ...hoopBase, apparatuses: ["ribbon"] }]);
    await expect(
      validateMasteryInput(
        {
          baseIds: ["rotation-on-catch"],
          criteriaIds: ["rotation", "outside-visual-field"],
        },
        "hoop",
      ),
    ).rejects.toThrow(/not valid for this apparatus/);
  });

  it("requires catch-from-high-throw for two-base masteries", async () => {
    mockLean.mockResolvedValue([catchFromHighThrow, hoopBase]);
    await expect(
      validateMasteryInput(
        {
          baseIds: ["rotation-on-catch", "catch-from-high-throw"],
          criteriaIds: ["rotation"],
        },
        "hoop",
      ),
    ).resolves.toBeDefined();
  });

  it("rejects alternate catch bases combined with catch-from-high-throw", async () => {
    mockLean.mockResolvedValue([
      catchFromHighThrow,
      {
        id: "catch-one-hand-high-throw",
        name: "Catch with 1 hand",
        value: 0.3,
        apparatuses: ["ball"],
        allowedCriteria: ["outside-visual-field"],
      },
    ]);
    await expect(
      validateMasteryInput(
        {
          baseIds: ["catch-from-high-throw", "catch-one-hand-high-throw"],
          criteriaIds: ["outside-visual-field"],
        },
        "ball",
      ),
    ).rejects.toThrow(/Alternate catch bases/);
  });
});

describe("calculateMasteryValue", () => {
  beforeEach(() => {
    mockFind.mockClear();
    mockLean.mockReset();
  });

  it("returns base value for 1 base + 2 criteria", async () => {
    mockLean.mockResolvedValue([catchFromHighThrow]);
    const value = await calculateMasteryValue(
      ["catch-from-high-throw"],
      ["outside-visual-field", "without-hands"],
    );
    expect(value).toBe(0.3);
  });

  it("returns highest base + 0.1 for 2 bases + 1 criterion", async () => {
    mockLean.mockResolvedValue([catchFromHighThrow, { ...hoopBase, value: 0.5 }]);
    const value = await calculateMasteryValue(
      ["catch-from-high-throw", "rotation-on-catch"],
      ["rotation"],
    );
    expect(value).toBe(0.6);
  });
});
