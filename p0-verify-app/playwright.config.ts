import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'p0.verify.spec.ts',
  timeout: 180_000,
  use: {
    baseURL: 'http://127.0.0.1:5177',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5177',
    url: 'http://127.0.0.1:5177',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
