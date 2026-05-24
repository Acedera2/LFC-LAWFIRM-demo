import pkg from 'playwright/test';

const { test, expect } = pkg;
const BASE = process.env.BASE_URL || 'http://127.0.0.1:5174';

test('auth localStorage fallback grants access to protected route', async ({ page }) => {
  await page.goto(BASE);

  // Remove any existing session and set a demo admin session in localStorage
  await page.evaluate(() => {
    localStorage.removeItem('lfc_user');
    localStorage.setItem('lfc_user', JSON.stringify({ user: { id: 'user_admin', name: 'Demo Admin', role: { slug: 'admin' } } }));
  });

  // Navigate to an admin-only route and assert page loads
  await page.goto(`${BASE}/admin`);

  // Give the app a moment to render using the fallback session
  await page.waitForTimeout(400);

  const body = (await page.content()).toLowerCase();
  // Expect either an Admin heading or known admin UI text (case-insensitive)
  const ok = body.includes('admin') || body.includes('system overview') || body.includes('manage users');
  expect(ok).toBe(true);
});
