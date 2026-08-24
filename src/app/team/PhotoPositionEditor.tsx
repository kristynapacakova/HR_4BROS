'use client'

import { useState } from 'react'
import type { PhotoPosition } from '@/lib/team-profile-client'

export function PhotoPositionEditor({
  photo, initial, onSave, onCancel,
}: {
  photo: string
  initial?: PhotoPosition
  onSave: (pos: PhotoPosition) => void
  onCancel: () => void
}) {
  const [pos, setPos] = useState<PhotoPosition>(initial ?? { x: 50, y: 50, zoom: 100 })

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-headline font-semibold text-navy mb-4">Upravit fotku</h3>

        <div className="w-40 h-40 rounded-full overflow-hidden mx-auto ring-4 ring-alice shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: `scale(${pos.zoom / 100})` }}
          />
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Přiblížení</span><span>{pos.zoom}%</span>
            </label>
            <input
              type="range" min={100} max={250} value={pos.zoom}
              onChange={(e) => setPos((p) => ({ ...p, zoom: Number(e.target.value) }))}
              className="w-full accent-violet"
            />
          </div>
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Vodorovně</span>
            </label>
            <input
              type="range" min={0} max={100} value={pos.x}
              onChange={(e) => setPos((p) => ({ ...p, x: Number(e.target.value) }))}
              className="w-full accent-violet"
            />
          </div>
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Svisle</span>
            </label>
            <input
              type="range" min={0} max={100} value={pos.y}
              onChange={(e) => setPos((p) => ({ ...p, y: Number(e.target.value) }))}
              className="w-full accent-violet"
            />
          </div>
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
