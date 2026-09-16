// Capture admin panel screenshots for the README.
//
// Usage:
//   node scripts/screenshots.mjs
//
// It asks for the email and password at the prompt. Nothing is stored in this file
// or on disk. To run it unattended instead, set VOLQAN_SHOT_EMAIL and
// VOLQAN_SHOT_PASSWORD and it will skip the prompts.
//
// Requires the dev server on http://localhost:3001 (pnpm --filter @volqan/admin dev).

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import readline from 'node:readline';
import path from 'node:path';

const BASE = process.env.VOLQAN_SHOT_BASE ?? 'http://localhost:3001';
let EMAIL = process.env.VOLQAN_SHOT_EMAIL;
let PASSWORD = process.env.VOLQAN_SHOT_PASSWORD;
const OUT = path.resolve('docs/images');

// Set to a comma-separated list of shot file names (e.g. "admin-dashboard.png")
// to recapture only those, instead of every screen.
const ONLY = process.env.VOLQAN_SHOT_ONLY?.split(',').map((s) => s.trim()).filter(Boolean);

// Ask for whatever the environment did not supply. What you type at the password
// prompt is not echoed, not logged, and not written anywhere.
function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    let muted = false;
    if (hidden) {
      const write = rl._writeToOutput.bind(rl);
      rl._writeToOutput = (s) => {
        if (!muted) write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
    if (hidden) muted = true;
  });
}

const SHOTS = [
  { file: 'admin-dashboard.png', path: '/', label: 'Dashboard' },
  { file: 'admin-content.png', path: '/content', label: 'Content manager' },
  { file: 'admin-pages.png', path: '/pages', label: 'Pages' },
  { file: 'admin-media.png', path: '/media', label: 'Media library' },
  { file: 'admin-themes.png', path: '/themes', label: 'Themes' },
  { file: 'admin-extensions.png', path: '/extensions', label: 'Extensions' },
  { file: 'admin-analytics.png', path: '/analytics', label: 'Analytics' },
  { file: 'admin-settings.png', path: '/settings', label: 'Settings' },
];

// Next.js injects a dev indicator and a dev-tools button in development. Neither
// belongs in a marketing screenshot, so hide them on every page.
const HIDE_DEV_CHROME = `
  nextjs-portal,
  [data-nextjs-dev-tools-button],
  [data-next-badge-root],
  #__next-build-watcher { display: none !important; }
`;

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.addStyleTag({ content: HIDE_DEV_CHROME }).catch(() => {});
  // Park the cursor off-canvas so hover tooltips (e.g. the content chart) don't
  // end up baked into the screenshot.
  await page.mouse.move(0, 0).catch(() => {});
  await page.waitForTimeout(900);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // VOLQAN_SHOT_PUBLIC_ONLY=1 captures just the screens that need no session.
  const publicOnly = Boolean(process.env.VOLQAN_SHOT_PUBLIC_ONLY);

  if (!publicOnly) {
    EMAIL = EMAIL || (await ask('Email [admin@volqan.link]: ')) || 'admin@volqan.link';
    PASSWORD = PASSWORD || (await ask('Password (hidden): ', { hidden: true }));
    if (!PASSWORD) {
      console.error('No password entered, nothing to do.');
      process.exit(1);
    }
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  // Sign-in screen first, no session needed.
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await page.screenshot({ path: path.join(OUT, 'admin-login.png') });
  console.log('captured  admin-login.png');

  if (publicOnly) {
    await browser.close();
    console.log(`\nPublic-only run finished. Files are in ${OUT}`);
    return;
  }

  // Authenticate using the values supplied at the prompt or in the environment.
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);
  await settle(page);
  console.log('signed in as', EMAIL);

  const shots = ONLY?.length ? SHOTS.filter((s) => ONLY.includes(s.file)) : SHOTS;

  for (const shot of shots) {
    try {
      await page.goto(`${BASE}${shot.path}`, { waitUntil: 'domcontentloaded' });
      await settle(page);
      if (page.url().includes('/login')) {
        console.warn(`skipped   ${shot.file} (session lost)`);
        continue;
      }
      await page.screenshot({ path: path.join(OUT, shot.file) });
      console.log(`captured  ${shot.file}  (${shot.label})`);
    } catch (err) {
      console.warn(`failed    ${shot.file}: ${err.message}`);
    }
  }

  // Page builder lives behind a specific page, so open the first row if there is one.
  // The "New Page" button also matches /pages/, so exclude it or we land on the
  // title/slug form instead of the builder.
  try {
    await page.goto(`${BASE}/pages`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    const link = page.locator('a[href^="/pages/"]:not([href="/pages/new"])').first();
    if (await link.count()) {
      await link.click();
      await settle(page);
      await page.screenshot({ path: path.join(OUT, 'admin-page-builder.png') });
      console.log('captured  admin-page-builder.png  (Page builder)');
    } else {
      console.warn('skipped   admin-page-builder.png (no pages exist yet)');
    }
  } catch (err) {
    console.warn(`failed    admin-page-builder.png: ${err.message}`);
  }

  await browser.close();
  console.log(`\nDone. Files are in ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
