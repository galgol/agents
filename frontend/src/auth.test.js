import { describe, expect, it } from 'vitest'
import { clearToken, getToken, isAuthenticated, setToken } from './auth.js'

describe('auth token helpers', () => {
  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('persists and reads back a token', () => {
    setToken('abc.def.ghi')
    expect(getToken()).toBe('abc.def.ghi')
    expect(isAuthenticated()).toBe(true)
  })

  it('overwrites an existing token', () => {
    setToken('first')
    setToken('second')
    expect(getToken()).toBe('second')
  })

  it('clears the token', () => {
    setToken('abc')
    clearToken()
    expect(getToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('treats an empty string as unauthenticated', () => {
    setToken('')
    expect(isAuthenticated()).toBe(false)
  })
})
