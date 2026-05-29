import { Link } from 'react-router-dom'
import { API_BASE } from '../api.js'

export function resolveCoverImageUrl(coverImageUrl, apiBase = API_BASE) {
  if (!coverImageUrl) return null
  if (/^https?:\/\//.test(coverImageUrl)) return coverImageUrl
  if (!/^https?:\/\//.test(apiBase || '')) return coverImageUrl
  return `${apiBase}${coverImageUrl.startsWith('/') ? '' : '/'}${coverImageUrl}`
}

export default function WorldCard({ world }) {
  const coverImageSrc = resolveCoverImageUrl(world.cover_image_url)

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
