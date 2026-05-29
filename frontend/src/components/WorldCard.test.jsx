import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorldCard, { resolveCoverImageUrl } from './WorldCard.jsx'

function renderCard(world) {
  return render(
    <MemoryRouter>
      <WorldCard world={world} />
    </MemoryRouter>,
  )
}

describe('<WorldCard />', () => {
  it('resolves a relative cover path against an absolute API base', () => {
    expect(resolveCoverImageUrl('/static/images/cover.png', 'https://api.example.com')).toBe(
      'https://api.example.com/static/images/cover.png',
    )
  })

  it('renders name and links to the world detail page', () => {
    renderCard({ id: 42, name: 'Eldoria' })
    expect(screen.getByRole('heading', { name: 'Eldoria' })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/world/42')
  })

  it('renders the cover image when provided', () => {
    const { container } = renderCard({
      id: 1,
      name: 'Eldoria',
      cover_image_url: '/static/images/cover.png',
    })
    const img = container.querySelector('img.media')
    expect(img).toHaveAttribute('src', '/static/images/cover.png')
  })

  it('renders a placeholder media block when no cover image', () => {
    const { container } = renderCard({ id: 1, name: 'Eldoria' })
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.media')).toBeInTheDocument()
  })

  it('shows description when present', () => {
    renderCard({ id: 1, name: 'Eldoria', description: 'A magical realm' })
    expect(screen.getByText('A magical realm')).toBeInTheDocument()
  })

  it('omits description paragraph when missing', () => {
    const { container } = renderCard({ id: 1, name: 'Eldoria' })
    expect(container.querySelector('p')).toBeNull()
  })
})
