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
        <Route path="/characters" element={<div>Home hub</div>} />
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
      age: null,
      gender: null,
      hair: null,
      eyes: null,
      height: null,
      body_figure: null,
      characteristics: null,
    })
  })

  it('creates a character without a world and navigates to the home hub', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ id: 1, world_id: 99, name: 'Aria' }, 201))
    renderForm('/character/new')
    await userEvent.type(screen.getByLabelText('Name'), 'Aria')
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))
    await waitFor(() => expect(screen.getByText('Home hub')).toBeInTheDocument())

    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('/characters')
    expect(JSON.parse(opts.body)).toEqual({
      name: 'Aria',
      bio: null,
      traits: null,
      image_url: null,
      age: null,
      gender: null,
      hair: null,
      eyes: null,
      height: null,
      body_figure: null,
      characteristics: null,
    })
  })

  it('renders the back link to the home hub when no world_id', () => {
    renderForm('/character/new')
    expect(screen.getByRole('link', { name: /Back/ })).toHaveAttribute('href', '/characters')
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
