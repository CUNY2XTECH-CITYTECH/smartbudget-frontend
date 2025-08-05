import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/signup': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/logout': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/session': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/upload': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/expenses': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
