import { expect, test } from '@playwright/test'

test.describe('full-stack reachability', () => {
  test('vite serves the SPA index for unknown paths', async ({ request }) => {
    const r = await request.get('/health')
    expect(r.status()).toBe(200)
    expect(r.headers()['content-type']).toContain('text/html')
  })

  test('vite proxies /worlds to the backend (401 without a token)', async ({ request }) => {
    const r = await request.get('/worlds')
    expect(r.status()).toBe(401)
  })

  test('vite proxies /auth/login to the backend (422 on empty body)', async ({ request }) => {
    const r = await request.post('/auth/login', { form: {} })
    expect(r.status()).toBe(422)
  })
})
