import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Design Ref: §10.2 — `@/` 절대경로는 src/ 를 가리킨다 (jsconfig.json 과 쌍)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test.setup.js'],
    include: ['src/**/*.test.{js,jsx}'], // tests/e2e 는 Playwright 전용
  },
})
