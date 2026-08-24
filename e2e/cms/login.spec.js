import { test, expect } from '@playwright/test';

// The cms-chromium project normally restores an admin session. Login coverage must
// always begin as a guest so it can exercise the complete authentication flow.
test.use({ storageState: { cookies: [], origins: [] } });

const adminCredentials = {
  email: 'admin@cms.test',
  password: 'password123',
};

async function login(page) {
  await page.goto('/login');
  await page.locator('#email').fill(adminCredentials.email);
  await page.locator('#password').fill(adminCredentials.password);
  await page.getByRole('button', { name: /masuk|sign in/i }).click();
}

test.describe('CMS login', () => {
  test('displays email and password fields', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /selamat datang|welcome/i })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('shows a validation error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('invalid@example.test');
    await page.locator('#password').fill('invalid-password');
    await page.getByRole('button', { name: /masuk|sign in/i }).click();

    await expect(page.getByText(/email atau password salah/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logs in successfully with valid credentials', async ({ page }) => {
    await login(page);

    await expect(page.getByRole('heading', { name: /selamat datang|welcome/i })).toBeVisible();
  });

  test('redirects to the dashboard after login', async ({ page }) => {
    await login(page);

    await expect(page).toHaveURL(/\/cms\/dashboard$/);
  });

  test('shows a logout button when authenticated', async ({ page }) => {
    await login(page);
    await page.locator('header .relative > button').click();

    await expect(page.getByRole('button', { name: /keluar|logout/i })).toBeVisible();
  });

  test('logs out successfully', async ({ page }) => {
    await login(page);
    await page.locator('header .relative > button').click();
    await page.getByRole('button', { name: /keluar|logout/i }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#email')).toBeVisible();
  });
});
