import { describe, expect, it } from "vitest";
import { getApiHealthUrl } from "./apiWarmup";

describe("getApiHealthUrl", () => {
  it("derives /health from a GraphQL URL", () => {
    expect(getApiHealthUrl("https://choreolab-api.onrender.com/graphql")).toBe(
      "https://choreolab-api.onrender.com/health",
    );
    expect(getApiHealthUrl("http://localhost:4000/graphql/")).toBe(
      "http://localhost:4000/health",
    );
  });

  it("falls back to localhost when the GraphQL URL is empty", () => {
    expect(getApiHealthUrl("")).toBe("http://localhost:4000/health");
  });
});
