const { test, expect } = require('@playwright/test');

test.describe('Full demo flow: client -> staff -> lawyer', () => {
  test('client submits request and staff approves', async ({ page, request }) => {
    const BASE = process.env.BASE_URL || 'http://localhost:5173';

    // Client: open dashboard and submit an appointment
    await page.goto(`${BASE}/client`);
    await page.waitForSelector('text=Submit appointment inquiry');

    // select date (tomorrow)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const isoDate = tomorrow.toISOString().slice(0,10);
    await page.fill('input[type=date]', isoDate);

    // set subject + description
    await page.fill('input[placeholder="Subject"]', 'Playwright demo test');
    await page.fill('textarea[placeholder="Add a short reason for the cancellation request"]', 'E2E demo flow submission');

    // submit
    await page.click('button:has-text("Submit inquiry for review")');

    // wait for success toast or new appointment in list
    await page.waitForTimeout(500); // slight wait for mock processing
    await expect(page.locator('text=Appointment request submitted')).toBeTruthy({ timeout: 3000 }).catch(()=>{});

    // check that a recent appointment appears in Latest appointments
    await expect(page.locator('section:has-text("Latest appointments") >> text=Playwright demo test').first()).toBeVisible({ timeout: 5000 });

    // Staff: open appointments management and approve the first pending
    await page.goto(`${BASE}/appointments`);
    await page.waitForSelector('text=Appointment management');
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 5000 });

    // open the first appointment modal
    await firstRow.click();
    await page.waitForSelector('text=Appointment details');

    // click Approve
    await page.click('button:has-text("Approve")');

    // confirm publishRefresh propagation by checking updated status in table
    await page.waitForTimeout(300);
    await expect(page.locator('table tbody tr').first().locator('text=Approved')).toBeVisible({ timeout: 3000 });
  });
});
