import { test, expect } from '@playwright/test';

const slug = 'test-wedding';
const editorPath = `/cms/${slug}/undangan`;

async function openEditor(page) {
  await page.goto(`${editorPath}/tema`);
  await expect(page).toHaveURL(new RegExp(`${editorPath}/tema$`));
}

async function navigateFromSidebar(page, linkName, expectedPath, heading) {
  await openEditor(page);
  await page.locator('aside').getByRole('link', { name: linkName }).click();

  await expect(page).toHaveURL(new RegExp(`${expectedPath}$`));
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
}

test.describe('CMS wedding editor navigation', () => {
  test('displays undangan sidebar menu items', async ({ page }) => {
    await openEditor(page);
    const sidebar = page.locator('aside');

    for (const item of [
      'Generate Text',
      'Tema & Template',
      'Informasi Acara',
      'Manajemen Tamu',
      'Galeri Foto',
      'RSVP Online',
      'Amplop Digital',
      'Ucapan & Doa',
    ]) {
      await expect(sidebar.getByRole('link', { name: item })).toBeVisible();
    }
  });

  test('navigates to Pesan WhatsApp (Generate Text)', async ({ page }) => {
    await navigateFromSidebar(page, 'Generate Text', `${editorPath}/pesan-wa`, /generate text/i);
  });

  test('navigates to Tema Pilihan', async ({ page }) => {
    await navigateFromSidebar(page, 'Tema & Template', `${editorPath}/tema`, /tema undangan/i);
  });

  test('navigates to Info Acara', async ({ page }) => {
    await navigateFromSidebar(page, 'Informasi Acara', `${editorPath}/acara`, /informasi acara/i);
  });

  test('navigates to Manajemen Tamu', async ({ page }) => {
    await navigateFromSidebar(page, 'Manajemen Tamu', `${editorPath}/tamu`, /manajemen tamu/i);
  });

  test('navigates to Galeri', async ({ page }) => {
    await navigateFromSidebar(page, 'Galeri Foto', `${editorPath}/galeri`, /galeri/i);
  });

  test('navigates to RSVP', async ({ page }) => {
    await navigateFromSidebar(page, 'RSVP Online', `${editorPath}/rsvp`, /rsvp/i);
  });

  test('navigates to Amplop Digital', async ({ page }) => {
    await navigateFromSidebar(page, 'Amplop Digital', `${editorPath}/amplop`, /amplop digital/i);
  });

  test('navigates to Ucapan & Doa', async ({ page }) => {
    await navigateFromSidebar(page, 'Ucapan & Doa', `${editorPath}/ucapan`, /ucapan.*doa/i);
  });
});
