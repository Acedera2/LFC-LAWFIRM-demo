import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Analytics API smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', 'admin@demo.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
  });

  test('fetch analytics summary from MockApi', async ({ page }) => {
    const summary = await page.evaluate(async () => {
      if (!window.MockApi) return null;
      const r = await window.MockApi.request({ method: 'get', url: '/analytics/summary' });
      return r.data.data;
    });

    expect(summary).not.toBeNull();
    expect(summary.overview).toBeDefined();
  });
});
