import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Smoke: login and basic flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  test('login as admin and visit pages', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@demo.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 5000 });
    await expect(page).toHaveURL(/.*\/admin/);

    // Visit settings
    await page.goto(`${BASE}/settings`);
    await expect(page.locator('h1')).toHaveCount(1);

    // Visit clients
    await page.goto(`${BASE}/clients`);
    await expect(page.locator('h1')).toHaveCount(1);

    // Create a quick appointment via the UI (if available)
    await page.goto(`${BASE}/appointments`);
    // if there's a New or Create button, try to open modal
    const createBtn = page.locator('button:has-text("New")').first();
    if (await createBtn.count() > 0) {
      await createBtn.click();
      // fill a simple form if present
      await page.fill('input[name="subject"]', 'E2E test appointment');
      await page.fill('input[name="preferredStart"]', new Date(Date.now()+86400000).toISOString().slice(0,16));
      // submit if submit button exists
      const submit = page.locator('button:has-text("Create")').first();
      if (await submit.count() > 0) await submit.click();
    }

    // Basic smoke: ensure app didn't navigate to login
    await expect(page).not.toHaveURL(/.*\/login/);
  });
});
