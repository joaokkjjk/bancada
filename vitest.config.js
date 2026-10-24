import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js", "tests/integracao/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["src/logica/**", "src/i18n/index.js"],
      reporter: ["text", "lcov", "json-summary"],
      thresholds: { lines: 95, functions: 100, branches: 90 },
    },
  },
});
