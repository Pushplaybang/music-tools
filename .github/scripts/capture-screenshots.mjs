import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const outputDir =
  process.env.SCREENSHOT_DIR || path.join(process.cwd(), 'artifacts', 'screenshots');

const pages = [
  { name: 'index', path: '/' },
  { name: 'ear-trainer', path: '/src/ear-trainer.html' },
  { name: 'tuner', path: '/src/tuner.html' },
  { name: 'pulse', path: '/src/pulse.html' },
  { name: 'drone', path: '/src/drone.html' },
  { name: 'practice-timer', path: '/src/practice-timer.html' },
  { name: 'chord-reference', path: '/src/chord-reference.html' },
];

const viewport = { width: 1440, height: 900 };
const timeoutMs = 30000;

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport });
const manifest = {
  baseUrl,
  viewport,
  generatedAt: new Date().toISOString(),
  pages: [],
};

try {
  for (const entry of pages) {
    const url = new URL(entry.path, baseUrl).toString();
    const file = `${entry.name}.png`;
    const target = path.join(outputDir, file);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForSelector('.card', { timeout: timeoutMs });
    await page.screenshot({ path: target, fullPage: true });

    manifest.pages.push({
      name: entry.name,
      path: entry.path,
      file,
    });
  }
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
