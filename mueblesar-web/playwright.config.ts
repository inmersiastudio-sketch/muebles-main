import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.E2E_API_BASE ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  webServer: {
    command: `npm run build && npm run start -- --hostname 0.0.0.0 --port ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    cwd: __dirname,
    stdout: 'pipe',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_BASE_URL: apiBase,
      NEXT_PUBLIC_API_BASE: apiBase,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
