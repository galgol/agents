import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://localhost:8000'
const proxied = ['/auth', '/worlds', '/characters', '/upload', '/static']

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      proxied.map((path) => [path, { target: backend, changeOrigin: true }]),
    ),
  },
})
