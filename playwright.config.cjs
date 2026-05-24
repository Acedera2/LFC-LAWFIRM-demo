/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  timeout: 60000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    baseURL: 'http://127.0.0.1:5178'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
  testDir: './tests'
};
