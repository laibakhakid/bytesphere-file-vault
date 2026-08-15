import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes dev server on 0.0.0.0 (Local Network for phone access)
    allowedHosts: true, // Allows public tunnel domains (localtunnel, ngrok, etc.)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
