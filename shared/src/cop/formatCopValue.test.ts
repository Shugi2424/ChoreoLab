import { describe, expect, it } from "vitest";
import { formatCopValue } from "./formatCopValue.js";

describe("formatCopValue", () => {
  it("formats to one decimal place", () => {
    expect(formatCopValue(0)).toBe("0.0");
    expect(formatCopValue(0.45)).toBe("0.5");
    expect(formatCopValue(1.24)).toBe("1.2");
  });
});
