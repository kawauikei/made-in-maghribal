import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    actionTimeout: 10_000,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-390x650',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 650 },
      },
    },
    {
      name: 'mobile-390x780',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 780 },
      },
    },
  ],
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
