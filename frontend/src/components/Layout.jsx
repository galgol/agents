import { Link, useNavigate } from 'react-router-dom'
import { clearToken } from '../auth.js'
import customHomeIcon from '../assets/home-icon-issue-31.svg'

export default function Layout({ children }) {
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="app-header">
        <nav>
          <Link to="/main" className="home-link" aria-label="Home">
            <img
              src={customHomeIcon}
              alt="Custom home icon"
              className="home-link__icon"
            />
          </Link>
          <button type="button" className="btn-link" onClick={logout}>
            Sign out
          </button>
        </nav>
        <Link to="/main" className="brand">The new Ebook era</Link>
      </header>
      <main className="app-shell">{children}</main>
    </>
  )
}
