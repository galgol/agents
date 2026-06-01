import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Characters from './Characters.jsx'
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

function renderCharacters() {
  return render(
    <MemoryRouter>
      <Characters />
    </MemoryRouter>,
  )
}

describe('<Characters />', () => {
  beforeEach(() => {
    setToken('tok')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders characters and links to create a character', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse([{ id: 9, name: 'Eldoria', description: null, cover_image_url: null }]))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            world_id: 9,
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
          },
        ]),
      )
    renderCharacters()
    expect(await screen.findByRole('heading', { name: 'Aria' })).toBeInTheDocument()
    expect(screen.getByText('Eldoria')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New character' })).toHaveAttribute('href', '/character/new')
  })

  it('shows empty state when no characters exist', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([]))
    renderCharacters()
    expect(await screen.findByText(/No characters yet/)).toBeInTheDocument()
  })
})
