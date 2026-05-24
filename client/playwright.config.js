/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5174',
    viewport: { width: 1280, height: 800 },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    // Artifact settings
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    // directory where test artifacts are stored
    outputDir: 'test-results'
  },
  reporter: [ ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }] ]
};
