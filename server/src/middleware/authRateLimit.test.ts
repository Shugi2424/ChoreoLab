import { afterEach, describe, expect, it } from "vitest";
import { assertAuthRateLimit, clearAuthRateLimits } from "./authRateLimit.js";

describe("authRateLimit", () => {
  afterEach(() => {
    clearAuthRateLimits();
  });

  it("allows attempts under the limit", () => {
    expect(() => assertAuthRateLimit("203.0.113.1", "login")).not.toThrow();
    expect(() => assertAuthRateLimit("203.0.113.1", "login")).not.toThrow();
  });

  it("blocks attempts over the login limit", () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      assertAuthRateLimit("203.0.113.9", "login");
    }

    expect(() => assertAuthRateLimit("203.0.113.9", "login")).toThrow(
      "Too many attempts",
    );
  });

  it("tracks limits separately per IP", () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      assertAuthRateLimit("203.0.113.10", "login");
    }

    expect(() => assertAuthRateLimit("203.0.113.11", "login")).not.toThrow();
  });
});
