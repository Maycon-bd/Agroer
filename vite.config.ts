import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/pdf': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api/validation': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api/rag': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
