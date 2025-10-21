import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // <-- Add this for GitHub Pages
  //  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://marche-yzzm.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://marche-yzzm.onrender.com',
        changeOrigin: true,
      },
      '/static': {
        target: 'https://marche-yzzm.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
