import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import { api } from '../api.js'

export default function CharacterForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const worldId = searchParams.get('world_id') || ''

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [traits, setTraits] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(event) {
    event.preventDefault()
    if (!worldId) {
      setError('Missing world. Open this form from a world page.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/characters', {
        world_id: worldId,
        name,
        bio,
        traits,
        image_url: imageUrl || null,
      })
      navigate(`/world/${worldId}`)
    } catch (err) {
      setError(err.message || 'Failed to create character')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <form className="card stack" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
        <div className="stack-tight">
          <Link to={worldId ? `/world/${worldId}` : '/library'} className="small">
            ← Back
          </Link>
          <h1>New character</h1>
        </div>

        <div className="field">
          <label className="label" htmlFor="char-name">Name</label>
          <input
            id="char-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-bio">Bio</label>
          <textarea
            id="char-bio"
            className="textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-traits">Traits</label>
          <textarea
            id="char-traits"
            className="textarea"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            placeholder="e.g. brave, cunning, loyal"
          />
        </div>

        <ImageUpload
          label="Portrait"
          value={imageUrl}
          onChange={setImageUrl}
        />

        {error && <div className="error">{error}</div>}

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create character'}
          </button>
        </div>
      </form>
    </Layout>
  )
}
