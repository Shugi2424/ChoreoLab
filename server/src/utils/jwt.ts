import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  coachId: string;
}

export function signToken(coachId: string, secret: string): string {
  return jwt.sign({ coachId }, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  const payload = jwt.verify(token, secret);
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("coachId" in payload) ||
    typeof payload.coachId !== "string"
  ) {
    throw new Error("Invalid token payload");
  }
  return { coachId: payload.coachId };
}
