import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH, validatePassword } from "./password.js";

describe("validatePassword", () => {
  it("requires minimum length", () => {
    expect(() => validatePassword("a1".padEnd(MIN_PASSWORD_LENGTH - 1, "b"))).toThrow(
      "at least",
    );
  });

  it("requires at least one letter and one number", () => {
    expect(() => validatePassword("abcdefgh")).toThrow("letter and one number");
    expect(() => validatePassword("12345678")).toThrow("letter and one number");
  });

  it("accepts a valid password", () => {
    expect(() => validatePassword("coach1234")).not.toThrow();
  });
});
