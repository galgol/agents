import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

export default function ImageUpload({ value, onChange, label = 'Image' }) {
  const inputRef = useRef(null)
  const [localPreview, setLocalPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!localPreview) return
    return () => URL.revokeObjectURL(localPreview)
  }, [localPreview])

  async function onPick(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    setLocalPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const data = await api.upload('/upload', file)
      const url = data?.url || data?.image_url
      if (!url) throw new Error('Upload response missing url')
      onChange(url)
    } catch (err) {
      setError(err.message || 'Upload failed')
      setLocalPreview(null)
      onChange('')
    } finally {
      setUploading(false)
    }
  }

  const previewSrc = localPreview || value || null

  return (
    <div className="field">
      <span className="label">{label}</span>
      {previewSrc ? (
        <img className="media" src={previewSrc} alt="" />
      ) : (
        <div className="empty small">No image selected</div>
      )}
      <div className="row">
        <button
          type="button"
          className="btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : previewSrc ? 'Replace' : 'Choose image'}
        </button>
        {previewSrc && !uploading && (
          <button
            type="button"
            className="btn-link small"
            onClick={() => {
              setLocalPreview(null)
              onChange('')
              if (inputRef.current) inputRef.current.value = ''
            }}
          >
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        hidden
      />
      {error && <div className="error">{error}</div>}
    </div>
  )
}
