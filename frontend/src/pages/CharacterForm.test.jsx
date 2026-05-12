import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CharacterForm from './CharacterForm.jsx'
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

function renderForm(initial = '/character/new?world_id=5') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/character/new" element={<CharacterForm />} />
        <Route path="/world/:id" element={<div>World page</div>} />
        <Route path="/library" element={<div>Library page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<CharacterForm />', () => {
  beforeEach(() => {
    setToken('tok')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a character and navigates back to the world page', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ id: 1, world_id: 5, name: 'Aria' }, 201))
    renderForm()

    await userEvent.type(screen.getByLabelText('Name'), 'Aria')
    await userEvent.type(screen.getByLabelText('Bio'), 'A knight')
    await userEvent.type(screen.getByLabelText('Traits'), 'brave')
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))

    await waitFor(() => expect(screen.getByText('World page')).toBeInTheDocument())
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('/characters')
    expect(JSON.parse(opts.body)).toEqual({
      world_id: '5',
      name: 'Aria',
      bio: 'A knight',
      traits: 'brave',
      image_url: null,
    })
  })

  it('shows an error when world_id is missing from the URL', async () => {
    renderForm('/character/new')
    await userEvent.type(screen.getByLabelText('Name'), 'Aria')
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))
    expect(await screen.findByText(/Missing world/)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('renders the back link to the library when no world_id', () => {
    renderForm('/character/new')
    expect(screen.getByRole('link', { name: /Back/ })).toHaveAttribute('href', '/library')
  })

  it('renders the back link to the world when world_id is set', () => {
    renderForm('/character/new?world_id=5')
    expect(screen.getByRole('link', { name: /Back/ })).toHaveAttribute('href', '/world/5')
  })

  it('shows an error if the API rejects the submission', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ detail: 'World not found' }, 404))
    renderForm()
    await userEvent.type(screen.getByLabelText('Name'), 'Aria')
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))
    expect(await screen.findByText('World not found')).toBeInTheDocument()
  })
})
