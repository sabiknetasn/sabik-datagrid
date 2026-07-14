import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'p0.virtual.spec.ts',
  timeout: 300_000,
  use: {
    baseURL: 'http://127.0.0.1:5189',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5189',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
