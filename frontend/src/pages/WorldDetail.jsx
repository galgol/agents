import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import CharacterCard from '../components/CharacterCard.jsx'
import { api } from '../api.js'

const initialState = { loading: true, world: null, characters: [], error: null }

export default function WorldDetail() {
  const { id } = useParams()
  const [state, setState] = useState(initialState)
  const { loading, world, characters, error } = state

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get(`/worlds/${id}`).catch(() => null),
      api.get(`/characters?world_id=${encodeURIComponent(id)}`),
    ])
      .then(([w, chars]) => {
        if (cancelled) return
        setState({
          loading: false,
          world: w,
          characters: Array.isArray(chars) ? chars : [],
          error: null,
        })
      })
      .catch((err) => {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: err.message || 'Failed to load world' }))
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <Layout>
      <div className="stack">
        <div className="spread">
          <div className="stack-tight">
            <Link to="/main" className="small">← Home</Link>
            <h1>{world?.name || 'World'}</h1>
            {world?.description && (
              <p className="muted">{world.description}</p>
            )}
          </div>
          <Link to={`/character/new?world_id=${id}`} className="btn btn-primary">
            New character
          </Link>
        </div>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : characters.length === 0 ? (
          <div className="empty">No characters yet in this world.</div>
        ) : (
          <div className="grid">
            {characters.map((c) => (
              <CharacterCard key={c.id} character={c} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
