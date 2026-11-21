import { fileURLToPath, URL } from 'node:url';
import { isIP } from 'node:net';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { demoImagesPlugin } from './demo-images.js';

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

// Los assets con hash (/assets/) pueden cachearse un año. El HTML sigue en no-cache (lo pone el servidor de preview).
function hashedAssetCache() {
  return {
    name: 'hashed-asset-cache',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (url.startsWith('/assets/')) {
          const setHeader = res.setHeader.bind(res);
          res.setHeader = (name, value) => (
            String(name).toLowerCase() === 'cache-control'
              ? setHeader('Cache-Control', 'public, max-age=31536000, immutable')
              : setHeader(name, value)
          );
        }
        next();
      });
    },
  };
}

// Preload del chunk de la pestaña que abre la URL, para que baje en paralelo con el entry y no después de ejecutarlo.
function routePreload() {
  const markers = {
    home: 'screens/HomeScreen.jsx',
    explore: 'screens/ExploreScreen.jsx',
    map: 'screens/MapScreen.jsx',
    budget: 'screens/BudgetScreen.jsx',
  };
  return {
    name: 'route-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const chunks = Object.values(ctx.bundle).filter((item) => item.type === 'chunk');
        const byName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
        const closure = (fileName) => {
          const seen = new Set();
          const files = [];
          const seenFiles = new Set();
          const add = (href) => {
            if (!href) return;
            const url = href.startsWith('/') ? href : `/${href}`;
            if (seenFiles.has(url)) return;
            seenFiles.add(url);
            files.push(url);
          };
          const stack = [fileName];
          while (stack.length) {
            const name = stack.pop();
            if (!name || seen.has(name)) continue;
            seen.add(name);
            const chunk = byName.get(name);
            if (!chunk || chunk.isEntry) continue;
            add(chunk.fileName);
            for (const imported of chunk.imports ?? []) stack.push(imported);
            for (const css of chunk.viteMetadata?.importedCss ?? []) add(css);
          }
          return files;
        };
        const routes = {};
        for (const [route, marker] of Object.entries(markers)) {
          const chunk = chunks.find((item) => Object.keys(item.modules ?? {}).some((id) => id.includes(marker)));
          if (chunk) routes[route] = closure(chunk.fileName);
        }
        const script = `<script>(function(){var routes=${JSON.stringify(routes)};var tab=new URLSearchParams(location.search).get('tab');var files=routes[tab]||routes.home||[];for(var i=0;i<files.length;i++){var link=document.createElement('link');var css=files[i].endsWith('.css');link.rel=css?'preload':'modulepreload';if(css)link.as='style';link.crossOrigin='';link.href=files[i];document.head.appendChild(link);}})();</script>`;
        return html.replace('</head>', `${script}</head>`);
      },
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    demoImagesPlugin(),
    routePreload(),
    hashedAssetCache(),
    ...(process.env.ANALYZE
      ? [visualizer({ filename: 'dist/bundle-stats.html', gzipSize: true, brotliSize: true, template: 'treemap' })]
      : []),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, allowedHosts: ['.trycloudflare.com'], proxy: { '/api': apiProxy, '/health': api } },
  // MapLibre minificado pasa de 1 MB; va en su propio chunk y no entra en Inicio. El entry queda muy por debajo.
  build: {
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'maplibre', test: /maplibre-gl/, priority: 20 }],
        },
      },
    },
  },
  preview: { port: 4173, allowedHosts: ['.trycloudflare.com'], proxy: { '/api': apiProxy, '/health': api } },
});
