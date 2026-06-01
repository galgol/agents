import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Library from './Library.jsx'
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

function renderLibrary() {
  return render(
    <MemoryRouter>
      <Library />
    </MemoryRouter>,
  )
}

describe('<Library />', () => {
  beforeEach(() => {
    setToken('tok')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders characters returned by the API', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            world_id: 9,
            name: 'Aria',
            bio: null,
            traits: null,
            image_url: null,
            age: 30,
            gender: null,
            hair: null,
            eyes: null,
            height: null,
            body_figure: null,
            characteristics: null,
          },
        ]),
      )
    renderLibrary()
    expect(await screen.findByRole('heading', { name: 'Aria' })).toBeInTheDocument()
  })

  it('renders worlds returned by the API', async () => {
    fetch
      .mockResolvedValueOnce(
        jsonResponse([
          { id: 1, name: 'Eldoria', description: 'magical', cover_image_url: null },
          { id: 2, name: 'Borea', description: null, cover_image_url: null },
        ]),
      )
      .mockResolvedValueOnce(jsonResponse([]))
    renderLibrary()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Eldoria' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Borea' })).toBeInTheDocument()
  })

  it('shows empty state when there are no worlds', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([]))
    renderLibrary()
    expect(await screen.findByText(/No worlds yet/)).toBeInTheDocument()
    expect(screen.getByText(/No characters yet/)).toBeInTheDocument()
  })

  it('shows the shelf headline and subtitle copy', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([]))
    renderLibrary()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your Shelf' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Your worlds, characters, and books created by you in one place.'),
    ).toBeInTheDocument()
  })

  it('links to the dedicated worlds and characters endpoints', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([]))
    renderLibrary()
    await screen.findByRole('heading', { level: 1, name: 'Your Shelf' })
    expect(screen.getByRole('link', { name: 'Your worlds' })).toHaveAttribute('href', '/worlds')
    expect(screen.getByRole('link', { name: 'Your characters' })).toHaveAttribute(
      'href',
      '/characters',
    )
  })

  it('shows an error when fetching worlds fails', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({ detail: 'boom' }, 500))
      .mockResolvedValueOnce(jsonResponse([]))
    renderLibrary()
    expect(await screen.findByText('boom')).toBeInTheDocument()
  })
})
