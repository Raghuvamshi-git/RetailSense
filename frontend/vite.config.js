import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to FastAPI backend in dev mode
      '/forecast': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/inventory': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/pricing':   { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/health':   { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
