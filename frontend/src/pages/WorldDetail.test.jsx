import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import WorldDetail from './WorldDetail.jsx'
import { setToken } from '../auth.js'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

function renderAt(path = '/world/3') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/world/:id" element={<WorldDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<WorldDetail />', () => {
  beforeEach(() => {
    setToken('tok')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the list of characters returned by the API', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(
        jsonResponse([
          { id: 10, name: 'Aria', traits: 'brave' },
          { id: 11, name: 'Borin' },
        ]),
      )
    renderAt()
    expect(await screen.findByRole('heading', { name: 'Aria' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Borin' })).toBeInTheDocument()

    const charactersCall = fetch.mock.calls.find((c) => c[0].startsWith('/characters'))
    expect(charactersCall[0]).toBe('/characters?world_id=3')
  })

  it('shows the empty state when no characters exist', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse([]))
    renderAt()
    expect(await screen.findByText('No characters yet in this world.')).toBeInTheDocument()
  })

  it('shows error when the characters request fails', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse({ detail: 'crash' }, 500))
    renderAt()
    expect(await screen.findByText('crash')).toBeInTheDocument()
  })
})
