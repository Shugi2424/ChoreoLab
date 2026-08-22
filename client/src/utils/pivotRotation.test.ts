import { describe, expect, it } from "vitest";
import {
  calculatePivotValue,
  getPivotRotationRule,
} from "@choreolab/shared/cop/pivotRotation.js";
import { calculatePivotValue as lenientCalculatePivotValue } from "./pivotRotation.js";

describe("client calculatePivotValue", () => {
  it("returns base value on invalid turn count instead of throwing", () => {
    const rule = getPivotRotationRule("3.1601", 0.1);
    expect(lenientCalculatePivotValue(0.1, rule, 0)).toBe(0.1);
    expect(calculatePivotValue(0.1, rule, 3)).toBe(0.3);
  });
});
