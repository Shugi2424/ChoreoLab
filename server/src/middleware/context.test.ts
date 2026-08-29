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
    const context = buildGraphQLContext({ headers: {}, ip: "127.0.0.1" }, config);
    expect(context.coachId).toBeNull();
    expect(context.clientIp).toBe("127.0.0.1");
  });

  it("extracts coachId from a valid Bearer token", () => {
    const coachId = "507f1f77bcf86cd799439011";
    const token = signToken(coachId, config.jwtSecret);
    const context = buildGraphQLContext(
      { headers: { authorization: `Bearer ${token}` }, ip: "127.0.0.1" },
      config,
    );
    expect(context.coachId).toBe(coachId);
  });

  it("leaves coachId null for invalid Bearer tokens", () => {
    const context = buildGraphQLContext(
      { headers: { authorization: "Bearer not-a-valid-token" }, ip: "127.0.0.1" },
      config,
    );
    expect(context.coachId).toBeNull();
  });

  it("prefers the first x-forwarded-for address behind a proxy", () => {
    const context = buildGraphQLContext(
      {
        headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
        ip: "10.0.0.1",
      },
      config,
    );
    expect(context.clientIp).toBe("203.0.113.5");
  });
});
