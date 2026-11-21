import { defineConfig } from '@playwright/test';

// La app y la API tienen que estar ya en marcha (npm run dev, AUTH_DEV_LOGIN=true).
// No forma parte de `npm run check`: exige Chromium y una sesión demo.
export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: 'line',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173',
    locale: 'es-MX',
  },
});
