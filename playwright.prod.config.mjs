import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/debug-production.spec.mjs",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4273",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4273 --strictPort",
    url: "http://127.0.0.1:4273",
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
