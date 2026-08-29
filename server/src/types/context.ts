import type { EmailConfig } from "../services/emailService.js";

export interface GraphQLContext {
  coachId: string | null;
  clientIp: string;
  jwtSecret: string;
  emailConfig: EmailConfig;
}
