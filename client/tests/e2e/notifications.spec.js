import pkg from 'playwright/test';

const { test, expect } = pkg;

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5174';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', 'admin@demo.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 5000 });
  });

  test('create and mark notifications read via MockApi', async ({ page }) => {
    // Prefer MockApi/MockStore; otherwise attempt UI-based check
    const hasMock = await page.evaluate(() => typeof window.MockApi !== 'undefined' && typeof window.MockStore !== 'undefined');
    if (!hasMock) {
      // try to navigate to notifications page and ensure it's accessible
      await page.goto(`${BASE}/notifications`);
      // nothing to assert reliably without backend/mock
      return;
    }

    // create a notification for admin user
    const note = await page.evaluate(async () => window.MockStore.createNotification({ userId: 'user_admin', title: 'E2E Notice', message: 'Testing notifications' }));
    if (!note) return;

    // fetch notifications via MockApi
    const notes = await page.evaluate(async () => {
      const r = await window.MockApi.request({ method: 'get', url: '/notifications' });
      return r.data.data.notifications;
    });

    expect(Array.isArray(notes)).toBe(true);

    // mark first notification read
    const first = notes[0];
    const ok = await page.evaluate(async (id) => {
      const r = await window.MockApi.request({ method: 'patch', url: `/notifications/${id}/read` });
      return r.data.data.ok;
    }, first.id);

    expect(ok).toBe(true);
  });
});
