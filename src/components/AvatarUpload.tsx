'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Pencil } from 'lucide-react'
import { loadTeamProfiles, photoImgStyle, saveTeamProfile, TEAM_PROFILE_CHANGED_EVENT, type PhotoPosition } from '@/lib/team-profile-client'
import { PhotoPositionEditor } from '@/app/team/PhotoPositionEditor'

const AVATAR_KEY = 'fb-avatar'

/** Zmenší fotku (delší strana max 1400 px) a zachová ji celou — výřez si člověk vybere v editoru. */
function processFile(file: File, cb: (dataUrl: string) => void) {
  const img = new Image()
  const reader = new FileReader()
  reader.onload = () => {
    img.onload = () => {
      const max = 1400
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      cb(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

export function readAvatar(teamMemberId?: string): { photo: string | null; pos?: PhotoPosition } {
  if (teamMemberId) {
    const override = loadTeamProfiles()[teamMemberId]
    if (override?.photo) return { photo: override.photo, pos: override.photoPos }
  }
  try {
    return { photo: localStorage.getItem(AVATAR_KEY) }
  } catch {
    return { photo: null }
  }
}

/** Profilová fotka je sdílená s medailonkem v Týmu Four Bros — jedna fotka pro obě místa. */
export function AvatarUpload({ initial, teamMemberId, size = 64, fallback, hideGlow }: { initial: string; teamMemberId?: string; size?: number; fallback?: React.ReactNode; hideGlow?: boolean }) {
  const [avatar, setAvatar] = useState<{ photo: string | null; pos?: PhotoPosition }>({ photo: null })
  const [positioning, setPositioning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const refresh = () => setAvatar(readAvatar(teamMemberId))
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('fb-avatar-changed', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('fb-avatar-changed', refresh)
    }
  }, [teamMemberId])

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file, dataUrl => {
      if (teamMemberId) {
        saveTeamProfile(teamMemberId, { photo: dataUrl, photoPos: { x: 50, y: 50, zoom: 100 } })
        setPositioning(true) // hned po nahrání si vyber výřez
      } else {
        try { localStorage.setItem(AVATAR_KEY, dataUrl) } catch { /* noop */ }
        window.dispatchEvent(new Event('fb-avatar-changed'))
      }
    })
    e.target.value = ''
  }

  return (
    <div className="relative flex-shrink-0 group">
      {!hideGlow && <div className="absolute -inset-1 rounded-full opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, #834dfb, #a97cfc)', filter: 'blur(6px)' }} />}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative block"
        title="Nahrát novou fotku"
      >
        {avatar.photo ? (
          <div className="relative overflow-hidden" style={{ width: size, height: size }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar.photo} alt="Profilová fotka" draggable={false} style={photoImgStyle(avatar.pos)} />
          </div>
        ) : (
          fallback ? <div className="relative" style={{ width: size, height: size }}>{fallback}</div> :
          <div className="relative bg-navy flex items-center justify-center" style={{ width: size, height: size }}>
            <span className="text-white font-headline font-bold" style={{ fontSize: Math.round(size * 0.38) }}>{initial}</span>
          </div>
        )}
      </button>
      {avatar.photo && teamMemberId && size >= 100 && (
        <button
          type="button"
          onClick={() => setPositioning(true)}
          className="absolute left-0 right-0 bottom-0 bg-navy/80 text-white text-[10px] font-bold uppercase tracking-[0.08em] py-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        >
          Upravit výřez
        </button>
      )}
      {avatar.photo && teamMemberId && size < 100 && (
        <button
          type="button"
          onClick={() => setPositioning(true)}
          className="absolute -bottom-0.5 -left-0.5 w-6 h-6 rounded-full bg-white text-navy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
          title="Upravit pozici fotky"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-violet text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
        title="Nahrát novou fotku"
      >
        <Camera className="w-3 h-3" />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />

      {positioning && avatar.photo && teamMemberId && (
        <PhotoPositionEditor
          photo={avatar.photo}
          initial={avatar.pos}
          onSave={(pos) => { saveTeamProfile(teamMemberId, { photoPos: pos }); setPositioning(false) }}
          onCancel={() => setPositioning(false)}
        />
      )}
    </div>
  )
}

/** Small read-only avatar used in the top header — follows the same photo as Můj účet a medailonek v Týmu. */
export function HeaderAvatar({ initial, teamMemberId }: { initial: string; teamMemberId?: string }) {
  const [avatar, setAvatar] = useState<{ photo: string | null; pos?: PhotoPosition }>({ photo: null })

  useEffect(() => {
    const refresh = () => setAvatar(readAvatar(teamMemberId))
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('fb-avatar-changed', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('fb-avatar-changed', refresh)
    }
  }, [teamMemberId])

  return (
    <div className="relative flex-shrink-0">
      <div
        className="absolute -inset-0.5 rounded-full opacity-40"
        style={{ background: 'linear-gradient(135deg, #834dfb, #a97cfc)', filter: 'blur(4px)' }}
      />
      {avatar.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <span className="relative block w-8 h-8 overflow-hidden ring-2 ring-white">
          <img src={avatar.photo} alt="" style={photoImgStyle(avatar.pos)} />
        </span>
      ) : (
        <div className="relative w-8 h-8 bg-violet  flex items-center justify-center ring-2 ring-white">
          <span className="text-white text-xs font-semibold">{initial}</span>
        </div>
      )}
    </div>
  )
}
