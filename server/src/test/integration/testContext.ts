import type { GraphQLContext } from "../../types/context.js";

const TEST_JWT_SECRET = "integration-test-jwt-secret";
const TEST_EMAIL_FROM = "ChoreoLab <test@example.com>";

export function buildIntegrationContext(
  coachId: string | null,
  clientIp = "127.0.0.1",
): GraphQLContext {
  return {
    coachId,
    clientIp,
    jwtSecret: TEST_JWT_SECRET,
    emailConfig: {
      clientUrl: "http://localhost:5173",
      resendApiKey: null,
      emailFrom: TEST_EMAIL_FROM,
    },
  };
}

export { TEST_JWT_SECRET };
