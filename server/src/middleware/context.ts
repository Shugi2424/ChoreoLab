import type { GraphQLContext } from "../types/context.js";
import { verifyToken } from "../utils/jwt.js";

export function buildGraphQLContext(
  req: { headers: { authorization?: string } },
  jwtSecret: string,
): GraphQLContext {
  let coachId: string | null = null;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) {
      try {
        coachId = verifyToken(token, jwtSecret).coachId;
      } catch {
        coachId = null;
      }
    }
  }

  return { coachId, jwtSecret };
}
