import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Admin panel port
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Backend API
        changeOrigin: true,
        secure: false
      }
    }
  }
})