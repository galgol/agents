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

export default function CharacterCard({ character, subtitle }) {
  const appearance = appearanceLine(character)
  return (
    <article className="card stack-tight">
      {subtitle ? <p className="muted small" style={{ margin: 0 }}>{subtitle}</p> : null}
      <div className="row">
        {character.image_url ? (
          <img className="avatar" src={character.image_url} alt="" />
        ) : (
          <div className="avatar" />
        )}
        <div className="stack-tight" style={{ gap: 2 }}>
          <h3>{character.name}</h3>
          {character.traits && (
            <span className="muted small">{character.traits}</span>
          )}
        </div>
      </div>
      {appearance ? <p className="small muted">{appearance}</p> : null}
      {character.characteristics ? (
        <p className="small">{character.characteristics}</p>
      ) : null}
      {character.bio && <p className="small">{character.bio}</p>}
    </article>
  )
}
