import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // bind to 0.0.0.0 so phone can reach it
    port: 5173,
    proxy: {
      '/graphql': { target: 'https://localhost:3001', changeOrigin: true, secure: false },
      '/api':     { target: 'https://localhost:3001', changeOrigin: true, secure: false },
      '/auth':    { target: 'https://localhost:3001', changeOrigin: true, secure: false },
      '/ws':      { target: 'wss://localhost:3001',   ws: true, secure: false },
      '/chat':    { target: 'wss://localhost:3001',   ws: true, secure: false },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['node_modules', 'expense-tracker-backend', 'tests'],
  },
})