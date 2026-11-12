import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3005',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  webServer: {
    command: 'npx next start -p 3005',
    url: 'http://127.0.0.1:3005',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
