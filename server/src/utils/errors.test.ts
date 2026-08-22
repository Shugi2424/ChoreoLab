import { describe, expect, it } from "vitest";
import type { GraphQLContext } from "../types/context.js";
import { AuthenticationError, requireAuth } from "./errors.js";

describe("requireAuth", () => {
  it("returns coachId when present", () => {
    const context: GraphQLContext = {
      coachId: "507f1f77bcf86cd799439011",
      jwtSecret: "secret",
      emailConfig: {
        clientUrl: "http://localhost:5173",
        resendApiKey: null,
        emailFrom: "test@example.com",
      },
    };
    expect(requireAuth(context)).toBe("507f1f77bcf86cd799439011");
  });

  it("throws AuthenticationError when coachId is null", () => {
    const context: GraphQLContext = {
      coachId: null,
      jwtSecret: "secret",
      emailConfig: {
        clientUrl: "http://localhost:5173",
        resendApiKey: null,
        emailFrom: "test@example.com",
      },
    };
    expect(() => requireAuth(context)).toThrow(AuthenticationError);
  });
});
