'use client'

import { useEffect, useRef, useState } from 'react'
import type { PhotoPosition } from '@/lib/team-profile-client'

const BOX = 300 // editor preview size, px

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
        <div className="bg-white shadow-xl p-8 text-sm text-slate-400">Načítám fotku…</div>
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

  const onWheel = (e: React.WheelEvent) => {
    setPos((p) => ({ ...p, zoom: Math.min(300, Math.max(100, Math.round(p.zoom - e.deltaY * 0.15))) }))
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/60 p-4" onClick={onCancel}>
      <div className="bg-white border border-navy w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <p className="kicker text-navy/50 mb-1">Fotka</p>
        <h3 className="font-headline text-navy text-[22px] mb-1" style={{ fontWeight: 600 }}>Vyber výřez</h3>
        <p className="text-sm text-navy/60 mb-5">Fotku přetáhni myší nebo prstem a přibliž ji, ať je vidět přesně to, co chceš.</p>

        <div
          className="overflow-hidden mx-auto relative touch-none select-none cursor-grab active:cursor-grabbing bg-alice border border-[rgba(13,33,79,0.14)]"
          style={{ width: BOX, height: BOX }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            draggable={false}
            className="absolute top-0 left-0 pointer-events-none max-w-none"
            style={{ width: dispW, height: dispH, transform: `translate(${translateX}px, ${translateY}px)` }}
          />
          {/* vodítka třetin */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.45) 1px, transparent 1px)',
            backgroundSize: `${BOX / 3}px ${BOX / 3}px`,
          }} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-navy/50 mb-1.5">
            <span>Přiblížení</span><span className="text-navy">{pos.zoom} %</span>
          </div>
          <input
            type="range" min={100} max={300} value={pos.zoom}
            onChange={(e) => setPos((p) => ({ ...p, zoom: Number(e.target.value) }))}
            className="w-full accent-navy"
          />
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => onSave(pos)}
            className="btn-pill bg-gold hover:bg-navy hover:text-white text-navy text-[12px] font-bold uppercase tracking-[0.06em] px-6 py-3 transition-colors"
          >
            Uložit výřez
          </button>
          <button onClick={() => setPos({ x: 50, y: 50, zoom: 100 })} className="text-sm font-semibold text-navy/60 hover:text-navy transition-colors">
            Na střed
          </button>
          <button onClick={onCancel} className="ml-auto text-sm font-semibold text-navy/60 hover:text-navy transition-colors">
            Zrušit
          </button>
        </div>
      </div>
    </div>
  )
}
