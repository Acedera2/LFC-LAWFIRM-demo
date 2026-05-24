/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
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
