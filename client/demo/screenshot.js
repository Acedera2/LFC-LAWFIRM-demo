// Simple Playwright script to capture demo screenshots for presentation.
// Run with: `node demo/screenshot.js` after installing Playwright and browsers.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(`${BASE}/login`);
  await page.screenshot({ path: 'demo/login.png' });

  // login as admin
  await page.fill('input[type="email"]', 'admin@demo.local');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
  await page.screenshot({ path: 'demo/admin-dashboard.png' });

  await page.goto(`${BASE}/appointments`);
  await page.screenshot({ path: 'demo/appointments.png' });

  await page.goto(`${BASE}/clients`);
  await page.screenshot({ path: 'demo/clients.png' });

  await browser.close();
  console.log('Screenshots saved to demo/');
})();
