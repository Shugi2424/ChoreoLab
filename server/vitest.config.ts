import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "seeds/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/utils/**", "src/services/**"],
      exclude: ["**/*.test.ts"],
    },
  },
});
