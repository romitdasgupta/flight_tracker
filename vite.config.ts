import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    css: true,
    exclude: ['**/node_modules/**', 'node_modules/**', 'e2e/**', 'server/**'],
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
