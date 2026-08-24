import { test, expect } from '@playwright/test';

const demoSlug = 'demo-batik-elegance';
const invitationUrl = `/wedding/${demoSlug}`;

test.describe('Mobile invitation responsiveness', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'These assertions require the invitation-mobile project.');
    await page.goto(invitationUrl);
    await expect(page.locator('.batik-elegance-template')).toBeVisible();
  });

  test('should display invitation correctly on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport.width).toBeLessThanOrEqual(430);

    await expect(page.locator('.batik-cover')).toBeVisible();
    await expect(page.locator('.batik-cover h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /Buka Undangan/i })).toBeVisible();
  });

  test('should show hamburger menu or compact navigation', async ({ page }) => {
    const compactNavigation = page.locator(
      'nav, [role="navigation"], button[aria-label*="menu" i], button[aria-label*="navigasi" i], .hamburger-menu, .compact-navigation',
    );

    await expect(compactNavigation.first()).toBeVisible();
  });

  test('should display RSVP form properly on mobile', async ({ page }) => {
    const rsvp = page.locator('.rsvp-section');
    await rsvp.scrollIntoViewIfNeeded();

    await expect(rsvp.locator('#rsvp-name')).toBeVisible();
    await expect(rsvp.getByRole('button', { name: /Hadir/ })).toBeVisible();
    await rsvp.locator('button').filter({ hasText: 'Hadir' }).click();
    await expect(rsvp.locator('#rsvp-pax')).toBeVisible();

    const box = await rsvp.locator('#rsvp-name').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  });

  test('should display gallery in single column on mobile', async ({ page }) => {
    const gallery = page.locator('.gallery-section');
    await gallery.scrollIntoViewIfNeeded();

    const grid = gallery.locator('.grid').first();
    await expect(grid).toBeVisible();
    await expect(grid).toHaveCSS('grid-template-columns', /^(?:[\d.]+px)$/);
  });

  test('should scroll smoothly between sections', async ({ page }) => {
    const cover = page.locator('.batik-cover');
    await expect(cover).toBeVisible();

    await page.getByRole('button', { name: /Buka Undangan/i }).click();
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(page.locator('.couple-section')).toBeInViewport();
  });
});
