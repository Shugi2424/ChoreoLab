import { describe, expect, it } from "vitest";
import { calculateDBScore, calculateDAScore, roundCopScore } from "./scoring.js";

describe("roundCopScore", () => {
  it("rounds to one decimal place", () => {
    expect(roundCopScore(0.44)).toBe(0.4);
    expect(roundCopScore(0.45)).toBe(0.5);
    expect(roundCopScore(1.25)).toBe(1.3);
  });
});

describe("calculateDBScore", () => {
  it("sums top body elements and risks within limits", () => {
    const bodies = [0.1, 0.3, 0.2, 0.5, 0.4, 0.1, 0.2, 0.3, 0.6];
    const risks = [0.4, 0.5, 0.3, 0.2, 0.6];
    const score = calculateDBScore(bodies, risks, { maxElements: 8, maxRisks: 4 });
    expect(score).toBe(4.4);
  });

  it("returns 0 for empty arrays", () => {
    expect(calculateDBScore([], [], { maxElements: 8, maxRisks: 4 })).toBe(0);
  });
});

describe("calculateDAScore", () => {
  it("sums top masteries within maxMasteries", () => {
    const values = Array.from({ length: 20 }, (_, index) => 0.1 + index * 0.05);
    const score = calculateDAScore(values, { maxMasteries: 15 });
    const top15 = [...values].sort((a, b) => b - a).slice(0, 15);
    const expected = Math.round(top15.reduce((sum, value) => sum + value, 0) * 10) / 10;
    expect(score).toBe(expected);
  });

  it("returns 0 when no masteries", () => {
    expect(calculateDAScore([], { maxMasteries: 15 })).toBe(0);
  });
});
