'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Cake, Briefcase, Users2, Camera, Pencil, Plus, X } from 'lucide-react'
import {
  loadTeamProfiles, saveTeamProfile, TEAM_PROFILE_CHANGED_EVENT,
  type TeamProfileOverride, type PhotoPosition,
} from '@/lib/team-profile-client'
import { Medailonek } from '../Medailonek'
import { PhotoPositionEditor } from '../PhotoPositionEditor'
import { formatBirthday } from '../TeamClient'

interface Member {
  id: string
  name: string
  email: string
  position: string
  department: string
  seniority: string | null
  employmentType: string
  birthday: string | null
  bio: string | null
  emoji: string
}

const SENIORITY_LABEL: Record<string, string> = {
  JUNIOR: 'Junior', MEDIOR: 'Medior', SENIOR: 'Senior', LEAD: 'Lead',
}

const DEPT_COLORS: Record<string, string> = {
  Creative: 'bg-violet/10 text-violet',
  Performance: 'bg-blue-50 text-blue-700',
  Account: 'bg-amber-50 text-amber-700',
  Sales: 'bg-green-50 text-green-700',
  Backoffice: 'bg-slate-100 text-slate-600',
  HR: 'bg-pink-50 text-pink-700',
  Vývoj: 'bg-indigo-50 text-indigo-700',
}

function readFileAsDataUrl(file: File, maxSize: number, cb: (dataUrl: string) => void) {
  const img = new Image()
  const reader = new FileReader()
  reader.onload = () => {
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      cb(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

function SideNavTile({ member, override, direction }: {
  member: { id: string; name: string; emoji: string }
  override?: TeamProfileOverride
  direction: 'prev' | 'next'
}) {
  return (
    <Link
      href={`/team/${member.id}`}
      className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center gap-1.5 group"
    >
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-white shadow-sm bg-[#F7F8FE] flex items-center justify-center group-hover:ring-violet/30 transition-all">
        {override?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={override.photo}
            alt={member.name}
            className="w-full h-full object-cover"
            style={{
              objectPosition: `${override.photoPos?.x ?? 50}% ${override.photoPos?.y ?? 50}%`,
              transform: `scale(${(override.photoPos?.zoom ?? 100) / 100})`,
            }}
          />
        ) : (
          <span className="text-xl">{member.emoji}</span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 text-center leading-tight group-hover:text-navy transition-colors truncate w-full">
        {direction === 'prev' && <ChevronLeft className="w-3 h-3 inline-block -mt-0.5" />}
        {member.name.split(' ')[0]}
        {direction === 'next' && <ChevronRight className="w-3 h-3 inline-block -mt-0.5" />}
      </p>
    </Link>
  )
}

export function MemberProfileClient({
  member, prev, next, viewerEmail,
}: {
  member: Member
  prev: { id: string; name: string; emoji: string }
  next: { id: string; name: string; emoji: string }
  viewerEmail: string | null
}) {
  const [profiles, setProfiles] = useState<Record<string, TeamProfileOverride>>({})
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [positioning, setPositioning] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const isMe = !!viewerEmail && viewerEmail.toLowerCase() === member.email.toLowerCase()
  const override = profiles[member.id] ?? {}

  useEffect(() => {
    const refresh = () => setProfiles(loadTeamProfiles())
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [member.id])

  useEffect(() => {
    setBioDraft(override.bio ?? member.bio ?? '')
    setEditingBio(false)
  }, [member.id, override.bio, member.bio])

  const save = (patch: TeamProfileOverride) => saveTeamProfile(member.id, patch)

  const onPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    readFileAsDataUrl(file, 900, (dataUrl) => {
      save({ photo: dataUrl, photoPos: { x: 50, y: 50, zoom: 100 } })
      setPositioning(true)
    })
    e.target.value = ''
  }

  const onGalleryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    readFileAsDataUrl(file, 700, (dataUrl) => save({ gallery: [...(override.gallery ?? []), dataUrl] }))
    e.target.value = ''
  }

  const removeGalleryPhoto = (idx: number) => {
    save({ gallery: (override.gallery ?? []).filter((_, i) => i !== idx) })
  }

  const savePhotoPos = (pos: PhotoPosition) => {
    save({ photoPos: pos })
    setPositioning(false)
  }

  const gallery = override.gallery ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/team" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy transition-colors">
        <ArrowLeft className="w-4 h-4" /> Zpět na tým
      </Link>

      {/* Hero medailonek, flanked by prev/next member tiles */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <SideNavTile member={prev} override={profiles[prev.id]} direction="prev" />

        <div className="flex-1 max-w-xl bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="relative">
            <Medailonek photo={override.photo} photoPos={override.photoPos} emoji={member.emoji} name={member.name} size={140} />
            {isMe && (
              <div className="absolute bottom-2 right-2 flex gap-1.5">
                {override.photo && (
                  <button
                    onClick={() => setPositioning(true)}
                    className="w-8 h-8 rounded-full bg-white text-navy shadow flex items-center justify-center hover:bg-slate-50 transition-colors"
                    title="Upravit pozici fotky"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-violet text-white shadow flex items-center justify-center hover:bg-violet-dark transition-colors"
                  title="Nahrát fotku"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoPick} />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-headline font-bold text-navy mt-3">{member.name}</h1>
          <p className="text-slate-500 mt-0.5">{member.position}</p>

          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${DEPT_COLORS[member.department] ?? 'bg-slate-100 text-slate-600'}`}>
              <Users2 className="w-3 h-3" />
              {member.department}
            </span>
            {member.seniority && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <Briefcase className="w-3 h-3" />
                {SENIORITY_LABEL[member.seniority] ?? member.seniority}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-400">
              <Cake className="w-3 h-3" />
              {member.birthday ? formatBirthday(member.birthday) : 'Narozeniny neuvedeny'}
            </span>
          </div>
        </div>

        <SideNavTile member={next} override={profiles[next.id]} direction="next" />
      </div>

      {/* Příběh */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Příběh</p>
          {isMe && !editingBio && (
            <button onClick={() => setEditingBio(true)} className="flex items-center gap-1 text-xs text-violet hover:text-violet-dark transition-colors">
              <Pencil className="w-3 h-3" /> Upravit
            </button>
          )}
        </div>
        {editingBio ? (
          <div className="space-y-2">
            <textarea
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent resize-none"
              placeholder="Pár vět o tobě…"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { save({ bio: bioDraft.trim() }); setEditingBio(false) }}
                className="px-3 py-1.5 bg-violet hover:bg-violet-dark text-white text-xs font-medium rounded-full transition-colors"
              >
                Uložit
              </button>
              <button onClick={() => setEditingBio(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-navy transition-colors">
                Zrušit
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">{override.bio ?? member.bio ?? 'Zatím tu nic není.'}</p>
        )}
      </div>

      {/* Galerie */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Fotky</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {gallery.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              {isMe && (
                <button
                  onClick={() => removeGalleryPhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {isMe && (
            <label className="aspect-square rounded-lg border border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors text-slate-300 hover:text-violet">
              <Plus className="w-5 h-5" />
              <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={onGalleryPick} />
            </label>
          )}
          {!isMe && gallery.length === 0 && (
            <p className="col-span-4 text-xs text-slate-400">Zatím žádné fotky.</p>
          )}
        </div>
      </div>

      {positioning && override.photo && (
        <PhotoPositionEditor
          photo={override.photo}
          initial={override.photoPos}
          onSave={savePhotoPos}
          onCancel={() => setPositioning(false)}
        />
      )}
    </div>
  )
}
