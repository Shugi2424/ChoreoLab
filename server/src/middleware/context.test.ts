import { describe, expect, it } from "vitest";
import { buildGraphQLContext } from "./context.js";
import { signToken } from "../utils/jwt.js";

const config = {
  jwtSecret: "context-test-secret",
  clientUrl: "http://localhost:5173",
  resendApiKey: null,
  emailFrom: "ChoreoLab <test@example.com>",
};

describe("buildGraphQLContext", () => {
  it("leaves coachId null when Authorization is missing", () => {
    const context = buildGraphQLContext({ headers: {} }, config);
    expect(context.coachId).toBeNull();
  });

  it("extracts coachId from a valid Bearer token", () => {
    const coachId = "507f1f77bcf86cd799439011";
    const token = signToken(coachId, config.jwtSecret);
    const context = buildGraphQLContext(
      { headers: { authorization: `Bearer ${token}` } },
      config,
    );
    expect(context.coachId).toBe(coachId);
  });

  it("leaves coachId null for invalid Bearer tokens", () => {
    const context = buildGraphQLContext(
      { headers: { authorization: "Bearer not-a-valid-token" } },
      config,
    );
    expect(context.coachId).toBeNull();
  });
});
