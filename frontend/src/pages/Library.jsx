import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import WorldCard from '../components/WorldCard.jsx'
import CharacterCard from '../components/CharacterCard.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import { api } from '../api.js'

export default function Library() {
  const [worlds, setWorlds] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

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

  function onCreated(world) {
    setWorlds((prev) => [world, ...prev])
    setCreating(false)
  }

  return (
    <Layout>
      <div className="stack">
        <div className="spread">
          <div className="stack-tight">
            <h1>Your worlds &amp; characters</h1>
            <p className="muted small">Everything you have created in one place.</p>
          </div>
          {!creating && (
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link to="/character/new" className="btn btn-primary">
                New character
              </Link>
              <button
                type="button"
                className="btn"
                onClick={() => setCreating(true)}
              >
                New world
              </button>
            </div>
          )}
        </div>

        {creating && (
          <NewWorldForm
            onCreated={onCreated}
            onCancel={() => setCreating(false)}
          />
        )}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="stack" style={{ gap: '2rem' }}>
            <section className="stack">
              <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>
                Worlds
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

function NewWorldForm({ onCreated, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const world = await api.post('/worlds', {
        name,
        description,
        cover_image_url: coverImageUrl || null,
      })
      onCreated(world)
    } catch (err) {
      setError(err.message || 'Failed to create world')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h2>New world</h2>

      <div className="field">
        <label className="label" htmlFor="world-name">Name</label>
        <input
          id="world-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="world-description">Description</label>
        <textarea
          id="world-description"
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <ImageUpload
        label="Cover image"
        value={coverImageUrl}
        onChange={setCoverImageUrl}
      />

      {error && <div className="error">{error}</div>}

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create world'}
        </button>
      </div>
    </form>
  )
}
