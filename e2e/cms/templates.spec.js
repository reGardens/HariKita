import { test, expect } from '@playwright/test';

test.describe('CMS template management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cms/templates');
  });

  test('displays the templates list page', async ({ page }) => {
    await expect(page).toHaveURL(/\/cms\/templates$/);
    await expect(page.getByRole('heading', { name: /katalog template/i })).toBeVisible();
  });

  test('shows the create template button for a super-admin', async ({ page }) => {
    await expect(page.getByRole('link', { name: /buat template code/i })).toBeVisible();
  });

  test('navigates to the template create form', async ({ page }) => {
    await page.getByRole('link', { name: /buat template code/i }).click();

    await expect(page).toHaveURL(/\/cms\/templates\/create\?type=code$/);
    await expect(page.getByRole('heading', { name: /buat template kustom/i })).toBeVisible();
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#slug')).toBeVisible();
  });

  test('validates required fields when creating a template', async ({ page }) => {
    await page.goto('/cms/templates/create');
    await page.getByRole('button', { name: /simpan template/i }).click();

    await expect(page.getByText(/name field is required|nama.*wajib|required/i).first()).toBeVisible();
    await expect(page.getByText(/slug field is required|slug.*wajib|required/i).first()).toBeVisible();
  });

  test('displays template cards with thumbnails', async ({ page }) => {
    const templateThumbnail = page.locator('img[alt]').first();

    await expect(templateThumbnail).toBeVisible();
    await expect(templateThumbnail).toHaveAttribute('src', /.+/);
  });
});
