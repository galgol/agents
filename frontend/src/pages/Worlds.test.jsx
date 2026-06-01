import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Worlds from './Worlds.jsx'
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

function renderWorlds() {
  return render(
    <MemoryRouter>
      <Worlds />
    </MemoryRouter>,
  )
}

describe('<Worlds />', () => {
  beforeEach(() => {
    setToken('tok')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders worlds returned by the API', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse([
        { id: 1, name: 'Eldoria', description: 'magical', cover_image_url: null },
        { id: 2, name: 'Borea', description: null, cover_image_url: null },
      ]),
    )
    renderWorlds()
    expect(await screen.findByRole('heading', { name: 'Eldoria' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Borea' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scroll worlds left' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scroll worlds right' })).toBeInTheDocument()
  })

  it('opens the new-world form and creates a world', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse({ id: 7, name: 'New', description: '', cover_image_url: null }, 201),
      )
    renderWorlds()
    await screen.findByText(/No worlds yet/)

    await userEvent.click(screen.getByRole('button', { name: 'New world' }))
    await userEvent.type(screen.getByLabelText('Name'), 'New')
    await userEvent.click(screen.getByRole('button', { name: 'Create world' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'New' })).toBeInTheDocument())
    const createCall = fetch.mock.calls[1]
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
      .mockResolvedValueOnce(jsonResponse({ url: '/static/images/cover.png' }, 201))
      .mockResolvedValueOnce(
        jsonResponse({ id: 7, name: 'New', description: '', cover_image_url: '/static/images/cover.png' }, 201),
      )
    const { container } = renderWorlds()
    await screen.findByText(/No worlds yet/)

    await userEvent.click(screen.getByRole('button', { name: 'New world' }))
    await userEvent.type(screen.getByLabelText('Name'), 'New')

    const file = new File([new Uint8Array([1, 2, 3])], 'cover.png', { type: 'image/png' })
    const input = container.querySelector('input[type="file"]')
    await userEvent.upload(input, file)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Create world' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Create world' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'New' })).toBeInTheDocument())
    const img = container.querySelector('img.media')
    expect(img).toHaveAttribute('src', '/static/images/cover.png')

    const createCall = fetch.mock.calls[2]
    expect(createCall[0]).toBe('/worlds')
    expect(JSON.parse(createCall[1].body)).toEqual({
      name: 'New',
      description: '',
      cover_image_url: '/static/images/cover.png',
    })
  })
})
