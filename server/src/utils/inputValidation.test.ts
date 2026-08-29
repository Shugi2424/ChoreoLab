import { describe, expect, it } from "vitest";
import {
  assertEmail,
  assertNonEmptyString,
  assertObjectId,
  MAX_NAME_LENGTH,
} from "./inputValidation.js";

describe("inputValidation", () => {
  it("rejects empty required strings", () => {
    expect(() => assertNonEmptyString("  ", "First name", MAX_NAME_LENGTH)).toThrow(
      "First name is required",
    );
  });

  it("rejects strings over the max length", () => {
    expect(() =>
      assertNonEmptyString("a".repeat(MAX_NAME_LENGTH + 1), "First name", MAX_NAME_LENGTH),
    ).toThrow("First name is too long");
  });

  it("normalizes and validates email format", () => {
    expect(assertEmail("  Coach@Test.COM ")).toBe("coach@test.com");
    expect(() => assertEmail("not-an-email")).toThrow("Invalid email address");
  });

  it("rejects invalid MongoDB object ids", () => {
    expect(assertObjectId("507f1f77bcf86cd799439011", "routine id")).toBe(
      "507f1f77bcf86cd799439011",
    );
    expect(() => assertObjectId("not-an-id", "routine id")).toThrow("Invalid routine id");
  });
});
