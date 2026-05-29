import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      await screen.findByRole('heading', { level: 1, name: 'Personal Shelf' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Your worlds & characters : everything you have created in one place.'),
    ).toBeInTheDocument()
  })

  it('shows an error when fetching worlds fails', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({ detail: 'boom' }, 500))
      .mockResolvedValueOnce(jsonResponse([]))
    renderLibrary()
    expect(await screen.findByText('boom')).toBeInTheDocument()
  })

  it('opens the new-world form and creates a world', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse({ id: 7, name: 'New', description: '', cover_image_url: null }, 201),
      )
    renderLibrary()
    await screen.findByText(/No worlds yet/)

    await userEvent.click(screen.getByRole('button', { name: 'New world' }))
    await userEvent.type(screen.getByLabelText('Name'), 'New')
    await userEvent.click(screen.getByRole('button', { name: 'Create world' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'New' })).toBeInTheDocument())
    const createCall = fetch.mock.calls[2]
    expect(createCall[0]).toBe('/worlds')
    expect(JSON.parse(createCall[1].body)).toEqual({
      name: 'New',
      description: '',
      cover_image_url: null,
    })
  })

  it('creates a world with an uploaded cover and shows it in the card preview', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ url: '/static/images/cover.png' }, 201))
      .mockResolvedValueOnce(
        jsonResponse({ id: 7, name: 'New', description: '', cover_image_url: '/static/images/cover.png' }, 201),
      )
    const { container } = renderLibrary()
    await screen.findByText(/No worlds yet/)

    await userEvent.click(screen.getByRole('button', { name: 'New world' }))
    await userEvent.type(screen.getByLabelText('Name'), 'New')

    const file = new File([new Uint8Array([1, 2, 3])], 'cover.png', { type: 'image/png' })
    const input = container.querySelector('input[type="file"]')
    await userEvent.upload(input, file)

    const createButton = screen.getByRole('button', { name: 'Create world' })
    await waitFor(() => expect(createButton).toBeEnabled())
    await userEvent.click(createButton)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'New' })).toBeInTheDocument())
    const img = container.querySelector('img.media')
    expect(img).toHaveAttribute('src', '/static/images/cover.png')

    const createCall = fetch.mock.calls[3]
    expect(createCall[0]).toBe('/worlds')
    expect(JSON.parse(createCall[1].body)).toEqual({
      name: 'New',
      description: '',
      cover_image_url: '/static/images/cover.png',
    })
  })

  it('cancel button closes the form without calling the API', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([]))
    renderLibrary()
    await screen.findByText(/No worlds yet/)
    await userEvent.click(screen.getByRole('button', { name: 'New world' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('button', { name: 'Create world' })).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
