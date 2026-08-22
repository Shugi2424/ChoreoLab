import { describe, expect, it } from "vitest";
import {
  calculateRiskValue,
  getRiskCompositionError,
  MIN_BASE_ROTATIONS,
  WITHOUT_HANDS_CATCH_ID,
} from "./riskValidation.js";

const twoRotations = [
  { rotationId: "v1-chain", count: 1 },
  { rotationId: "v1-passe", count: 1 },
];

describe("getRiskCompositionError", () => {
  it("requires at least 2 rotations", () => {
    expect(
      getRiskCompositionError({
        criteriaIds: [],
        rotations: [{ rotationId: "v1-chain", count: 1 }],
      }),
    ).toMatch(/at least 2 rotations/);
  });

  it("requires without-hands throw when throw-after-roll is selected", () => {
    expect(
      getRiskCompositionError({
        criteriaIds: ["throw-after-roll-on-floor"],
        rotations: twoRotations,
      }),
    ).toMatch(/Without the help of the hands.*throw/);
  });

  it("allows at most one direct catch criterion", () => {
    expect(
      getRiskCompositionError({
        criteriaIds: ["catch-ball-one-hand", "passing-through-hoop"],
        rotations: twoRotations,
      }),
    ).toMatch(/Only one direct catch criterion/);
  });

  it("returns null for valid composition", () => {
    expect(
      getRiskCompositionError({
        criteriaIds: ["outside-visual-field-catch"],
        rotations: twoRotations,
      }),
    ).toBeNull();
  });
});

describe("calculateRiskValue", () => {
  it("applies base value, criteria, and rotation bonus", () => {
    const criteriaValues = new Map<string, number>([["outside-visual-field-catch", 0.1]]);
    const totalRotations = 4;
    const value = calculateRiskValue(
      ["outside-visual-field-catch"],
      criteriaValues,
      totalRotations,
    );
    const additional = Math.max(0, totalRotations - MIN_BASE_ROTATIONS);
    expect(value).toBe(0.2 + 0.1 + additional * 0.1);
  });
});

void WITHOUT_HANDS_CATCH_ID;
