import { test, expect } from '@playwright/test';

test.describe('CMS user management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cms/users');
  });

  test('displays the users list', async ({ page }) => {
    await expect(page).toHaveURL(/\/cms\/users$/);
    await expect(page.getByRole('heading', { name: /manajemen pengguna|user management/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('shows a create user button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /tambah pengguna|add user/i })).toBeVisible();
  });

  test('navigates to the create user form', async ({ page }) => {
    await page.getByRole('link', { name: /tambah pengguna|add user/i }).click();

    await expect(page).toHaveURL(/\/cms\/users\/create$/);
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('validates required name, email, and password fields', async ({ page }) => {
    await page.goto('/cms/users/create');
    await page.getByRole('button', { name: /simpan|save/i }).click();
    await page.getByRole('button', { name: /ya, simpan/i }).click();

    await expect(page.getByText(/name field is required|nama.*wajib|required/i).first()).toBeVisible();
    await expect(page.getByText(/email field is required|email.*wajib|required/i).first()).toBeVisible();
    await expect(page.getByText(/password field is required|password.*wajib|required/i).first()).toBeVisible();
  });

  test('displays user roles in the list', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /peran|role/i })).toBeVisible();
    await expect(page.getByText(/super-admin/i).first()).toBeVisible();
  });
});
