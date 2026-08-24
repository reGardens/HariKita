import { test, expect } from '@playwright/test';

const demoSlug = 'demo-batik-elegance';
const invitationUrl = `/wedding/${demoSlug}`;

async function openWishes(page) {
  await page.goto(invitationUrl);
  const wishes = page.locator('.wishes-section');
  await expect(wishes.getByRole('heading', { name: 'Ucapan & Doa' })).toBeVisible();
  return wishes;
}

test.describe('Wishes submission', () => {
  test('should display wish submission form', async ({ page }) => {
    const wishes = await openWishes(page);

    await expect(wishes.getByPlaceholder('Nama Anda')).toBeVisible();
    await expect(wishes.getByPlaceholder('Tulis ucapan dan doa Anda...')).toBeVisible();
    await expect(wishes.getByRole('button', { name: 'Kirim Ucapan' })).toBeVisible();
  });

  test('should display existing wishes list', async ({ page }) => {
    const wishes = await openWishes(page);

    expect(await wishes.locator('[data-aos="fade-up"]').count()).toBeGreaterThan(0);
  });

  test('should validate required fields (name, message)', async ({ page }) => {
    const wishes = await openWishes(page);

    await wishes.getByRole('button', { name: 'Kirim Ucapan' }).click();
    await expect(wishes.getByText('Nama wajib diisi')).toBeVisible();

    await wishes.getByPlaceholder('Nama Anda').fill('Playwright Guest');
    await wishes.getByRole('button', { name: 'Kirim Ucapan' }).click();
    await expect(wishes.getByText('Ucapan Anda telah terkirim!')).toBeHidden();
  });

  test('should submit a new wish', async ({ page }) => {
    const wishes = await openWishes(page);

    await wishes.getByPlaceholder('Nama Anda').fill(`Playwright Wish ${Date.now()}`);
    await wishes.getByPlaceholder('Tulis ucapan dan doa Anda...').fill('Semoga bahagia selalu.');

    const response = page.waitForResponse((candidate) =>
      candidate.url().includes(`/api/wedding/${demoSlug}/wishes`) && candidate.request().method() === 'POST',
    );
    await wishes.getByRole('button', { name: 'Kirim Ucapan' }).click();

    expect((await response).ok()).toBeTruthy();
    await expect(wishes.getByText('Ucapan Anda telah terkirim!')).toBeVisible();
  });

  test('should show the new wish in the list after submission', async ({ page }) => {
    const wishes = await openWishes(page);
    const guestName = `Playwright Wish ${Date.now()}`;
    const message = 'Selamat menempuh hidup baru dari Playwright.';

    await wishes.getByPlaceholder('Nama Anda').fill(guestName);
    await wishes.getByPlaceholder('Tulis ucapan dan doa Anda...').fill(message);
    await wishes.getByRole('button', { name: 'Kirim Ucapan' }).click();

    await expect(wishes.getByText('Ucapan Anda telah terkirim!')).toBeVisible();
    await expect(wishes.getByText(guestName, { exact: true })).toBeVisible();
    await expect(wishes.getByText(message, { exact: true })).toBeVisible();
  });
});
