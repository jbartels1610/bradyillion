import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3100';
export default defineConfig({
  testDir: './tests/e2e', timeout: 90_000, expect: { timeout: 15_000 },
  fullyParallel: false, workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL, headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : undefined,
  },
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'npm start', url: baseURL,
    reuseExistingServer: !process.env.CI, timeout: 120_000,
    env: { PORT: '3100', LOCAL_DATABASE_PATH: `/tmp/bradyillion-e2e-${process.pid}` },
  },
});
