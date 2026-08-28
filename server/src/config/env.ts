export interface AppConfig {
  port: number;
  mongodbUri: string;
  corsOrigin: string;
  nodeEnv: string;
  jwtSecret: string;
  clientUrl: string;
  resendApiKey: string | null;
  emailFrom: string;
}

const INSECURE_JWT_SECRETS = new Set([
  "change-me-to-a-long-random-secret",
  "secret",
  "jwt-secret",
]);

function assertProductionConfig(
  nodeEnv: string,
  jwtSecret: string,
  corsOrigin: string | undefined,
  clientUrl: string | undefined,
): void {
  if (nodeEnv !== "production") {
    return;
  }

  if (INSECURE_JWT_SECRETS.has(jwtSecret)) {
    throw new Error("JWT_SECRET must be changed from the default in production");
  }

  if (!corsOrigin?.trim()) {
    throw new Error(
      "CORS_ORIGIN is required in production (set to your Vercel app URL)",
    );
  }

  if (!clientUrl?.trim()) {
    throw new Error(
      "CLIENT_URL is required in production (set to your Vercel app URL for password reset links)",
    );
  }
}

export function loadConfig(): AppConfig {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const corsOrigin = process.env.CORS_ORIGIN;
  const clientUrl = process.env.CLIENT_URL;

  assertProductionConfig(nodeEnv, jwtSecret, corsOrigin, clientUrl);

  return {
    port: Number(process.env.PORT ?? 4000),
    mongodbUri,
    corsOrigin: corsOrigin?.trim() || "http://localhost:5173",
    nodeEnv,
    jwtSecret,
    clientUrl: clientUrl?.trim() || "http://localhost:5173",
    resendApiKey: process.env.RESEND_API_KEY?.trim() || null,
    emailFrom:
      process.env.EMAIL_FROM?.trim() || "ChoreoLab <onboarding@resend.dev>",
  };
}
