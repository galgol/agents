import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './api.js'
import { setToken, getToken } from './auth.js'

function mockResponse({ status = 200, body = null, contentType = 'application/json' } = {}) {
  const headers = new Map()
  if (contentType) headers.set('content-type', contentType)
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers.get(k.toLowerCase()) ?? null },
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }
}

describe('api request helper', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends GET without body and parses JSON', async () => {
    fetch.mockResolvedValueOnce(mockResponse({ body: { items: [1, 2] } }))
    const data = await api.get('/worlds')
    expect(data).toEqual({ items: [1, 2] })
    expect(fetch).toHaveBeenCalledWith('/worlds', expect.objectContaining({ method: 'GET' }))
    const opts = fetch.mock.calls[0][1]
    expect(opts.body).toBeUndefined()
    expect(opts.headers).not.toHaveProperty('Content-Type')
  })

  it('attaches Authorization header when token is set', async () => {
    setToken('jwt-token')
    fetch.mockResolvedValueOnce(mockResponse({ body: [] }))
    await api.get('/worlds')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer jwt-token')
  })

  it('serializes JSON body for POST and sets content-type', async () => {
    fetch.mockResolvedValueOnce(mockResponse({ status: 201, body: { id: 1 } }))
    await api.post('/worlds', { name: 'Eldoria' })
    const opts = fetch.mock.calls[0][1]
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(opts.body).toBe(JSON.stringify({ name: 'Eldoria' }))
  })

  it('sends FormData for upload without setting JSON content-type', async () => {
    fetch.mockResolvedValueOnce(mockResponse({ status: 201, body: { url: '/static/x.png' } }))
    const file = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' })
    const data = await api.upload('/upload', file)
    expect(data).toEqual({ url: '/static/x.png' })
    const opts = fetch.mock.calls[0][1]
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
    expect(opts.headers['Content-Type']).toBeUndefined()
  })

  it('clears token and throws ApiError on 401', async () => {
    setToken('expired')
    fetch.mockResolvedValueOnce(mockResponse({ status: 401, body: { detail: 'nope' } }))
    await expect(api.get('/worlds')).rejects.toMatchObject({
      name: 'Error',
      status: 401,
      message: 'Unauthorized',
    })
    expect(getToken()).toBeNull()
  })

  it('uses server detail message for non-2xx responses', async () => {
    fetch.mockResolvedValueOnce(
      mockResponse({ status: 400, body: { detail: 'Username already taken' } }),
    )
    await expect(api.post('/auth/register', { username: 'a', password: 'b' })).rejects.toMatchObject(
      { status: 400, message: 'Username already taken' },
    )
  })

  it('falls back to a generic message if response body is not JSON', async () => {
    fetch.mockResolvedValueOnce(
      mockResponse({ status: 500, body: null, contentType: 'text/plain' }),
    )
    await expect(api.get('/worlds')).rejects.toMatchObject({
      status: 500,
      message: 'Request failed (500)',
    })
  })

  it('returns null for 204 No Content', async () => {
    fetch.mockResolvedValueOnce(mockResponse({ status: 204, body: null, contentType: null }))
    const data = await api.get('/something')
    expect(data).toBeNull()
  })

  it('returns text body when response is not JSON', async () => {
    fetch.mockResolvedValueOnce(
      mockResponse({ status: 200, body: 'hello', contentType: 'text/plain' }),
    )
    const data = await api.get('/plain')
    expect(data).toBe('hello')
  })

  it('ApiError exposes status field', () => {
    const err = new ApiError('boom', 418)
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(418)
    expect(err.message).toBe('boom')
  })
})
