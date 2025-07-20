import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // Create a separate chunk for react-helmet-async
          if (id.includes('node_modules/react-helmet-async')) {
            return 'react-helmet-async';
          }
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
    }
  },
  optimizeDeps: {
    include: ['react-helmet-async']
  }
})
