import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import WorldCard from '../components/WorldCard.jsx'
import CharacterCard from '../components/CharacterCard.jsx'
import { api } from '../api.js'

export default function Library() {
  const [worlds, setWorlds] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const worldNameById = useMemo(() => {
    const m = new Map()
    for (const w of worlds) m.set(w.id, w.name)
    return m
  }, [worlds])

  useEffect(() => {
    let cancelled = false
    Promise.all([api.get('/worlds'), api.get('/characters')])
      .then(([worldsData, charactersData]) => {
        if (!cancelled) {
          setWorlds(Array.isArray(worldsData) ? worldsData : [])
          setCharacters(Array.isArray(charactersData) ? charactersData : [])
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load library')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Layout>
      <div className="stack">
        <div className="spread">
          <div className="stack-tight">
            <h1>Main page</h1>
            <p className="muted small">
              Your worlds, characters, and books created by you in one place.
            </p>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link to="/worlds" className="btn">
              Worlds endpoint
            </Link>
            <Link to="/characters" className="btn btn-primary">
              Characters endpoint
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="stack" style={{ gap: '2rem' }}>
            <section className="stack">
              <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>
                Worlds (Books created by you)
              </h2>
              {worlds.length === 0 ? (
                <div className="empty">No worlds yet. Create your first one.</div>
              ) : (
                <div className="grid">
                  {worlds.map((w) => (
                    <WorldCard key={w.id} world={w} />
                  ))}
                </div>
              )}
            </section>

            <section className="stack">
              <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>
                Characters
              </h2>
              {characters.length === 0 ? (
                <div className="empty">
                  No characters yet. Use &quot;New character&quot; above to add one.
                </div>
              ) : (
                <div className="grid">
                  {characters.map((c) => (
                    <CharacterCard
                      key={c.id}
                      character={c}
                      subtitle={worldNameById.get(c.world_id) || undefined}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </Layout>
  )
}
