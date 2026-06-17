import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin proxy to the team FastAPI backend (Docker → 127.0.0.1:8000).
      // Frontend calls /api/* ; we strip the /api prefix and forward to the
      // backend root (its routes start at /, e.g. /users/login, /analyze-full).
      // Keeps dev cookie/JWT same-origin (no CORS).
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
