import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Signup from './Signup.jsx'
import { getToken, setToken } from '../auth.js'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<div>Sign in page</div>} />
        <Route path="/main" element={<div>Home hub</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<Signup />', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not render the form when already authenticated', () => {
    setToken('existing')
    renderSignup()
    expect(screen.queryByRole('button', { name: 'Create account' })).toBeNull()
  })

  it('registers then auto-logs in and stores the token', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({ id: 1, username: 'alice' }, 201))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'tok-123', token_type: 'bearer' }))
    renderSignup()

    await userEvent.type(screen.getByLabelText('Username'), 'alice')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(screen.getByText('Home hub')).toBeInTheDocument())
    expect(getToken()).toBe('tok-123')

    const [registerUrl, registerOpts] = fetch.mock.calls[0]
    expect(registerUrl).toBe('/auth/register')
    expect(registerOpts.method).toBe('POST')
    expect(registerOpts.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(registerOpts.body)).toEqual({ username: 'alice', password: 'secret123' })

    const [loginUrl, loginOpts] = fetch.mock.calls[1]
    expect(loginUrl).toBe('/auth/login')
    expect(loginOpts.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    expect(loginOpts.body.toString()).toBe('username=alice&password=secret123')
  })

  it('surfaces the backend error when the username is taken', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ detail: 'Username already taken' }, 400))
    renderSignup()

    await userEvent.type(screen.getByLabelText('Username'), 'alice')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Username already taken')
    expect(getToken()).toBeNull()
    expect(fetch.mock.calls).toHaveLength(1)
  })
})
