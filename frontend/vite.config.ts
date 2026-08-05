import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const nodeModulesPath = path.join(projectRoot, 'node_modules');
const dependencyRoot = fs.existsSync(nodeModulesPath) ? fs.realpathSync(nodeModulesPath) : nodeModulesPath;

// Use import.meta.env instead of process.env for better browser compatibility, especially Safari
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'root-index-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.method === 'GET' && (req.url === '/' || req.url?.startsWith('/?'))) {
            req.url = `/index.html${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;
          }
          next();
        });
      },
    },
  ],
  server: {
    fs: {
      allow: [projectRoot, dependencyRoot],
    },
  },
  optimizeDeps: { esbuildOptions: { target: 'es2020' } },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
