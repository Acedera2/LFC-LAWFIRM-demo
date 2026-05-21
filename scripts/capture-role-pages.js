#!/usr/bin/env node
/*
 * Capture screenshots of key pages for each demo role.
 * Usage: node scripts/capture-role-pages.js [BASE_URL]
 * Example: node scripts/capture-role-pages.js http://127.0.0.1:5173
 * Requires: npm i -D playwright
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:5173';
const outDir = path.resolve(process.cwd(), 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const demos = [
  { label: 'Admin', email: 'admin@lfcfirm.com', password: 'Password123!', pages: ['/admin', '/clients', '/analytics', '/settings', '/appointments', '/notifications'] },
  { label: 'Staff', email: 'staff@lfcfirm.com', password: 'Password123!', pages: ['/staff', '/clients', '/analytics', '/appointments', '/notifications'] },
  { label: 'Lawyer', email: 'attorney.rivera@lfcfirm.com', password: 'Password123!', pages: ['/lawyer', '/analytics', '/appointments', '/notifications'] },
  { label: 'Client', email: 'client@demo.com', password: 'Password123!', pages: ['/client', '/appointments', '/notifications'] }
];

(async function main(){
  const browser = await chromium.launch({ headless: true });
  for (const demo of demos) {
    const roleDir = path.join(outDir, demo.label);
    if (!fs.existsSync(roleDir)) fs.mkdirSync(roleDir, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Intercept API calls and provide lightweight mocks so backend isn't required.
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      try {
        if (url.endsWith('/api/auth/me')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ user: { id: 1, name: demo.label, email: demo.email, role: { slug: demo.label.toLowerCase() } } })
          });
        }
        if (url.endsWith('/api/auth/login') && method === 'POST') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ user: { id: 1, name: demo.label, email: demo.email, role: { slug: demo.label.toLowerCase() } } })
          });
        }
        // Lightweight mocks for other common endpoints
        if (url.includes('/api/appointments')) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
        }
        if (url.includes('/api/clients')) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
        }
        if (url.includes('/api/analytics')) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stats: {} }) });
        }
        if (url.includes('/api/notifications')) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
        }
      } catch (e) {
        // fallthrough to continue
      }
      return route.continue();
    });

    try {
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.fill('input[type="email"]', demo.email);
      await page.fill('input[type="password"]', demo.password);
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 })
      ]);
    } catch (err) {
      console.error(`Login failed for ${demo.label}:`, err.message);
      try { await page.screenshot({ path: path.join(roleDir, `login-error.png`), fullPage: true }); } catch (e) {}
      await context.close();
      continue;
    }

    // capture landing dashboard
    try {
      await page.screenshot({ path: path.join(roleDir, `dashboard.png`), fullPage: true });
    } catch (e) {}

    for (const route of demo.pages) {
      try {
        const url = `${BASE}${route}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        // filename safe
        const filename = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '');
        const filepath = path.join(roleDir, `${filename || 'index'}.png`);
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`Saved ${filepath}`);
      } catch (err) {
        console.warn(`Failed to capture ${demo.label} ${route}: ${err.message}`);
        try { await page.screenshot({ path: path.join(roleDir, `error-${route.replace(/\//g,'_')}.png`), fullPage: true }); } catch (e) {}
      }
    }

    // logout if available
    try {
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
      // if there's a logout link/button with text 'Logout' or 'Sign out'
      const logout = await page.$('text=Logout') || await page.$('text=Sign out') || await page.$('button[aria-label="logout"]');
      if (logout) {
        await logout.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {}

    await context.close();
  }
  await browser.close();

  // write simple README with explanation
  const readme = [];
  readme.push('# Screenshot collection');
  readme.push(`Base URL: ${BASE}`);
  readme.push('');
  readme.push('For each role the folder contains dashboard and allowed pages as PNG images.');
  readme.push('');
  readme.push('Roles and pages captured:');
  for (const d of demos) readme.push(`- ${d.label}: ${d.pages.join(', ')}`);
  fs.writeFileSync(path.join(outDir, 'README.md'), readme.join('\n'));

  console.log('Capture complete. Screenshots are in:', outDir);
})();
