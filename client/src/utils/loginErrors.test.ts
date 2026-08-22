import { describe, expect, it } from "vitest";
import { getLoginErrorMessage } from "./loginErrors.js";

describe("getLoginErrorMessage", () => {
  it("surfaces network failures clearly", () => {
    expect(getLoginErrorMessage({ networkError: new Error("fetch failed") })).toBe(
      "Cannot reach the server. Make sure the API is running on port 4000.",
    );
  });

  it("returns GraphQL error messages when present", () => {
    expect(
      getLoginErrorMessage({
        graphQLErrors: [{ message: "Invalid email or password" }],
      }),
    ).toBe("Invalid email or password");
  });

  it("falls back to default invalid-credentials message", () => {
    expect(getLoginErrorMessage(new Error("unknown"))).toBe("Invalid email or password.");
  });
});
