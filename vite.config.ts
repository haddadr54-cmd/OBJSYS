import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/login-preview$/, to: '/index.html' },
        { from: /^\/sidebar-preview$/, to: '/index.html' }
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  plugins: [react()]
})