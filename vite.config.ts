import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ESPN's public scoreboard/summary/news endpoints are keyless but don't always
// return permissive CORS headers, so during development we proxy them.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/espn': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/espn/, ''),
      },
    },
  },
});
