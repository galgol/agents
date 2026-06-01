import { Children, useMemo, useRef } from 'react'

export default function HorizontalCardRow({ children, label }) {
  const viewportRef = useRef(null)
  const items = useMemo(() => Children.toArray(children), [children])

  function scroll(direction) {
    const viewport = viewportRef.current
    if (!viewport) return
    const offset = Math.max(viewport.clientWidth * 0.8, 220) * direction
    if (typeof viewport.scrollBy === 'function') {
      viewport.scrollBy({ left: offset, behavior: 'smooth' })
      return
    }
    viewport.scrollLeft += offset
  }

  const controlsDisabled = items.length < 2

  return (
    <div className="card-row">
      <button
        type="button"
        className="card-row__control"
        aria-label={`Scroll ${label} left`}
        onClick={() => scroll(-1)}
        disabled={controlsDisabled}
      >
        ←
      </button>
      <div className="card-row__viewport" ref={viewportRef}>
        {items.map((item, index) => (
          <div className="card-row__item" key={item.key ?? `card-row-item-${index}`}>
            {item}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="card-row__control"
        aria-label={`Scroll ${label} right`}
        onClick={() => scroll(1)}
        disabled={controlsDisabled}
      >
        →
      </button>
    </div>
  )
}
