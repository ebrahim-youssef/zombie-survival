import {defineConfig} from "@playwright/test";

export default defineConfig({
  testDir:"./e2e",
  testIgnore:"**/debug-production.spec.mjs",
  timeout:30_000,
  expect:{timeout:10_000},
  retries:process.env.CI?1:0,
  use:{
    baseURL:"http://127.0.0.1:4173",
    trace:"retain-on-failure",
  },
  webServer:{
    command:"npm run dev -- --host 127.0.0.1 --port 4173",
    url:"http://127.0.0.1:4173",
    timeout:90_000,
    reuseExistingServer:!process.env.CI,
  },
});
