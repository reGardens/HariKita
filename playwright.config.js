// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for WeddingApp
 *
 * Test targets:
 * - CMS Admin Panel (Laravel Inertia) → http://localhost:8090
 * - Public Invitation SPA (Vue Router) → http://localhost:8090/wedding/{slug}
 * - Vite Dev Server (for frontend-only tests) → http://localhost:5173
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: 'http://localhost:8090',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup project for authentication state
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },

    // CMS Admin tests (require auth)
    {
      name: 'cms-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /cms\/.*\.spec\.js/,
    },

    // Public invitation tests (no auth required)
    {
      name: 'invitation-chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /invitation\/.*\.spec\.js/,
    },

    // Mobile viewport tests
    {
      name: 'invitation-mobile',
      use: {
        ...devices['iPhone 13'],
      },
      testMatch: /invitation\/.*\.spec\.js/,
    },
  ],

  /* Run Laravel + Vite dev servers before tests */
  webServer: [
    {
      command: 'php artisan serve --port=8090',
      url: 'http://localhost:8090',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
