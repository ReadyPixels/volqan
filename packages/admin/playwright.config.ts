import { defineConfig, devices } from '@playwright/test';

/**
 * Product-design regression suite for the Volqan admin panel.
 *
 * Run with a live database:
 *   E2E_EMAIL=admin@example.com E2E_PASSWORD=... pnpm --filter @volqan/admin test:e2e
 *
 * The dev server is started automatically unless E2E_BASE_URL points at a
 * running instance.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile|a11y/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3001',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
