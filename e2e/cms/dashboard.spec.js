import { test, expect } from '@playwright/test';

test.describe('CMS dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cms/dashboard');
  });

  test('displays the dashboard page', async ({ page }) => {
    await expect(page).toHaveURL(/\/cms\/dashboard$/);
    await expect(page.getByRole('heading', { name: /selamat datang|welcome/i })).toBeVisible();
  });

  test('shows stat cards for weddings, guests, and RSVP data', async ({ page }) => {
    await expect(page.getByText(/total undangan|total weddings/i)).toBeVisible();
    await expect(page.getByText(/^tamu$/i).first()).toBeVisible();
    await expect(page.getByText(/^rsvp$/i).first()).toBeVisible();
  });

  test('has sidebar navigation links', async ({ page }) => {
    const sidebar = page.locator('aside');

    await expect(sidebar.getByRole('link', { name: /dasbor|dashboard/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /template kustom|custom templates/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /kelola pengguna|manage users/i })).toBeVisible();
  });

  test('navigates to the templates page from the sidebar', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: /template kustom|custom templates/i }).click();

    await expect(page).toHaveURL(/\/cms\/templates$/);
    await expect(page.getByRole('heading', { name: /katalog template/i })).toBeVisible();
  });
});
