import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: [
    {
      command: 'npm run dev:server',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: true
    },
    {
      command: 'VITE_E2E=1 npm run dev:client -- --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: true
    }
  ],
  use: {
    headless: true
  }
});
