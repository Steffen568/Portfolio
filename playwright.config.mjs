import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.mjs',
  timeout: 30000,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4600/portfolio/', colorScheme: 'dark' },
  webServer: {
    command: 'node scripts/serve.mjs',
    port: 4600,
    reuseExistingServer: true
  }
});
