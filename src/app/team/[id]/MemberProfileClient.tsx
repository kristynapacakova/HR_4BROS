'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Cake, Briefcase, Users2, Camera, Pencil, Plus, X, Sparkles, HeartHandshake } from 'lucide-react'
import {
  loadTeamProfiles, saveTeamProfile, TEAM_PROFILE_CHANGED_EVENT,
  type TeamProfileOverride, type PhotoPosition,
} from '@/lib/team-profile-client'
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

const PERSONALITY_TYPES: Record<string, { name: string; desc: string }> = {
  INTJ: { name: 'Architekt', desc: 'Strategický myslitel s plánem na vše.' },
  INTP: { name: 'Logik', desc: 'Nenasytný hladovec po poznání.' },
  ENTJ: { name: 'Velitel', desc: 'Odvážný a vynalézavý vůdce.' },
  ENTP: { name: 'Hádavec', desc: 'Chytrý a zvídavý myslitel, miluje výzvy.' },
  INFJ: { name: 'Obhájce', desc: 'Tichý idealista s pevnými principy.' },
  INFP: { name: 'Mediátor', desc: 'Poetický a laskavý altruista.' },
  ENFJ: { name: 'Protagonista', desc: 'Charismatický a inspirativní vůdce.' },
  ENFP: { name: 'Aktivista', desc: 'Nadšený a kreativní duch svobodný.' },
  ISTJ: { name: 'Logistik', desc: 'Praktický a spolehlivý organizátor.' },
  ISFJ: { name: 'Ochránce', desc: 'Oddaný a vřelý strážce.' },
  ESTJ: { name: 'Výkonný ředitel', desc: 'Skvělý manažer věcí i lidí.' },
  ESFJ: { name: 'Konzul', desc: 'Pečující a společenský organizátor.' },
  ISTP: { name: 'Virtuóz', desc: 'Odvážný experimentátor se vším náčiním.' },
  ISFP: { name: 'Dobrodruh', desc: 'Flexibilní a okouzlující umělec.' },
  ESTP: { name: 'Podnikatel', desc: 'Chytrý, energický a vnímavý.' },
  ESFP: { name: 'Bavič', desc: 'Spontánní, energický a nadšený.' },
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
  member: { id: string; name: string; position: string; emoji: string }
  override?: TeamProfileOverride
  direction: 'prev' | 'next'
}) {
  return (
    <Link
      href={`/team/${member.id}`}
      className="hidden sm:flex flex-shrink-0 w-28 lg:w-32 flex-col items-center gap-2 group"
    >
      <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-[#F7F8FE] flex items-center justify-center group-hover:ring-violet/40 group-hover:scale-105 transition-all">
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
          <span className="text-2xl">{member.emoji}</span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-600 text-center leading-tight group-hover:text-navy transition-colors w-full">
        {direction === 'prev' && <ChevronLeft className="w-3 h-3 inline-block -mt-0.5" />}
        {member.name}
        {direction === 'next' && <ChevronRight className="w-3 h-3 inline-block -mt-0.5" />}
      </p>
      <p className="text-[10px] text-slate-400 text-center leading-tight w-full">{member.position}</p>
    </Link>
  )
}

const INTEREST_SUGGESTIONS = ['Kafe ☕', 'Hory 🏔️', 'Knihy 📚', 'Běhání 🏃', 'Cestování ✈️', 'Vaření 🍳', 'Hudba 🎸', 'Deskovky 🎲']

export function MemberProfileClient({
  member, prev, next, viewerEmail,
}: {
  member: Member
  prev: { id: string; name: string; position: string; emoji: string }
  next: { id: string; name: string; position: string; emoji: string }
  viewerEmail: string | null
}) {
  const [profiles, setProfiles] = useState<Record<string, TeamProfileOverride>>({})
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [editingHelp, setEditingHelp] = useState(false)
  const [helpDraft, setHelpDraft] = useState('')
  const [editingInterests, setEditingInterests] = useState(false)
  const [interestDraft, setInterestDraft] = useState('')
  const [positioning, setPositioning] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
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
    setHelpDraft(override.helpWith ?? '')
    setEditingBio(false)
    setEditingHelp(false)
    setEditingInterests(false)
  }, [member.id, override.bio, override.helpWith, member.bio])

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

  const interests = override.interests ?? []
  const addInterest = (tag: string) => {
    const t = tag.trim()
    if (!t || interests.includes(t)) return
    save({ interests: [...interests, t] })
    setInterestDraft('')
  }
  const removeInterest = (tag: string) => save({ interests: interests.filter((i) => i !== tag) })

  const gallery = override.gallery ?? []

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/team" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Zpět na tým
      </Link>

      <div className="flex items-center gap-3 lg:gap-5">
        <SideNavTile member={prev} override={profiles[prev.id]} direction="prev" />

        {/* One cohesive profile card */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Watercolor banner, photo centered directly on it */}
          <div className="relative h-40 sm:h-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/watercolor.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div
                  className="rounded-full overflow-hidden ring-4 ring-white shadow-md flex items-center justify-center bg-[#F7F8FE] flex-shrink-0"
                  style={{ width: 104, height: 104 }}
                >
                  {override.photo ? (
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
                    <span style={{ fontSize: 42 }}>{member.emoji}</span>
                  )}
                </div>
                {isMe && (
                  <div className="absolute -bottom-1 -right-1 flex gap-1">
                    {override.photo && (
                      <button
                        onClick={() => setPositioning(true)}
                        className="w-7 h-7 rounded-full bg-white text-navy shadow flex items-center justify-center hover:bg-slate-50 transition-colors"
                        title="Upravit pozici fotky"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="w-7 h-7 rounded-full bg-violet text-white shadow flex items-center justify-center hover:bg-violet-dark transition-colors"
                      title="Nahrát fotku"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoPick} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name + badges */}
          <div className="pt-5 pb-5 px-6 text-center">
            <h1 className="text-2xl font-headline font-bold text-navy">{member.name}</h1>
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
              {override.personality && PERSONALITY_TYPES[override.personality] && (
                <span
                  className="group relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet/10 text-violet cursor-default"
                >
                  <Sparkles className="w-3 h-3" />
                  {override.personality} · {PERSONALITY_TYPES[override.personality].name}
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 bg-navy text-white text-[11px] leading-snug rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <strong className="block mb-0.5">{override.personality} — {PERSONALITY_TYPES[override.personality].name}</strong>
                    {PERSONALITY_TYPES[override.personality].desc}
                  </span>
                </span>
              )}
            </div>

            {isMe && (
              <div className="mt-2">
                <select
                  value={override.personality ?? ''}
                  onChange={(e) => save({ personality: e.target.value || null })}
                  className="text-xs text-slate-400 bg-transparent border-none focus:outline-none cursor-pointer hover:text-violet transition-colors"
                >
                  <option value="">+ Přidat výsledek 16 Personalities</option>
                  {Object.entries(PERSONALITY_TYPES).map(([code, t]) => (
                    <option key={code} value={code}>{code} — {t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Příběh */}
          <div className="px-6 pb-5 pt-5 border-t border-slate-100">
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

          {/* Věci, které mě baví */}
          <div className="px-6 pb-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Věci, které mě baví
              </p>
              {isMe && !editingInterests && (
                <button onClick={() => setEditingInterests(true)} className="flex items-center gap-1 text-xs text-violet hover:text-violet-dark transition-colors">
                  <Pencil className="w-3 h-3" /> Upravit
                </button>
              )}
            </div>

            {interests.length > 0 || editingInterests ? (
              <div className="flex flex-wrap gap-1.5">
                {interests.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                    {tag}
                    {editingInterests && (
                      <button onClick={() => removeInterest(tag)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Zatím nic nevyplněno.</p>
            )}

            {editingInterests && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).map((s) => (
                    <button
                      key={s}
                      onClick={() => addInterest(s)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-slate-200 text-slate-400 hover:text-navy hover:border-slate-300 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestDraft}
                    onChange={(e) => setInterestDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(interestDraft) } }}
                    placeholder="Vlastní…"
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                  />
                  <button onClick={() => addInterest(interestDraft)} className="px-3 py-1.5 bg-violet hover:bg-violet-dark text-white text-xs font-medium rounded-full transition-colors">
                    Přidat
                  </button>
                  <button onClick={() => setEditingInterests(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-navy transition-colors">
                    Hotovo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* S čím se na mě můžete obrátit */}
          <div className="px-6 pb-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-green-500" /> S čím se na mě můžete obrátit
              </p>
              {isMe && !editingHelp && (
                <button onClick={() => setEditingHelp(true)} className="flex items-center gap-1 text-xs text-violet hover:text-violet-dark transition-colors">
                  <Pencil className="w-3 h-3" /> Upravit
                </button>
              )}
            </div>
            {editingHelp ? (
              <div className="space-y-2">
                <textarea
                  value={helpDraft}
                  onChange={(e) => setHelpDraft(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent resize-none"
                  placeholder="Např. React otázky, plánování akcí, marketingová strategie…"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { save({ helpWith: helpDraft.trim() }); setEditingHelp(false) }}
                    className="px-3 py-1.5 bg-violet hover:bg-violet-dark text-white text-xs font-medium rounded-full transition-colors"
                  >
                    Uložit
                  </button>
                  <button onClick={() => setEditingHelp(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-navy transition-colors">
                    Zrušit
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">{override.helpWith || 'Zatím nic nevyplněno.'}</p>
            )}
          </div>

          {/* Galerie */}
          <div className="px-6 pb-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Fotky, které mě vystihují</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(src)}
                  className="relative aspect-square rounded-lg overflow-hidden group bg-[#F7F8FE]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-contain" />
                  {isMe && (
                    <span
                      onClick={(e) => { e.stopPropagation(); removeGalleryPhoto(i) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
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
        </div>

        <SideNavTile member={next} override={profiles[next.id]} direction="next" />
      </div>

      {/* Mobile prev/next row (side tiles hidden below sm) */}
      <div className="flex sm:hidden items-center justify-between mt-4 px-1">
        <Link href={`/team/${prev.id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-navy transition-colors">
          <ChevronLeft className="w-4 h-4" /> {prev.name.split(' ')[0]}
        </Link>
        <Link href={`/team/${next.id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-navy transition-colors">
          {next.name.split(' ')[0]} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {positioning && override.photo && (
        <PhotoPositionEditor
          photo={override.photo}
          initial={override.photoPos}
          onSave={savePhotoPos}
          onCancel={() => setPositioning(false)}
        />
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
