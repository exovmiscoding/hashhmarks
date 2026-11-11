import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ESPN's public scoreboard/summary/news endpoints are keyless but don't always
// return permissive CORS headers, so during development we proxy them.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Accounts, card draws and player stats run in /api (wrangler-free: see server/dev.mjs).
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: false,
      },
      '/espn': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/espn/, ''),
      },
    },
  },
});
