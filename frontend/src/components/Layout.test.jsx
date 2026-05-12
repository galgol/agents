import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout.jsx'
import { getToken, setToken } from '../auth.js'

function renderLayout(initial = '/characters') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/characters" element={<Layout><h2>Inside</h2></Layout>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<Layout />', () => {
  it('renders header brand, navigation, and children', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: 'Custom Ebook' })).toHaveAttribute('href', '/characters')
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByText('Inside')).toBeInTheDocument()
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
