import { Link, useNavigate } from 'react-router-dom'
import { clearToken } from '../auth.js'
import comicBookHomeIcon from '../assets/comic-book-home.svg'

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
          <Link to="/main" className="home-link" aria-label="Home">
            <img
              src={comicBookHomeIcon}
              alt="Comic book home icon"
              className="home-link__icon"
            />
          </Link>
          <button type="button" className="btn-link" onClick={logout}>
            Sign out
          </button>
        </nav>
      </header>
      <main className="app-shell">{children}</main>
    </>
  )
}
