import type { EmailConfig } from "../services/emailService.js";

export interface GraphQLContext {
  coachId: string | null;
  jwtSecret: string;
  emailConfig: EmailConfig;
}
