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
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [hair, setHair] = useState('')
  const [eyes, setEyes] = useState('')
  const [height, setHeight] = useState('')
  const [bodyFigure, setBodyFigure] = useState('')
  const [characteristics, setCharacteristics] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const ageTrim = age.trim()
      const ageNum =
        ageTrim === '' ? null : Number.parseInt(ageTrim, 10)
      const body = {
        ...(worldId ? { world_id: worldId } : {}),
        name,
        bio: bio.trim() || null,
        traits: traits.trim() || null,
        image_url: imageUrl || null,
        age: ageNum != null && !Number.isNaN(ageNum) ? ageNum : null,
        gender: gender.trim() || null,
        hair: hair.trim() || null,
        eyes: eyes.trim() || null,
        height: height.trim() || null,
        body_figure: bodyFigure.trim() || null,
        characteristics: characteristics.trim() || null,
      }
      await api.post('/characters', body)
      if (worldId) {
        navigate(`/world/${worldId}`)
      } else {
        navigate('/main')
      }
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
          <Link to={worldId ? `/world/${worldId}` : '/main'} className="small">
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

        <div className="field">
          <label className="label" htmlFor="char-age">Age</label>
          <input
            id="char-age"
            className="input"
            type="number"
            min={0}
            max={200}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-gender">Gender</label>
          <input
            id="char-gender"
            className="input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-hair">Hair</label>
          <input
            id="char-hair"
            className="input"
            value={hair}
            onChange={(e) => setHair(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-eyes">Eyes</label>
          <input
            id="char-eyes"
            className="input"
            value={eyes}
            onChange={(e) => setEyes(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-height">Height</label>
          <input
            id="char-height"
            className="input"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 5'8&quot; or 172 cm"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-body">Body figure</label>
          <input
            id="char-body"
            className="input"
            value={bodyFigure}
            onChange={(e) => setBodyFigure(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="char-characteristics">Characteristics</label>
          <textarea
            id="char-characteristics"
            className="textarea"
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            placeholder="Personality, habits, speech, etc."
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
