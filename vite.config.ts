import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, defineConfig, type Plugin } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Local dev/preview middleware so /api/* routes work identically under `npm run dev`
 * and `npm run preview`, delegating directly to the same `server/router.ts` used by Vercel.
 */
function localApiPlugin(): Plugin {
  return {
    name: 'krishikotha-local-api',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        server
          .ssrLoadModule('/server/router.ts')
          .then((mod) => mod.routeApiRequest(req, res))
          .catch(next);
      });
    },
    configurePreviewServer(server) {
      let ssrPromise: ReturnType<typeof createServer> | null = null;
      const getSsr = () => {
        if (!ssrPromise) {
          ssrPromise = createServer({
            root: rootDir,
            server: { middlewareMode: true, hmr: false },
            appType: 'custom',
          });
        }
        return ssrPromise;
      };
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const ssr = await getSsr();
          const mod = await ssr.ssrLoadModule('/server/router.ts');
          await mod.routeApiRequest(req, res);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      localApiPlugin(),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) return;
          const distDir = path.resolve(rootDir, 'dist');
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
