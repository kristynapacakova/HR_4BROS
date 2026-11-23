'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Camera, Pencil, Plus, X } from 'lucide-react'
import {
  loadTeamProfiles, saveTeamProfile, TEAM_PROFILE_CHANGED_EVENT, PERSONALITY_TYPES,
  type TeamProfileOverride, type PhotoPosition,
} from '@/lib/team-profile-client'
import { departmentColor, departmentInk } from '@/lib/team-colors'
import { tintOf } from '../teamPeople'
import { PhotoPositionEditor } from '../PhotoPositionEditor'
import { formatBirthday } from '../TeamClient'
import {
  IconStory, IconLikes, IconHelp, IconGallery, IconTeamMark, IconSeniority, IconBirthday, IconPersonality,
} from './ProfileIcons'

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

export interface StripMember {
  id: string
  name: string
  department: string
}

const SENIORITY_LABEL: Record<string, string> = {
  JUNIOR: 'Junior', MEDIOR: 'Medior', SENIOR: 'Senior', LEAD: 'Lead',
}

/** Emoji v UI nechceme — odstraníme je i ze starších uložených hodnot. */
const EMOJI_RE = new RegExp('[\\p{Extended_Pictographic}\\uFE0F\\u200D]', 'gu')
function stripEmoji(s: string): string {
  return s.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim()
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : ''
  return (first + last).toUpperCase()
}

/** Volný text rozdělí na štítky (čárky, středníky, nové řádky). Když to nedává smysl, vrátí null. */
function splitToTags(text: string): string[] | null {
  const parts = text
    .split(/[,;\n•]+/)
    .map((p) => stripEmoji(p).replace(/^[-–—*\s]+/, '').replace(/[.\s]+$/, '').trim())
    .filter(Boolean)
  if (parts.length < 2) return null
  if (parts.some((p) => p.length > 48)) return null
  return parts
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

/** Fotka s uloženou pozicí, nebo čtverec s iniciálami v barvě týmu. */
function Portrait({ name, department, override, initialsClass }: {
  name: string
  department: string
  override: TeamProfileOverride | undefined
  initialsClass: string
}) {
  if (override?.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={override.photo}
        alt={name}
        className="w-full h-full object-cover"
        style={{
          objectPosition: `${override.photoPos?.x ?? 50}% ${override.photoPos?.y ?? 50}%`,
          transform: `scale(${(override.photoPos?.zoom ?? 100) / 100})`,
        }}
      />
    )
  }
  // Bez fotky: světlý odstín barvy týmu a silueta — stejně jako na stránce Tým
  const c = departmentColor(department)
  const sil = c.toUpperCase() === '#FFFFFF' || c === '#F0E100' || c === '#b9cbf3' ? '#0d214f' : c
  void initialsClass
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: tintOf(c, 0.22) }} role="img" aria-label={name}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 mx-auto h-[78%]" aria-hidden="true">
        <circle cx="50" cy="40" r="19" fill={sil} opacity="0.22" />
        <path d="M14 100 V92 Q14 66 40 64 H60 Q86 66 86 92 V100 Z" fill={sil} opacity="0.22" />
      </svg>
    </div>
  )
}

