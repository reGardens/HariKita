import { test, expect } from '@playwright/test';

const demoSlug = 'demo-batik-elegance';
const invitationUrl = `/wedding/${demoSlug}`;

async function openDemoInvitation(page, suffix = '') {
  await page.goto(`${invitationUrl}${suffix}`);
  await expect(page.locator('.batik-elegance-template')).toBeVisible();
}

test.describe('Public wedding invitation', () => {
  test('should display loading state initially', async ({ page }) => {
    let releaseRegistryRequest;
    const registryRequestHeld = new Promise((resolve) => {
      releaseRegistryRequest = resolve;
    });

    await page.route(`**/api/wedding/registry/exists/${demoSlug}`, async (route) => {
      await registryRequestHeld;
      await route.continue();
    });

    const navigation = page.goto(invitationUrl);
    await expect(page.getByText('Memuat undangan...')).toBeVisible();

    releaseRegistryRequest();
    await navigation;
  });

  test('should show error for non-existent wedding slug', async ({ page }) => {
    await page.goto('/wedding/wedding-yang-tidak-ada');

    await expect(page.getByRole('heading', { name: 'Undangan Tidak Ditemukan' })).toBeVisible();
    await expect(page.getByText(/Undangan tidak ditemukan/i)).toBeVisible();
  });

  test('should display invitation for demo slug (demo-batik-elegance)', async ({ page }) => {
    await openDemoInvitation(page);

    await expect(page.getByText('Pratinjau Tema')).toBeVisible();
    await expect(page.locator('.batik-cover')).toBeVisible();
    await expect(page.getByRole('button', { name: /Buka Undangan/i })).toBeVisible();
  });

  test('should show couple section with groom and bride info', async ({ page }) => {
    await openDemoInvitation(page);

    const coupleSection = page.locator('.couple-section');
    await expect(coupleSection.getByRole('heading', { name: 'Mempelai' })).toBeVisible();
    await expect(coupleSection.locator('h3')).toHaveCount(2);
    await expect(coupleSection.locator('h3').first()).not.toHaveText('');
    await expect(coupleSection.locator('h3').nth(1)).not.toHaveText('');
  });

  test('should show event section with date and venue', async ({ page }) => {
    await openDemoInvitation(page);

    const eventSection = page.locator('.event-section');
    await expect(eventSection.getByRole('heading', { name: 'Jadwal Acara' })).toBeVisible();

    const eventCard = eventSection.locator('[data-aos="zoom-in"]').first();
    await expect(eventCard.getByRole('heading')).toBeVisible();
    await expect(eventCard.locator('p')).toHaveCount(3);
    await expect(eventCard.locator('p').first()).not.toHaveText('');
    await expect(eventCard.locator('p').nth(2)).not.toHaveText('');
  });

  test('should show countdown section', async ({ page }) => {
    await openDemoInvitation(page);

    const countdown = page.locator('.countdown-section');
    await expect(countdown.getByRole('heading', { name: 'Menuju Hari Bahagia' })).toBeVisible();
    await expect(countdown).toContainText(/Hari|Acara telah berlangsung/i);
  });

  test('should show gallery section', async ({ page }) => {
    await openDemoInvitation(page);

    const gallery = page.locator('.gallery-section');
    await expect(gallery.getByRole('heading', { name: 'Galeri' })).toBeVisible();
    await expect(gallery).toContainText(/Galeri|Belum ada foto/i);
  });

  test('should display cover section with guest name from ?to= query param', async ({ page }) => {
    await openDemoInvitation(page, '?to=Keluarga%20Budi');

    const cover = page.locator('.batik-cover');
    await expect(cover.getByText('Kepada Yth:')).toBeVisible();
    await expect(cover.getByText('Keluarga Budi', { exact: true })).toBeVisible();
  });

  test('should fallback to generic text if no ?to= param', async ({ page }) => {
    await openDemoInvitation(page);

    await expect(page.locator('.batik-cover')).toContainText(
      'Anda diundang untuk hadir di hari bahagia kami',
    );
  });

  test('should display music player button', async ({ page }) => {
    await openDemoInvitation(page);

    await expect(page.locator('.music-player button')).toBeVisible();
  });

  test('should display RSVP form', async ({ page }) => {
    await openDemoInvitation(page);

    const rsvp = page.locator('.rsvp-section');
    await expect(rsvp.getByRole('heading', { name: 'Konfirmasi Kehadiran' })).toBeVisible();
    await expect(rsvp.locator('#rsvp-name')).toBeVisible();
    await expect(rsvp.getByRole('button', { name: 'Kirim Konfirmasi' })).toBeVisible();
  });

  test('should display wishes section', async ({ page }) => {
    await openDemoInvitation(page);

    const wishes = page.locator('.wishes-section');
    await expect(wishes.getByRole('heading', { name: 'Ucapan & Doa' })).toBeVisible();
    await expect(wishes.getByPlaceholder('Nama Anda')).toBeVisible();
    await expect(wishes.getByRole('button', { name: 'Kirim Ucapan' })).toBeVisible();
  });
});
