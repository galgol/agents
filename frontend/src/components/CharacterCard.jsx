export default function CharacterCard({ character }) {
  return (
    <article className="card stack-tight">
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
      {character.bio && <p className="small">{character.bio}</p>}
    </article>
  )
}
