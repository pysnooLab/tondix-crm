import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for demo mode (FakeRest data provider).
 * Run with: npx playwright test --config playwright.demo.config.ts
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.demo.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    actionTimeout: 5000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI && { channel: "chromium-headless-shell" }),
      },
    },
  ],
});
