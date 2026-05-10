import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api.js'
import { isAuthenticated, setToken } from '../auth.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/library'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated()) {
    navigate(redirectTo, { replace: true })
    return null
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await api.post('/auth/login', { username, password })
      const token = data?.access_token || data?.token
      if (!token) throw new Error('Login response missing token')
      setToken(token)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? 'Invalid username or password'
          : err.message || 'Sign in failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="center-screen">
      <form className="card stack" style={{ width: 360 }} onSubmit={onSubmit}>
        <div className="stack-tight">
          <h1>Sign in</h1>
          <p className="muted small">Continue to your library.</p>
        </div>

        <div className="field">
          <label className="label" htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error" role="alert">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
