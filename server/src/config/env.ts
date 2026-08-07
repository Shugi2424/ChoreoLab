export interface AppConfig {
  port: number;
  mongodbUri: string;
  corsOrigin: string;
  nodeEnv: string;
  jwtSecret: string;
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

  return {
    port: Number(process.env.PORT ?? 4000),
    mongodbUri,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV ?? "development",
    jwtSecret,
  };
}
