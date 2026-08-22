import { describe, expect, it } from "vitest";
import { getRiskCompositionError } from "@choreolab/shared/cop/riskValidation.js";
import { validateRiskComposition } from "./riskValidation.js";

describe("client riskValidation re-export", () => {
  it("matches shared getRiskCompositionError", () => {
    const input = {
      criteriaIds: ["catch-ball-one-hand", "passing-through-hoop"],
      rotations: [
        { rotationId: "v1-chain", count: 1 },
        { rotationId: "v1-passe", count: 1 },
      ],
    };
    expect(validateRiskComposition(input)).toBe(getRiskCompositionError(input));
  });
});
