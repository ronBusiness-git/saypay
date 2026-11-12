import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  retries: 0,
  use: {
    headless: false,
    channel: 'chrome',
    baseURL: 'http://127.0.0.1:3005',
    viewport: { width: 1280, height: 800 },
    launchOptions: {
      slowMo: 400, // Slow down operations by 400ms so the user can easily observe the automated browser actions
    },
  },
  projects: [
    {
      name: 'Google Chrome',
      use: {
        channel: 'chrome',
        headless: false,
      },
    },
  ],
});
