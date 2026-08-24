/**
 * Authentication setup — logs in as super-admin and saves session state.
 * Other test files in the 'cms' group reuse this authenticated state.
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '.auth', 'admin.json');

setup('authenticate as super-admin', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill login form with default super-admin credentials
  await page.fill('input[type="email"], input[name="email"]', 'admin@cms.test');
  await page.fill('input[type="password"], input[name="password"]', 'password123');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/cms/dashboard', { timeout: 15000 });

  // Verify we're on the dashboard
  await expect(page).toHaveURL(/\/cms\/dashboard/);

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
