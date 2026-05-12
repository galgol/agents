import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CharacterCard from './CharacterCard.jsx'

describe('<CharacterCard />', () => {
  it('renders the character name', () => {
    render(<CharacterCard character={{ id: 1, name: 'Aria' }} />)
    expect(screen.getByRole('heading', { name: 'Aria' })).toBeInTheDocument()
  })

  it('renders appearance details when present', () => {
    render(
      <CharacterCard
        character={{
          id: 1,
          name: 'Aria',
          age: 28,
          gender: 'woman',
          hair: 'black',
          eyes: 'green',
          height: '170 cm',
          body_figure: 'athletic',
        }}
      />,
    )
    expect(
      screen.getByText('28 yrs · woman · black · green · 170 cm · athletic'),
    ).toBeInTheDocument()
  })

  it('renders traits and bio when present', () => {
    render(
      <CharacterCard
        character={{ id: 1, name: 'Aria', traits: 'brave, loyal', bio: 'A knight' }}
      />,
    )
    expect(screen.getByText('brave, loyal')).toBeInTheDocument()
    expect(screen.getByText('A knight')).toBeInTheDocument()
  })

  it('renders avatar image when image_url is set', () => {
    const { container } = render(
      <CharacterCard character={{ id: 1, name: 'Aria', image_url: '/static/images/a.png' }} />,
    )
    const img = container.querySelector('img.avatar')
    expect(img).toHaveAttribute('src', '/static/images/a.png')
  })

  it('renders an avatar placeholder when no image_url', () => {
    const { container } = render(<CharacterCard character={{ id: 1, name: 'Aria' }} />)
    expect(container.querySelector('img.avatar')).toBeNull()
    expect(container.querySelector('div.avatar')).toBeInTheDocument()
  })

  it('omits bio and traits when absent', () => {
    const { container } = render(<CharacterCard character={{ id: 1, name: 'Aria' }} />)
    expect(container.querySelectorAll('p').length).toBe(0)
    expect(container.querySelectorAll('span').length).toBe(0)
  })
})
