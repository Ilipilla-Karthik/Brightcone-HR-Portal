import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { timeDbMiddleware } from './timeDbMiddleware.js';

export default defineConfig({
  plugins: [react(), timeDbMiddleware()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    hmr: {
      clientPort: 3000,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5155',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5155',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
