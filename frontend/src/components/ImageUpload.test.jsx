import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUpload from './ImageUpload.jsx'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

describe('<ImageUpload />', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders default label and empty state', () => {
    render(<ImageUpload value="" onChange={() => {}} />)
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('No image selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose image' })).toBeInTheDocument()
  })

  it('uses a custom label when provided', () => {
    render(<ImageUpload label="Portrait" value="" onChange={() => {}} />)
    expect(screen.getByText('Portrait')).toBeInTheDocument()
  })

  it('shows preview from an existing value without uploading', () => {
    const { container } = render(<ImageUpload value="/static/images/x.png" onChange={() => {}} />)
    const img = container.querySelector('img.media')
    expect(img).toHaveAttribute('src', '/static/images/x.png')
    expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('uploads a chosen file and calls onChange with the returned url', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ url: '/static/images/abc.png' }, 201))
    const onChange = vi.fn()
    const { container } = render(<ImageUpload value="" onChange={onChange} />)
    const file = new File([new Uint8Array([1, 2, 3])], 'pic.png', { type: 'image/png' })

    const input = container.querySelector('input[type="file"]')
    await userEvent.upload(input, file)

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('/static/images/abc.png'))
    const opts = fetch.mock.calls[0][1]
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
  })

  it('shows an error and clears the value when upload fails', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ detail: 'Unsupported file type' }, 400))
    const onChange = vi.fn()
    const { container } = render(<ImageUpload value="" onChange={onChange} />)
    const file = new File([new Uint8Array([0])], 'pic.png', { type: 'image/png' })

    const input = container.querySelector('input[type="file"]')
    await userEvent.upload(input, file)

    await waitFor(() =>
      expect(screen.getByText('Unsupported file type')).toBeInTheDocument(),
    )
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('Remove button clears the current value', async () => {
    const onChange = vi.fn()
    render(<ImageUpload value="/static/images/x.png" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
