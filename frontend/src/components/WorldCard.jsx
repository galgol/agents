import { Link } from 'react-router-dom'

export default function WorldCard({ world }) {
  return (
    <Link to={`/world/${world.id}`} className="card stack-tight" style={{ textDecoration: 'none' }}>
      {world.cover_image_url ? (
        <img className="media" src={world.cover_image_url} alt="" />
      ) : (
        <div className="media" />
      )}
      <h3>{world.name}</h3>
      {world.description && (
        <p className="muted small">{world.description}</p>
      )}
    </Link>
  )
}
