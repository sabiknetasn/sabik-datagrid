import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'diagnose.virtual.spec.ts',
  timeout: 180_000,
  use: {
    baseURL: 'http://127.0.0.1:5178',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5178',
    url: 'http://127.0.0.1:5178',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
