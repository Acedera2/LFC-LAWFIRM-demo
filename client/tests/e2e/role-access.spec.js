const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Role access checks', () => {
  const roles = [
    { label: 'Admin', email: 'admin@demo.local', pages: ['/admin', '/settings', '/clients'] },
    { label: 'Staff', email: 'staff@demo.local', pages: ['/staff', '/clients', '/appointments'] },
    { label: 'Lawyer', email: 'elena.rivera@demo.local', pages: ['/lawyer', '/analytics'] },
    { label: 'Client', email: 'client@demo.local', pages: ['/client', '/appointments'] }
  ];

  for (const role of roles) {
    test(`${role.label} can access allowed pages`, async ({ page }) => {
      await page.goto(`${BASE}/login`);
      await page.fill('input[type="email"]', role.email);
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      for (const p of role.pages) {
        await page.goto(`${BASE}${p}`);
        // Wait for at least one header to appear, then assert presence
        await page.waitForSelector('h1, h2', { timeout: 3000 });
        const h1 = await page.locator('h1').first();
        const h2 = await page.locator('h2').first();
        expect((await h1.count()) + (await h2.count())).toBeGreaterThan(0);
      }
    });
  }
});
