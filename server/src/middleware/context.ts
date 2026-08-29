import type { Request } from "express";
import type { AppConfig } from "../config/env.js";
import type { GraphQLContext } from "../types/context.js";
import { getClientIp } from "./clientIp.js";
import { verifyToken } from "../utils/jwt.js";

export function buildGraphQLContext(
  req: Pick<Request, "ip" | "headers" | "socket">,
  config: Pick<
    AppConfig,
    "jwtSecret" | "clientUrl" | "resendApiKey" | "emailFrom"
  >,
): GraphQLContext {
  let coachId: string | null = null;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) {
      try {
        coachId = verifyToken(token, config.jwtSecret).coachId;
      } catch {
        coachId = null;
      }
    }
  }

  return {
    coachId,
    clientIp: getClientIp(req),
    jwtSecret: config.jwtSecret,
    emailConfig: {
      clientUrl: config.clientUrl,
      resendApiKey: config.resendApiKey,
      emailFrom: config.emailFrom,
    },
  };
}
