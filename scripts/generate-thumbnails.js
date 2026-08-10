/**
 * Template Thumbnail Generator
 *
 * Uses Puppeteer to capture screenshots of each template rendered with placeholder data.
 * Run with: node scripts/generate-thumbnails.js
 *
 * Prerequisites: npm install puppeteer --save-dev (or use npx)
 * The Laravel dev server must be running at APP_URL for this to work.
 */

import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.APP_URL || 'http://localhost:8090';

const templates = [
  'jawa-klasik',
  'sunda-pasundan',
  'bali-dewata',
  'betawi-jakarta',
  'minang-rantau',
  'bugis-makassar',
  'dayak-borneo',
  'toraja-sulawesi',
  'melayu-riau',
  'papua-cendrawasih',
];

async function generateThumbnails() {
  console.log('🎨 Starting template thumbnail generation...');
  console.log(`   Base URL: ${BASE_URL}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const templateSlug of templates) {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });

    const url = `${BASE_URL}/wedding/demo-${templateSlug}`;
    console.log(`   📸 Capturing: ${templateSlug}...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for animations

      const outputPath = resolve(__dirname, `../public/images/templates/${templateSlug}-thumb.png`);
      await page.screenshot({ path: outputPath, type: 'png' });
      console.log(`   ✅ Saved: ${outputPath}`);
    } catch (err) {
      console.error(`   ❌ Failed: ${templateSlug} - ${err.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('🎉 Thumbnail generation complete!');
}

generateThumbnails().catch(console.error);
