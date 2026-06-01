import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import CharacterCard from '../components/CharacterCard.jsx'
import HorizontalCardRow from '../components/HorizontalCardRow.jsx'
import { api } from '../api.js'

export default function Characters() {
  const [worlds, setWorlds] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const worldNameById = useMemo(() => {
    const m = new Map()
    for (const world of worlds) m.set(world.id, world.name)
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
        if (!cancelled) setError(err.message || 'Failed to load characters')
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
            <Link to="/main" className="small">← Your Shelf</Link>
            <h1>Characters</h1>
            <p className="muted small">All your characters. Create a new one from this endpoint.</p>
          </div>
          <Link to="/character/new" className="btn btn-primary">
            New character
          </Link>
        </div>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : characters.length === 0 ? (
          <div className="empty">
            No characters yet. Use &quot;New character&quot; above to add one.
          </div>
        ) : (
          <HorizontalCardRow label="characters">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                subtitle={worldNameById.get(character.world_id) || undefined}
              />
            ))}
          </HorizontalCardRow>
        )}
      </div>
    </Layout>
  )
}
