#!/usr/bin/env node
/*
 * Simple Playwright script to verify role-based redirects for demo users.
 * Usage: BASE_URL=http://127.0.0.1:5173 node scripts/verify-role-redirects.js
 * Requires: npm i -D playwright
 */
const { chromium } = require('playwright');
const fs = require('fs');
const LOG_FILE = 'playwright-log.txt';

function writeLog(...parts) {
  try {
    fs.appendFileSync(LOG_FILE, parts.join(' ') + '\n');
  } catch (e) {
    // ignore write errors
  }
}

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

  page.on('console', (msg) => writeLog('CONSOLE', msg.type(), msg.text()));
  page.on('response', (res) => writeLog('RESPONSE', res.status(), res.url()));

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
        writeLog('ERROR', demo.label, err.message);
        try {
          const html = await page.content();
          writeLog('PAGE_URL', page.url());
          writeLog('PAGE_HTML_START');
          writeLog(html.slice(0, 2000));
          writeLog('PAGE_HTML_END');
          await page.screenshot({ path: `playwright-${demo.label}.png`, fullPage: true }).catch(() => {});
        } catch (captureErr) {
          writeLog('CAPTURE_ERROR', captureErr.message);
        }
      }
  }

  await browser.close();

  if (failures.length) {
    console.error('Role redirect test failures:', failures);
    writeLog('Role redirect test failures:', JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log('All role redirect checks passed');
  writeLog('All role redirect checks passed');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
