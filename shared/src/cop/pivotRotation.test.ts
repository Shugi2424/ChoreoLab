import { describe, expect, it } from "vitest";
import {
  calculatePivotValue,
  getPivotRotationRule,
  validatePivotTurnCount,
} from "./pivotRotation.js";

describe("getPivotRotationRule", () => {
  it("returns no increment for fixed-value pivots", () => {
    const rule = getPivotRotationRule("3.2101", 0.3);
    expect(rule.incrementPerTurn).toBeNull();
  });

  it("returns +0.1 per extra 360° for fouetté prefix", () => {
    const rule = getPivotRotationRule("3.1601", 0.1);
    expect(rule.turnUnit).toBe("360");
    expect(rule.incrementPerTurn).toBe(0.1);
  });

  it("returns +0.1 per extra 360° for split back without help (3.1105.x, CoP §12.10)", () => {
    for (const id of ["3.1105.1", "3.1105.2", "3.1105.3"]) {
      const rule = getPivotRotationRule(id, 0.5);
      expect(rule.incrementPerTurn).toBe(0.1);
      expect(calculatePivotValue(0.5, rule, 2)).toBe(0.6);
    }
  });

  it("returns +0.1 per extra 360° for back split without help foot above head (3.1005)", () => {
    const rule = getPivotRotationRule("3.1005", 0.5);
    expect(rule.incrementPerTurn).toBe(0.1);
    expect(calculatePivotValue(0.5, rule, 3)).toBe(0.7);
  });

  it("uses +0.2 for back split with help (3.1003)", () => {
    const rule = getPivotRotationRule("3.1003", 0.3);
    expect(rule.incrementPerTurn).toBe(0.2);
  });
});

describe("calculatePivotValue", () => {
  it("adds increment for extra fouetté turns", () => {
    const rule = getPivotRotationRule("3.1601", 0.1);
    expect(calculatePivotValue(0.1, rule, 1)).toBe(0.1);
    expect(calculatePivotValue(0.1, rule, 3)).toBe(0.3);
  });

  it("rejects invalid turn counts", () => {
    const rule = getPivotRotationRule("3.1601", 0.1);
    expect(() => calculatePivotValue(0.1, rule, 0)).toThrow();
  });
});

describe("validatePivotTurnCount", () => {
  it("rejects extra turns when pivot has fixed value", () => {
    const rule = getPivotRotationRule("3.2101", 0.3);
    expect(validatePivotTurnCount(rule, 2)).toMatch(/does not award extra value/);
  });
});
