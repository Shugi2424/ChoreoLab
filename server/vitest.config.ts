import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["src/test/integration/globalSetup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.integration.test.ts", "seeds/**/*.test.ts"],
    maxWorkers: 1,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/utils/**", "src/services/**"],
      exclude: ["**/*.test.ts"],
    },
  },
});