function TeamStrip({ members, profiles, currentId }: {
  members: StripMember[]
  profiles: Record<string, TeamProfileOverride>
  currentId: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>('[data-current="true"]')
    el?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [currentId])

  const arrowCls =
    'hidden sm:flex flex-shrink-0 w-8 h-8 bg-white border border-navy/15 items-center justify-center text-navy/50 hover:text-navy hover:border-navy transition-colors'

  return (
    <div className="relative flex items-center gap-2">
      <button onClick={() => scroll(-1)} className={arrowCls} aria-label="Posunout doleva">
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div ref={scrollRef} className="flex items-start gap-3 overflow-x-auto py-1.5 px-1 scrollbar-none scroll-smooth">
        {members.map((m) => {
          const isCurrent = m.id === currentId
          return (
            <Link
              key={m.id}
              href={`/team/${m.id}`}
              title={m.name}
              data-current={isCurrent ? 'true' : undefined}
              aria-current={isCurrent ? 'page' : undefined}
              className="group relative flex-shrink-0 flex flex-col items-center gap-1.5 w-14"
            >
              <div
                className={`relative w-14 h-14 overflow-hidden border-2 transition-colors ${
                  isCurrent ? 'border-navy' : 'border-transparent group-hover:border-navy/30'
                }`}
              >
                <Portrait name={m.name} department={m.department} override={profiles[m.id]} initialsClass="text-[18px]" />
                {isCurrent && <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-gold" aria-hidden="true" />}
              </div>
              <span
                className={`text-[11px] text-center leading-tight truncate w-full transition-colors ${
                  isCurrent ? 'text-navy font-semibold' : 'text-navy/50 group-hover:text-navy'
                }`}
              >
                {m.name.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </div>

      <button onClick={() => scroll(1)} className={arrowCls} aria-label="Posunout doprava">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

/** Hlavička sekce: malý brandový znak + kicker + volitelně „Upravit“. */
function SectionHead({ icon, label, onEdit }: { icon: React.ReactNode; label: string; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="kicker flex items-center gap-2">
        {icon}
        {label}
      </p>
      {onEdit && (
        <button onClick={onEdit} className="flex items-center gap-1 text-xs font-semibold text-violet hover:text-navy transition-colors">
          <Pencil className="w-3 h-3" /> Upravit
        </button>
      )}
    </div>
  )
}

function TagChip({ children, tint, onRemove }: { children: React.ReactNode; tint?: string; onRemove?: () => void }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-navy border border-navy/10 ${tint ? '' : 'bg-alice'}`}
      style={tint ? { background: tint } : undefined}
    >
      {children}
      {onRemove && (
        <button onClick={onRemove} className="text-navy/40 hover:text-navy transition-colors" aria-label="Odebrat">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

const INTEREST_SUGGESTIONS = ['Kafe', 'Hory', 'Knihy', 'Běhání', 'Cestování', 'Vaření', 'Hudba', 'Deskovky']

const saveBtn = 'btn-pill px-4 py-1.5 bg-gold text-navy font-bold uppercase tracking-wide text-xs hover:bg-gold-dark hover:text-white transition-colors'
const cancelBtn = 'px-3 py-1.5 text-xs font-semibold text-navy/50 hover:text-navy transition-colors'
const fieldCls = 'w-full px-3 py-2 border border-navy/20 bg-white text-sm text-navy focus:outline-none focus:border-violet resize-none'

/** Poloprůhledný odstín barvy týmu pro štítky (na bílém pozadí). */
function teamTint(hex: string): string | undefined {
  if (hex.toUpperCase() === '#FFFFFF') return undefined // Sales: bílá by zmizela → alice
  return `${hex}26`
}

export function MemberProfileClient({
  member, allMembers, viewerEmail,
}: {
  member: Member
  allMembers: StripMember[]
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
    const t = stripEmoji(tag)
    if (!t || interests.some((i) => stripEmoji(i) === t)) return
    save({ interests: [...interests, t] })
    setInterestDraft('')
  }
  const removeInterest = (tag: string) => save({ interests: interests.filter((i) => i !== tag) })

  const gallery = override.gallery ?? []
  const birthday = override.birthday ?? member.birthday
  const teamColor = departmentColor(member.department)
  const teamInk = departmentInk(member.department)
  const tint = teamTint(teamColor)
  const personality = override.personality && PERSONALITY_TYPES[override.personality] ? override.personality : null
  const bioText = override.bio ?? member.bio
  const helpText = override.helpWith ? stripEmoji(override.helpWith) : ''
  const helpTags = helpText ? splitToTags(helpText) : null
  const usedSuggestions = new Set(interests.map(stripEmoji))

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/team" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/60 hover:text-navy transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Zpět na tým
      </Link>

      {/* Celý tým — klikni na čtverec pro přechod na jeho profil */}
      <div className="mb-5">
        <TeamStrip members={allMembers} profiles={profiles} currentId={member.id} />
      </div>

      {/* Medailonek — navy hlavička */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 grid-4x4 pointer-events-none" aria-hidden="true" />
        <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-3" style={{ background: teamColor }} aria-hidden="true" />

        <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 p-6 pl-8 sm:p-8 sm:pl-11">
          {/* Fotka */}
          <div className="relative flex-shrink-0 self-start">
            <div className="relative w-44 h-52 sm:w-52 sm:h-64 overflow-hidden border border-white/15">
              <Portrait name={member.name} department={member.department} override={override} initialsClass="text-[72px] sm:text-[88px]" />
            </div>
            {isMe && (
              <div className="absolute bottom-0 right-0 flex">
                {override.photo && (
                  <button
                    onClick={() => setPositioning(true)}
                    className="w-9 h-9 bg-white text-navy flex items-center justify-center hover:bg-alice transition-colors border-l border-t border-navy/10"
                    title="Upravit pozici fotky"
                    aria-label="Upravit pozici fotky"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-9 h-9 bg-navy text-gold flex items-center justify-center hover:bg-gold hover:text-navy transition-colors border-l border-t border-white/20"
                  title="Nahrát fotku"
                  aria-label="Nahrát fotku"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoPick} />
              </div>
            )}
          </div>

          {/* Jméno a údaje */}
          <div className="min-w-0 flex flex-col justify-end pb-1">
            <p className="kicker text-gold text-[11px] mb-3">Medailonek · {member.department}</p>
            <h1 className="font-headline text-[34px] sm:text-[46px] leading-[1.02] text-white break-words" style={{ fontWeight: 600 }}>
              {member.name}
            </h1>
            <p className="text-base sm:text-lg text-white/70 mt-2">{member.position}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em]"
                style={{ background: teamColor, color: teamInk }}
              >
                <IconTeamMark />
                {member.department}
              </span>
              {member.seniority && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border border-white/25 text-white">
                  <IconSeniority />
                  {SENIORITY_LABEL[member.seniority] ?? member.seniority}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border border-white/25 text-white/80">
                <IconBirthday />
                {birthday ? formatBirthday(birthday) : 'Narozeniny neuvedeny'}
              </span>
              {personality && (
                <span className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-violet text-white cursor-default">
                  <IconPersonality />
                  {personality} · {PERSONALITY_TYPES[personality].name}
                  <span className="pointer-events-none absolute left-0 top-full mt-1.5 w-64 bg-white text-navy border border-navy text-[11px] font-normal leading-snug px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-left">
                    <strong className="block mb-0.5 font-semibold">{personality} — {PERSONALITY_TYPES[personality].name}</strong>
                    {PERSONALITY_TYPES[personality].desc}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Podpisové rožky */}
        <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
          <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
          <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
        </div>
      </section>

      {/* Obsah medailonku */}
      <div className="bg-white border border-t-0 border-navy/10 grid md:grid-cols-2">
        {/* Příběh */}
        <div className="md:col-span-2 px-6 sm:px-8 py-6">
          <SectionHead
            icon={<IconStory />}
            label="Příběh"
            onEdit={isMe && !editingBio ? () => setEditingBio(true) : undefined}
          />
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                rows={4}
                className={fieldCls}
                placeholder="Pár vět o tobě…"
              />
              <div className="flex gap-2">
                <button onClick={() => { save({ bio: bioDraft.trim() }); setEditingBio(false) }} className={saveBtn}>
                  Uložit
                </button>
                <button onClick={() => setEditingBio(false)} className={cancelBtn}>Zrušit</button>
              </div>
            </div>
          ) : bioText ? (
            <p className="text-[15px] text-navy/80 leading-relaxed max-w-2xl whitespace-pre-line">{stripEmoji(bioText)}</p>
          ) : (
            <p className="text-sm text-navy/40">Zatím tu nic není.</p>
          )}
        </div>

        {/* Věci, které mě baví */}
        <div className="px-6 sm:px-8 py-6 border-t border-navy/10">
          <SectionHead
            icon={<IconLikes />}
            label="Věci, které mě baví"
            onEdit={isMe && !editingInterests ? () => setEditingInterests(true) : undefined}
          />

          {interests.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <TagChip key={tag} tint={tint} onRemove={editingInterests ? () => removeInterest(tag) : undefined}>
                  {stripEmoji(tag) || tag}
                </TagChip>
              ))}
            </div>
          ) : !editingInterests ? (
            <p className="text-sm text-navy/40">Zatím nic nevyplněno.</p>
          ) : null}

          {editingInterests && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_SUGGESTIONS.filter((s) => !usedSuggestions.has(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => addInterest(s)}
                    className="px-2.5 py-1 text-xs font-semibold border border-dashed border-navy/25 text-navy/50 hover:text-navy hover:border-navy transition-colors"
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
                  className="flex-1 min-w-0 px-3 py-1.5 border border-navy/20 text-sm text-navy focus:outline-none focus:border-violet"
                />
                <button onClick={() => addInterest(interestDraft)} className={saveBtn}>Přidat</button>
                <button onClick={() => setEditingInterests(false)} className={cancelBtn}>Hotovo</button>
              </div>
            </div>
          )}
        </div>

        {/* S čím se na mě můžete obrátit */}
        <div className="px-6 sm:px-8 py-6 border-t border-navy/10 md:border-l">
          <SectionHead
            icon={<IconHelp />}
            label="S čím se na mě můžeš obrátit"
            onEdit={isMe && !editingHelp ? () => setEditingHelp(true) : undefined}
          />
          {editingHelp ? (
            <div className="space-y-2">
              <textarea
                value={helpDraft}
                onChange={(e) => setHelpDraft(e.target.value)}
                rows={3}
                className={fieldCls}
                placeholder="Např. React otázky, plánování akcí, marketingová strategie…"
              />
              <p className="text-[11px] text-navy/40">Jednotlivé věci odděl čárkou — zobrazí se jako štítky.</p>
              <div className="flex gap-2">
                <button onClick={() => { save({ helpWith: helpDraft.trim() }); setEditingHelp(false) }} className={saveBtn}>
                  Uložit
                </button>
                <button onClick={() => setEditingHelp(false)} className={cancelBtn}>Zrušit</button>
              </div>
            </div>
          ) : helpTags ? (
            <div className="flex flex-wrap gap-1.5">
              {helpTags.map((t, i) => <TagChip key={`${t}-${i}`}>{t}</TagChip>)}
            </div>
          ) : helpText ? (
            <p className="text-sm text-navy/80 leading-relaxed">{helpText}</p>
          ) : (
            <p className="text-sm text-navy/40">Zatím nic nevyplněno.</p>
          )}
        </div>

        {/* Galerie */}
        <div className="md:col-span-2 px-6 sm:px-8 py-6 border-t border-navy/10">
          <SectionHead icon={<IconGallery />} label="Fotky, které mě vystihují" />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightbox(src)}
                className="relative aspect-square overflow-hidden group bg-alice border border-navy/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-contain" />
                {isMe && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeGalleryPhoto(i) }}
                    className="absolute top-0 right-0 w-6 h-6 bg-navy text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Odebrat fotku"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
            {isMe && (
              <label
                className="aspect-square border border-dashed border-navy/25 flex items-center justify-center cursor-pointer hover:border-navy transition-colors text-navy/30 hover:text-navy"
                title="Přidat fotku"
              >
                <Plus className="w-5 h-5" />
                <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={onGalleryPick} />
              </label>
            )}
            {!isMe && gallery.length === 0 && (
              <p className="col-span-3 sm:col-span-5 text-sm text-navy/40">Zatím žádné fotky.</p>
            )}
          </div>
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

      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
