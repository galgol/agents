import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { api } from '../api.js'

function appearanceLine(character) {
  const parts = [
    character.age != null && character.age !== '' ? `${character.age} yrs` : null,
    character.gender,
    character.hair,
    character.eyes,
    character.height,
    character.body_figure,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}

const initialState = { loading: true, character: null, error: null }

export default function CharacterDetail() {
  const { id } = useParams()
  const [state, setState] = useState(initialState)
  const { loading, character, error } = state

  useEffect(() => {
    let cancelled = false
    api
      .get(`/characters/${id}`)
      .then((c) => {
        if (!cancelled) setState({ loading: false, character: c, error: null })
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ loading: false, character: null, error: err.message || 'Failed to load character' })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const appearance = character ? appearanceLine(character) : null

  return (
    <Layout>
      <div className="stack">
        <div className="stack-tight">
          <Link to="/main" className="small">← Home</Link>
          <h1>{character?.name || 'Character'}</h1>
          {character?.traits && (
            <p className="muted">{character.traits}</p>
          )}
        </div>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : character ? (
          <article className="card stack">
            {character.image_url ? (
              <img className="media" src={character.image_url} alt="" />
            ) : null}
            {appearance ? <p className="small muted">{appearance}</p> : null}
            {character.characteristics ? (
              <p>{character.characteristics}</p>
            ) : null}
            {character.bio ? <p>{character.bio}</p> : null}
          </article>
        ) : null}
      </div>
    </Layout>
  )
}
