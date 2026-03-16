import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const fixturePath = fileURLToPath(
  new URL("./tests/fixtures/ensue/dashboard.json", import.meta.url),
);

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3404",
  },
  webServer: {
    command: "npm run dev -- --port 3404",
    env: {
      ENSUE_FIXTURE_PATH: fixturePath,
    },
    url: "http://localhost:3404",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
