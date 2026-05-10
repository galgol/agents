import { clearToken, getToken } from './auth.js'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, headers, isForm } = {}) {
  const token = getToken()
  const finalHeaders = { ...(headers || {}) }
  if (token) finalHeaders.Authorization = `Bearer ${token}`
  if (body && !isForm) finalHeaders['Content-Type'] = 'application/json'

  const res = await fetch(path, {
    method,
    headers: finalHeaders,
    body: body == null ? undefined : isForm ? body : JSON.stringify(body),
  })

  if (res.status === 401) {
    clearToken()
    throw new ApiError('Unauthorized', 401)
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.detail) message = typeof data.detail === 'string' ? data.detail : message
    } catch {
      // response body wasn't JSON; keep default message
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  upload: (path, file) => {
    const form = new FormData()
    form.append('file', file)
    return request(path, { method: 'POST', body: form, isForm: true })
  },
}
