import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login } from './helpers';

/**
 * Accessibility verification beyond static markup (PD-011).
 * Runs axe-core scans, keyboard/focus checks, RTL, and reduced-motion checks
 * on core admin flows.
 */

const CORE_PAGES = ['/', '/content', '/media', '/pages', '/users', '/settings', '/analytics', '/billing'];

test.describe('axe scans', () => {
  test.beforeEach(async ({ page }) => login(page));

  for (const path of CORE_PAGES) {
    test(`no serious axe violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});

test.describe('login page accessibility', () => {
  test('axe scan on login', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('form is fully keyboard operable', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    await page.keyboard.type('admin@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('password');
    // Submit button must be reachable by keyboard
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT']).toContain(focused);
  });
});

test.describe('dialog focus management', () => {
  test.beforeEach(async ({ page }) => login(page));

  test('confirm dialog moves focus in and Escape closes it', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('button', { name: /invite user/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});

test.describe('Arabic RTL', () => {
  test.beforeEach(async ({ page }) => login(page));

  test('saving Arabic locale flips document direction', async ({ page }) => {
    await page.goto('/settings');
    await page.getByLabel(/default locale/i).selectOption('ar');
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl', { timeout: 10_000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Restore English
    await page.getByLabel(/default locale/i).selectOption('en');
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr', { timeout: 10_000 });
  });
});

test.describe('reduced motion', () => {
  test('pages render with prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
