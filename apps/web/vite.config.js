import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.VITE_API_PROXY ?? 'http://localhost:3001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, proxy: { '/api': api, '/health': api } },
  // MapLibre pesa ~1 MB minificado por sí solo; el aviso por defecto (500 kB) no aporta.
  build: { chunkSizeWarningLimit: 1400 },
  preview: { port: 4173, proxy: { '/api': api, '/health': api } },
});
