import { describe, expect, it } from "vitest";
import {
  isFouetteBalanceBodyElement,
  isFouettePivotBodyElement,
  validateFouetteBodyElements,
} from "./fouetteValidation.js";

describe("isFouettePivotBodyElement", () => {
  it("matches CoP prefix 3.160", () => {
    expect(isFouettePivotBodyElement("3.1601")).toBe(true);
    expect(isFouettePivotBodyElement("3.1609")).toBe(true);
    expect(isFouettePivotBodyElement("3.1701")).toBe(false);
  });
});

describe("isFouetteBalanceBodyElement", () => {
  it("matches CoP prefix 2.180", () => {
    expect(isFouetteBalanceBodyElement("2.1803")).toBe(true);
    expect(isFouetteBalanceBodyElement("2.1805")).toBe(true);
    expect(isFouetteBalanceBodyElement("2.1701")).toBe(false);
  });
});

describe("validateFouetteBodyElements", () => {
  it("allows one pivot and one balance together", () => {
    const issues = validateFouetteBodyElements([
      { type: "body_element", bodyElementId: "3.1601" },
      { type: "body_element", bodyElementId: "2.1803" },
    ]);
    expect(issues).toHaveLength(0);
  });

  it("flags duplicate fouetté pivots", () => {
    const issues = validateFouetteBodyElements([
      { type: "body_element", bodyElementId: "3.1601" },
      { type: "body_element", bodyElementId: "3.1602" },
    ]);
    expect(issues.map((issue) => issue.id)).toContain("multiple-fouette-pivots");
  });

  it("flags duplicate fouetté balances", () => {
    const issues = validateFouetteBodyElements([
      { type: "body_element", bodyElementId: "2.1803" },
      { type: "body_element", bodyElementId: "2.1805" },
    ]);
    expect(issues.map((issue) => issue.id)).toContain("multiple-fouette-balances");
  });

  it("ignores non-body-element timeline entries", () => {
    const issues = validateFouetteBodyElements([
      { type: "risk" },
      { type: "body_element", bodyElementId: "3.1601" },
    ]);
    expect(issues).toHaveLength(0);
  });
});
