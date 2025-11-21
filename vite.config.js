import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode (development/production)
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      proxy: {
        // Proxy API requests in development
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true // Only for local development with HTTP
        }
      }
    },
    build: {
      // Use absolute paths for production builds
      // For subfolder deployment, set base in environment variable
      base: process.env.VITE_BASE_PATH || '/'
    }
  };
});