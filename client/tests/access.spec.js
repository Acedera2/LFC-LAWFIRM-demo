import { test, expect } from '@playwright/test';

test('client cannot access /appointments (redirected)', async ({ page }) => {
  const BASE = process.env.BASE_URL || 'http://localhost:5173';

  // inject a client session into localStorage before navigation
  await page.addInitScript(() => {
    try {
      localStorage.setItem('lfc_user', JSON.stringify({ user: { id: 'test-client', name: 'Test Client', role: { slug: 'client' } } }));
    } catch (err) { void err; }
  });

  await page.goto(`${BASE}/appointments`);

  // If access is denied, ProtectedRoute should redirect clients to their role home (/client)
  await page.waitForLoadState('networkidle');
  const url = page.url();
  expect(url).not.toContain('/appointments');
  expect(url).toMatch(/\/client|\/$/);
});
