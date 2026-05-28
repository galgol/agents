import { Link, useNavigate } from 'react-router-dom'
import { clearToken } from '../auth.js'

export default function Layout({ children }) {
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="app-header">
        <Link to="/main" className="brand">The new Ebook era</Link>
        <nav>
          <Link to="/main">Home</Link>
          <button type="button" className="btn-link" onClick={logout}>
            Sign out
          </button>
        </nav>
      </header>
      <main className="app-shell">{children}</main>
    </>
  )
}
