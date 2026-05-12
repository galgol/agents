import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://localhost:8000'

/** Paths proxied to FastAPI as-is (JSON / uploads / static). */
const proxied = ['/auth', '/worlds', '/upload', '/static']

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      ...Object.fromEntries(
        proxied.map((path) => [path, { target: backend, changeOrigin: true }]),
      ),
      // Same URL as the API list route: browser navigations (Accept: text/html) must hit the SPA.
      '/characters': {
        target: backend,
        changeOrigin: true,
        bypass(req) {
          const accept = req.headers.accept || ''
          if (accept.includes('text/html')) {
            return '/index.html'
          }
        },
      },
    },
  },
})
