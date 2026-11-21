import { fileURLToPath, URL } from 'node:url';
import { isIP } from 'node:net';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.VITE_API_PROXY ?? 'http://localhost:3001';

// Solo el túnel local puede aportar la IP/protocolo originales; clientes LAN no pueden falsificarlos.
const apiProxy = {
  target: api,
  configure(proxy) {
    proxy.on('proxyReq', (proxyReq, req) => {
      const remote = req.socket.remoteAddress ?? '';
      const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote);
      const client = req.headers['cf-connecting-ip'];
      proxyReq.setHeader('X-Forwarded-For', local && typeof client === 'string' && isIP(client) ? client : remote);
      proxyReq.setHeader('X-Forwarded-Proto', local && req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http');
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, allowedHosts: ['.trycloudflare.com'], proxy: { '/api': apiProxy, '/health': api } },
  // MapLibre pesa ~1 MB minificado por sí solo; el aviso por defecto (500 kB) no aporta.
  build: { chunkSizeWarningLimit: 1400 },
  preview: { port: 4173, allowedHosts: ['.trycloudflare.com'], proxy: { '/api': apiProxy, '/health': api } },
});
