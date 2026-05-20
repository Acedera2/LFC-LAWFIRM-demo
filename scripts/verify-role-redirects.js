#!/usr/bin/env node
/*
 * Simple Playwright script to verify role-based redirects for demo users.
 * Usage: BASE_URL=http://127.0.0.1:5173 node scripts/verify-role-redirects.js
 * Requires: npm i -D playwright
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';

const demos = [
  { label: 'Admin', email: 'admin@lfcfirm.com', password: 'Password123!', expected: '/admin' },
  { label: 'Staff', email: 'staff@lfcfirm.com', password: 'Password123!', expected: '/staff' },
  { label: 'Lawyer', email: 'attorney.rivera@lfcfirm.com', password: 'Password123!', expected: '/lawyer' },
  { label: 'Client', email: 'client@demo.com', password: 'Password123!', expected: '/client' }
];

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const failures = [];

  for (const demo of demos) {
    try {
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
      // clear session
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());

      await page.fill('input[type="email"]', demo.email);
      await page.fill('input[type="password"]', demo.password);
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 })
      ]);

      const url = new URL(page.url());
      if (!url.pathname.startsWith(demo.expected)) {
        failures.push({ demo: demo.label, got: url.pathname, want: demo.expected });
      } else {
        console.log(`OK: ${demo.label} redirected to ${url.pathname}`);
      }
    } catch (err) {
      failures.push({ demo: demo.label, error: err.message });
    }
  }

  await browser.close();

  if (failures.length) {
    console.error('Role redirect test failures:', failures);
    process.exit(1);
  }

  console.log('All role redirect checks passed');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
