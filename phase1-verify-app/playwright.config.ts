import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'phase1.verify.spec.ts',
  timeout: 300_000,
  use: {
    baseURL: 'http://127.0.0.1:5190',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5190',
    url: 'http://127.0.0.1:5190',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
