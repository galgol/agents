import { Link } from 'react-router-dom'
import { resolveApiAssetUrl } from '../api.js'

export default function WorldCard({ world }) {
  const coverImageSrc = resolveApiAssetUrl(world.cover_image_url)

  return (
    <Link to={`/world/${world.id}`} className="card stack-tight" style={{ textDecoration: 'none' }}>
      {coverImageSrc ? (
        <img className="media" src={coverImageSrc} alt="" />
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
