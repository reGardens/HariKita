import { test, expect } from '@playwright/test';

async function openDemo(page, slug, templateClass) {
  await page.goto(`/wedding/${slug}`);
  await expect(page.locator(templateClass)).toBeVisible();
}

async function expectCustomProperty(page, selector, property, expectedValue) {
  await expect.poll(() =>
    page.locator(selector).evaluate((element, name) =>
      getComputedStyle(element).getPropertyValue(name).trim(),
      property,
    ),
  ).toBe(expectedValue);
}

test.describe('Demo template previews', () => {
  test('should load demo-batik-elegance template', async ({ page }) => {
    await openDemo(page, 'demo-batik-elegance', '.batik-elegance-template');

    await expect(page.locator('.batik-cover')).toBeVisible();
    await expect(page.getByText('Batik Elegance', { exact: true })).toBeVisible();
  });

  test('should show Pratinjau Tema header bar for demo', async ({ page }) => {
    await openDemo(page, 'demo-batik-elegance', '.batik-elegance-template');

    await expect(page.getByText('Pratinjau Tema', { exact: true })).toBeVisible();
  });

  test('should show Pilih Template Ini button', async ({ page }) => {
    await openDemo(page, 'demo-batik-elegance', '.batik-elegance-template');

    const selectTemplate = page.getByRole('link', { name: 'Pilih Template Ini' });
    await expect(selectTemplate).toBeVisible();
    await expect(selectTemplate).toHaveAttribute('href', '/cms/templates/create?template=batik-elegance');
  });

  test('should load demo-jawa-klasik with correct theme colors', async ({ page }) => {
    await openDemo(page, 'demo-jawa-klasik', '.jawa-klasik-template');

    await expectCustomProperty(page, '.jawa-klasik-template', '--jawa-primary', '#8B4513');
    await expectCustomProperty(page, '.jawa-klasik-template', '--jawa-secondary', '#D2691E');
    await expectCustomProperty(page, '.jawa-klasik-template', '--jawa-accent', '#FFD700');
  });

  test('should load demo-bali-dewata with correct theme colors', async ({ page }) => {
    await openDemo(page, 'demo-bali-dewata', '.bali-dewata-template');

    await expectCustomProperty(page, '.bali-dewata-template', '--bali-primary', '#8B1A1A');
    await expectCustomProperty(page, '.bali-dewata-template', '--bali-secondary', '#C41E3A');
    await expectCustomProperty(page, '.bali-dewata-template', '--bali-accent', '#FFD700');
  });

  test('should apply correct font family per template', async ({ page }) => {
    const cases = [
      { slug: 'demo-batik-elegance', selector: '.batik-elegance-template', font: 'Cormorant SC' },
      { slug: 'demo-jawa-klasik', selector: '.jawa-klasik-template', font: 'Playfair Display' },
      { slug: 'demo-bali-dewata', selector: '.bali-dewata-template', font: 'Cinzel' },
    ];

    for (const template of cases) {
      await openDemo(page, template.slug, template.selector);
      await expect(page.locator(template.selector)).toHaveCSS('font-family', new RegExp(template.font));
    }
  });
});
