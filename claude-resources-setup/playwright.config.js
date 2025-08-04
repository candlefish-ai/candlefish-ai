import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.DASHBOARD_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for each action */
    actionTimeout: 30000,
    
    /* Global timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : [
    {
      command: 'cd dashboard && npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'npm run start:api',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    }
  ],

  /* Test output directory */
  outputDir: 'test-results/',

  /* Global setup and teardown */
  globalSetup: './__tests__/setup/global-setup.js',
  globalTeardown: './__tests__/setup/global-teardown.js',

  /* Expect settings */
  expect: {
    /* Maximum timeout for assertions */
    timeout: 10000,
    
    /* Threshold for screenshot comparisons */
    threshold: 0.3,
    
    /* Enable/disable animations during testing */
    toHaveScreenshot: { 
      animations: 'disabled',
      caret: 'hide'  
    },
    toMatchSnapshot: { 
      animations: 'disabled' 
    }
  },

  /* Metadata */
  metadata: {
    'test-suite': 'Claude Resources Deployment E2E Tests',
    'environment': process.env.NODE_ENV || 'test',
    'dashboard-url': process.env.DASHBOARD_URL || 'http://localhost:5173',
    'api-url': process.env.API_BASE_URL || 'http://localhost:3000'
  }
})