import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "./env.js";

const BASE_ENV = {
  MONGODB_URI: "mongodb://localhost:27017/choreolab-test",
  JWT_SECRET: "test-jwt-secret-long-enough",
};

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const keys = Object.keys(overrides);
  const saved: Record<string, string | undefined> = {};
  for (const key of keys) {
    saved[key] = process.env[key];
    const value = overrides[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    fn();
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
  }
}

describe("loadConfig", () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.CORS_ORIGIN;
    delete process.env.CLIENT_URL;
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;
    delete process.env.PORT;
  });

  it("loads development defaults when optional vars are omitted", () => {
    withEnv({ ...BASE_ENV, NODE_ENV: "development" }, () => {
      const config = loadConfig();
      expect(config.corsOrigin).toBe("http://localhost:5173");
      expect(config.clientUrl).toBe("http://localhost:5173");
      expect(config.nodeEnv).toBe("development");
    });
  });

  it("requires MONGODB_URI", () => {
    withEnv({ JWT_SECRET: BASE_ENV.JWT_SECRET, MONGODB_URI: undefined }, () => {
      expect(() => loadConfig()).toThrow("MONGODB_URI");
    });
  });

  it("requires JWT_SECRET", () => {
    withEnv({ MONGODB_URI: BASE_ENV.MONGODB_URI, JWT_SECRET: undefined }, () => {
      expect(() => loadConfig()).toThrow("JWT_SECRET");
    });
  });

  it("rejects insecure JWT secret in production", () => {
    withEnv(
      {
        ...BASE_ENV,
        NODE_ENV: "production",
        JWT_SECRET: "change-me-to-a-long-random-secret",
        CORS_ORIGIN: "https://app.example.com",
        CLIENT_URL: "https://app.example.com",
      },
      () => {
        expect(() => loadConfig()).toThrow("JWT_SECRET must be changed");
      },
    );
  });

  it("requires CORS_ORIGIN and CLIENT_URL in production", () => {
    withEnv(
      {
        ...BASE_ENV,
        NODE_ENV: "production",
        CORS_ORIGIN: undefined,
        CLIENT_URL: undefined,
      },
      () => {
        expect(() => loadConfig()).toThrow("CORS_ORIGIN is required");
      },
    );

    withEnv(
      {
        ...BASE_ENV,
        NODE_ENV: "production",
        CORS_ORIGIN: "https://app.example.com",
        CLIENT_URL: undefined,
      },
      () => {
        expect(() => loadConfig()).toThrow("CLIENT_URL is required");
      },
    );
  });

  it("accepts valid production configuration", () => {
    withEnv(
      {
        ...BASE_ENV,
        NODE_ENV: "production",
        CORS_ORIGIN: "https://choreolab.vercel.app",
        CLIENT_URL: "https://choreolab.vercel.app",
        PORT: "10000",
      },
      () => {
        const config = loadConfig();
        expect(config.port).toBe(10000);
        expect(config.corsOrigin).toBe("https://choreolab.vercel.app");
        expect(config.clientUrl).toBe("https://choreolab.vercel.app");
        expect(config.nodeEnv).toBe("production");
      },
    );
  });
});
