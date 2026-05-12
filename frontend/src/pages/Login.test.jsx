import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Login from './Login.jsx'
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

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/characters" element={<div>Home hub</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<Login />', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not render the sign-in form when already authenticated', () => {
    setToken('existing')
    renderLogin()
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull()
  })

  it('signs in successfully and stores the token', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ access_token: 'tok-123', token_type: 'bearer' }))
    renderLogin()

    await userEvent.type(screen.getByLabelText('Username'), 'alice')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByText('Home hub')).toBeInTheDocument())
    expect(getToken()).toBe('tok-123')

    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('/auth/login')
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    expect(opts.body.toString()).toBe('username=alice&password=secret123')
  })

  it('shows a friendly error on 401', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ detail: 'bad creds' }, 401))
    renderLogin()
    await userEvent.type(screen.getByLabelText('Username'), 'alice')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong'.padEnd(6, 'x'))
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password')
    expect(getToken()).toBeNull()
  })

  it('shows a generic error on 500', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({}, 500))
    renderLogin()
    await userEvent.type(screen.getByLabelText('Username'), 'alice')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Request failed/)
  })
})
