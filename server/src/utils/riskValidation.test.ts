import { describe, expect, it } from "vitest";
import { UserInputError } from "./errors.js";
import { calculateRiskValue, MIN_BASE_ROTATIONS, validateRiskComposition } from "./riskValidation.js";

const twoRotations = [
  { rotationId: "v1-chain", count: 1 },
  { rotationId: "v1-passe", count: 1 },
];

describe("validateRiskComposition (server wrapper)", () => {
  it("throws UserInputError when shared rules fail", () => {
    expect(() =>
      validateRiskComposition({
        criteriaIds: [],
        rotations: [{ rotationId: "v1-chain", count: 1 }],
      }),
    ).toThrow(UserInputError);
  });

  it("does not throw for valid composition", () => {
    expect(() =>
      validateRiskComposition({
        criteriaIds: ["outside-visual-field-catch"],
        rotations: twoRotations,
      }),
    ).not.toThrow();
  });
});

describe("calculateRiskValue re-export", () => {
  it("delegates to shared implementation", () => {
    const criteriaValues = new Map<string, number>([["outside-visual-field-catch", 0.1]]);
    const value = calculateRiskValue(["outside-visual-field-catch"], criteriaValues, 4);
    expect(value).toBe(0.2 + 0.1 + 2 * 0.1);
  });
});

void MIN_BASE_ROTATIONS;
