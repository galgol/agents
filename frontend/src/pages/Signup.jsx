import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE, ApiError } from '../api.js'
import { isAuthenticated, setToken } from '../auth.js'

export default function Signup() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated()) {
    navigate('/main', { replace: true })
    return null
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!registerRes.ok) {
        let detail = `Request failed (${registerRes.status})`
        try {
          const data = await registerRes.json()
          if (data?.detail && typeof data.detail === 'string') detail = data.detail
        } catch {
          // response wasn't JSON; keep default message
        }
        throw new ApiError(detail, registerRes.status)
      }

      const body = new URLSearchParams({ username, password })
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (!loginRes.ok) {
        throw new ApiError(`Request failed (${loginRes.status})`, loginRes.status)
      }
      const data = await loginRes.json()
      const token = data?.access_token || data?.token
      if (!token) throw new Error('Login response missing token')
      setToken(token)
      navigate('/main', { replace: true })
    } catch (err) {
      const message = err?.message || 'Sign up failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="center-screen">
      <form className="card stack" style={{ width: 360 }} onSubmit={onSubmit}>
        <div className="stack-tight">
          <h1>Create account</h1>
          <p className="muted small">Start building your worlds and characters.</p>
        </div>

        <div className="field">
          <label className="label" htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            type="text"
            autoComplete="username"
            minLength={3}
            maxLength={64}
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
            autoComplete="new-password"
            minLength={6}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error" role="alert">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="muted small" style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
