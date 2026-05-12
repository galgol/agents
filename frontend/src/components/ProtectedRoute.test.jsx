import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import { setToken } from '../auth.js'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>Secret content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('<ProtectedRoute />', () => {
  it('redirects to /login when no token is stored', () => {
    renderAt('/secret')
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Secret content')).toBeNull()
  })

  it('renders nested children when authenticated', () => {
    setToken('a-token')
    renderAt('/secret')
    expect(screen.getByText('Secret content')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).toBeNull()
  })
})
