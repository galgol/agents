import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import WorldCard from '../components/WorldCard.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import { api } from '../api.js'

export default function Worlds() {
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.get('/worlds')
      .then((worldsData) => {
        if (!cancelled) {
          setWorlds(Array.isArray(worldsData) ? worldsData : [])
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load worlds')
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
            <Link to="/main" className="small">← Main page</Link>
            <h1>Worlds</h1>
            <p className="muted small">All your worlds. Create a new one from this endpoint.</p>
          </div>
          {!creating && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCreating(true)}
            >
              New world
            </button>
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
        ) : worlds.length === 0 ? (
          <div className="empty">No worlds yet. Create your first one.</div>
        ) : (
          <div className="grid">
            {worlds.map((world) => (
              <WorldCard key={world.id} world={world} />
            ))}
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
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(event) {
    event.preventDefault()
    if (uploading) return
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
        onUploadingChange={setUploading}
      />

      {error && <div className="error">{error}</div>}

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
          {submitting ? 'Creating…' : uploading ? 'Uploading image…' : 'Create world'}
        </button>
      </div>
    </form>
  )
}
