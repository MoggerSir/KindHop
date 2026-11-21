import { defineConfig } from '@playwright/test';

// Comprueba que ninguna pantalla ensanche la página: Login, Explorar, Mapa, fichas, shell, Inicio, Billetera y Ajustes.
// Requiere la web en marcha (npm run dev) y AUTH_DEV_LOGIN en la API.
// No entra en `npm test`: hace falta un navegador y el servidor.
export default defineConfig({
  testDir: 'e2e',
  timeout: 240_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    hasTouch: true,
    isMobile: true,
  },
});
