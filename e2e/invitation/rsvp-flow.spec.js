import { test, expect } from '@playwright/test';

const demoSlug = 'demo-batik-elegance';
const invitationUrl = `/wedding/${demoSlug}`;

async function openRsvp(page) {
  await page.goto(invitationUrl);
  const rsvp = page.locator('.rsvp-section');
  await expect(rsvp.getByRole('heading', { name: 'Konfirmasi Kehadiran' })).toBeVisible();
  return rsvp;
}

async function selectAttendance(rsvp, label) {
  await rsvp.locator('button').filter({ hasText: label }).click();
}

test.describe('RSVP submission', () => {
  test('should display RSVP form with name, status, and guest count fields', async ({ page }) => {
    const rsvp = await openRsvp(page);

    await expect(rsvp.locator('#rsvp-name')).toBeVisible();
    await expect(rsvp.getByText('Status Kehadiran')).toBeVisible();
    await expect(rsvp.getByRole('button', { name: /Hadir/ })).toBeVisible();

    await selectAttendance(rsvp, 'Hadir');
    await expect(rsvp.locator('#rsvp-pax')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const rsvp = await openRsvp(page);

    await rsvp.getByRole('button', { name: 'Kirim Konfirmasi' }).click();

    await expect(rsvp.getByText('Nama wajib diisi')).toBeVisible();
    await expect(rsvp.getByText('Status kehadiran wajib dipilih')).toBeVisible();
  });

  test('should submit RSVP with status hadir', async ({ page }) => {
    const rsvp = await openRsvp(page);
    const name = `Playwright Hadir ${Date.now()}`;

    await rsvp.locator('#rsvp-name').fill(name);
    await selectAttendance(rsvp, 'Hadir');
    await rsvp.locator('#rsvp-pax').selectOption('2');

    const response = page.waitForResponse((candidate) =>
      candidate.url().includes(`/api/wedding/${demoSlug}/rsvp`) && candidate.request().method() === 'POST',
    );
    await rsvp.getByRole('button', { name: 'Kirim Konfirmasi' }).click();

    expect((await response).ok()).toBeTruthy();
    await expect(rsvp.getByText('Konfirmasi kehadiran Anda telah kami terima.')).toBeVisible();
  });

  test('should submit RSVP with status tidak hadir', async ({ page }) => {
    const rsvp = await openRsvp(page);
    const name = `Playwright Tidak Hadir ${Date.now()}`;

    await rsvp.locator('#rsvp-name').fill(name);
    await selectAttendance(rsvp, 'Tidak Hadir');
    await expect(rsvp.locator('#rsvp-pax')).toBeHidden();

    const response = page.waitForResponse((candidate) =>
      candidate.url().includes(`/api/wedding/${demoSlug}/rsvp`) && candidate.request().method() === 'POST',
    );
    await rsvp.getByRole('button', { name: 'Kirim Konfirmasi' }).click();

    expect((await response).ok()).toBeTruthy();
    await expect(rsvp.getByText('Konfirmasi kehadiran Anda telah kami terima.')).toBeVisible();
  });

  test('should show success message after submission', async ({ page }) => {
    const rsvp = await openRsvp(page);

    await rsvp.locator('#rsvp-name').fill(`Playwright Success ${Date.now()}`);
    await selectAttendance(rsvp, 'Hadir');

    await rsvp.getByRole('button', { name: 'Kirim Konfirmasi' }).click();
    await expect(rsvp.getByRole('heading', { name: 'Terima Kasih!' })).toBeVisible();
    await expect(rsvp.getByText('Konfirmasi kehadiran Anda telah kami terima.')).toBeVisible();
  });
});
