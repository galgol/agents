import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout.jsx'
import { getToken, setToken } from '../auth.js'

function renderLayout(initial = '/main') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/main" element={<Layout><h2>Inside</h2></Layout>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<Layout />', () => {
  it('renders header brand, navigation, and children', () => {
    const { container } = renderLayout()
    const brandLink = screen.getByRole('link', { name: 'The new Ebook era' })
    expect(brandLink).toHaveAttribute('href', '/main')
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Custom home icon' })).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.getByText('Inside')).toBeInTheDocument()
    const nav = container.querySelector('header nav')
    expect(nav?.compareDocumentPosition(brandLink)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('signing out clears the stored token and navigates to /login', async () => {
    setToken('jwt')
    renderLayout()
    expect(getToken()).toBe('jwt')

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(getToken()).toBeNull()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
