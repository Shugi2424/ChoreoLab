import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./jwt.js";

const SECRET = "test-jwt-secret";

describe("jwt", () => {
  it("round-trips coachId through sign and verify", () => {
    const token = signToken("507f1f77bcf86cd799439011", SECRET);
    expect(verifyToken(token, SECRET).coachId).toBe("507f1f77bcf86cd799439011");
  });

  it("rejects tampered tokens", () => {
    const token = signToken("coach-a", SECRET);
    expect(() => verifyToken(token, "wrong-secret")).toThrow();
  });
});
