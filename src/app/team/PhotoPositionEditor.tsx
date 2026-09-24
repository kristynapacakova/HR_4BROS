'use client'

import { useEffect, useRef, useState } from 'react'
import type { PhotoPosition } from '@/lib/team-profile-client'

const BOX = 240 // editor preview size, px

export function PhotoPositionEditor({
  photo, initial, onSave, onCancel,
}: {
  photo: string
  initial?: PhotoPosition
  onSave: (pos: PhotoPosition) => void
  onCancel: () => void
}) {
  const [pos, setPos] = useState<PhotoPosition>(initial ?? { x: 50, y: 50, zoom: 100 })
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = photo
  }, [photo])

  if (!natural) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-sm text-slate-400">Načítám fotku…</div>
      </div>
    )
  }

  const baseScale = Math.max(BOX / natural.w, BOX / natural.h)
  const scale = baseScale * (pos.zoom / 100)
  const dispW = natural.w * scale
  const dispH = natural.h * scale
  const slackX = Math.max(0, dispW - BOX)
  const slackY = Math.max(0, dispH - BOX)
  const translateX = -(pos.x / 100) * slackX
  const translateY = -(pos.y / 100) * slackY

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const newX = slackX === 0 ? 50 : dragRef.current.posX - (dx / slackX) * 100
    const newY = slackY === 0 ? 50 : dragRef.current.posY - (dy / slackY) * 100
    setPos((p) => ({ ...p, x: Math.min(100, Math.max(0, newX)), y: Math.min(100, Math.max(0, newY)) }))
  }

  const onPointerUp = () => { dragRef.current = null }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-headline font-semibold text-navy mb-1">Upravit fotku</h3>
        <p className="text-xs text-slate-400 mb-4">Foto přetáhni myší nebo prstem, ať je vidět obličej.</p>

        <div
          className="rounded-full overflow-hidden mx-auto ring-4 ring-alice shadow-md relative touch-none select-none cursor-grab active:cursor-grabbing"
          style={{ width: BOX, height: BOX }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            draggable={false}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ width: dispW, height: dispH, transform: `translate(${translateX}px, ${translateY}px)` }}
          />
        </div>

        <div className="mt-6">
          <label className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Přiblížení</span><span>{pos.zoom}%</span>
          </label>
          <input
            type="range" min={100} max={300} value={pos.zoom}
            onChange={(e) => setPos((p) => ({ ...p, zoom: Number(e.target.value) }))}
            className="w-full accent-violet"
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => onSave(pos)}
            className="px-4 py-2 bg-violet hover:bg-violet-dark text-white text-sm font-medium rounded-full transition-colors"
          >
            Uložit
          </button>
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy transition-colors">
            Zrušit
          </button>
        </div>
      </div>
    </div>
  )
}
