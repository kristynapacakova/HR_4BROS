'use client'

import { useEffect, useState } from 'react'
import { Cake, Briefcase, Users2, X, Camera, Plus, Pencil } from 'lucide-react'
import {
  loadTeamProfiles, saveTeamProfile, TEAM_PROFILE_CHANGED_EVENT,
  type TeamProfileOverride,
} from '@/lib/team-profile-client'

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

function formatBirthday(raw: string | null): string {
  if (!raw) return '—'
  const [, month, day] = raw.split('-')
  const months = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']
  return `${parseInt(day)}. ${months[parseInt(month) - 1]}`
}

function daysUntilBirthday(raw: string | null): number | null {
  if (!raw) return null
  const now = new Date()
  const [, m, d] = raw.split('-').map(Number)
  const next = new Date(now.getFullYear(), m - 1, d)
  if (next < now) next.setFullYear(now.getFullYear() + 1)
  return Math.ceil((next.getTime() - now.getTime()) / 86400000)
}

function readFileAsDownscaledDataUrl(file: File, size: number, cb: (dataUrl: string) => void) {
  const img = new Image()
  const reader = new FileReader()
  reader.onload = () => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')!
      const min = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size)
      cb(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

function Avatar({ member, photo, size = 48 }: { member: Member; photo?: string | null; size?: number }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={member.name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
  }
  return (
    <div
      className="rounded-full bg-[#F7F8FE] flex items-center justify-center border border-slate-100 flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {member.emoji}
    </div>
  )
}

// Watercolor-blob background behind the circular photo, in brand blues/violet.
function WatercolorSplash() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -left-4 top-1 w-[85%] h-[70%] rounded-[45%] rotate-[-8deg]"
        style={{ background: 'linear-gradient(135deg, #BFE1F0, #DCEBF7)', filter: 'blur(2px)', opacity: 0.9 }}
      />
      <div
        className="absolute -right-6 top-6 w-[60%] h-[55%] rounded-[45%] rotate-[10deg]"
        style={{ background: 'linear-gradient(135deg, #9BC9E0, #C9E4F2)', filter: 'blur(3px)', opacity: 0.65 }}
      />
      <div
        className="absolute left-6 -bottom-2 w-[55%] h-[40%] rounded-[45%] rotate-[4deg]"
        style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)', filter: 'blur(4px)', opacity: 0.12 }}
      />
    </div>
  )
}

// Dominant medailonek — circular photo on a watercolor splash, name + position below.
function Medailonek({ member, photo }: { member: Member; photo?: string | null }) {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-white flex-shrink-0">
      <div className="relative w-full aspect-[4/3] flex items-center justify-center">
        <WatercolorSplash />
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md flex items-center justify-center bg-[#F7F8FE]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: '2.5rem' }}>{member.emoji}</span>
          )}
        </div>
      </div>
      <div className="text-center pt-2 pb-1">
        <p className="font-headline font-bold text-navy tracking-wide uppercase text-sm truncate">{member.name}</p>
        <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5 truncate">{member.position}</p>
      </div>
    </div>
  )
}

function MemberDetailModal({
  member, override, isMe, onClose, onSave,
}: {
  member: Member
  override: TeamProfileOverride
  isMe: boolean
  onClose: () => void
  onSave: (patch: TeamProfileOverride) => void
}) {
  const [editing, setEditing] = useState(false)
  const [bioDraft, setBioDraft] = useState(override.bio ?? member.bio ?? '')
  const photo = override.photo ?? null
  const gallery = override.gallery ?? []

  const onPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    readFileAsDownscaledDataUrl(file, 240, (dataUrl) => onSave({ photo: dataUrl }))
    e.target.value = ''
  }

  const onGalleryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    readFileAsDownscaledDataUrl(file, 480, (dataUrl) => onSave({ gallery: [...gallery, dataUrl] }))
    e.target.value = ''
  }

  const removeGalleryPhoto = (idx: number) => {
    onSave({ gallery: gallery.filter((_, i) => i !== idx) })
  }

  const saveBio = () => {
    onSave({ bio: bioDraft.trim() })
    setEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-100">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-navy rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Avatar member={member} photo={photo} size={72} />
              {isMe && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet text-white flex items-center justify-center cursor-pointer hover:bg-violet-dark transition-colors shadow">
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={onPhotoPick} />
                </label>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-headline font-bold text-navy truncate">{member.name}</h2>
              <p className="text-sm text-slate-500 truncate">{member.position}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${DEPT_COLORS[member.department] ?? 'bg-slate-100 text-slate-600'}`}>
                  <Users2 className="w-3 h-3" />
                  {member.department}
                </span>
                {member.seniority && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    <Briefcase className="w-3 h-3" />
                    {SENIORITY_LABEL[member.seniority] ?? member.seniority}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Story / bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Příběh</p>
              {isMe && !editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-violet hover:text-violet-dark transition-colors">
                  <Pencil className="w-3 h-3" /> Upravit
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent resize-none"
                  placeholder="Pár vět o tobě…"
                />
                <div className="flex gap-2">
                  <button onClick={saveBio} className="px-3 py-1.5 bg-violet hover:bg-violet-dark text-white text-xs font-medium rounded-full transition-colors">Uložit</button>
                  <button onClick={() => { setEditing(false); setBioDraft(override.bio ?? member.bio ?? '') }} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-navy transition-colors">Zrušit</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">{override.bio ?? member.bio ?? 'Zatím tu nic není.'}</p>
            )}
          </div>

          {/* Birthday */}
          <div className="flex items-center gap-2 text-xs rounded-full px-3 py-2 bg-slate-50 text-slate-500 w-fit">
            <Cake className="w-3.5 h-3.5 flex-shrink-0" />
            {member.birthday ? formatBirthday(member.birthday) : 'Narozeniny neuvedeny'}
          </div>

          {/* Gallery */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Fotky</p>
            <div className="grid grid-cols-4 gap-2">
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
                  <input type="file" accept="image/*" className="hidden" onChange={onGalleryPick} />
                </label>
              )}
              {!isMe && gallery.length === 0 && (
                <p className="col-span-4 text-xs text-slate-400">Zatím žádné fotky.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamClient({ members, departments, isAdmin, viewerEmail }: {
  members: Member[]
  departments: string[]
  isAdmin: boolean
  viewerEmail?: string | null
}) {
  const [dept, setDept] = useState<string>('Všichni')
  const [profiles, setProfiles] = useState<Record<string, TeamProfileOverride>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const allDepts = ['Všichni', ...departments]

  useEffect(() => {
    const refresh = () => setProfiles(loadTeamProfiles())
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const filtered = dept === 'Všichni' ? members : members.filter(m => m.department === dept)

  const sorted = [...filtered].sort((a, b) => {
    const da = daysUntilBirthday(a.birthday)
    const db = daysUntilBirthday(b.birthday)
    const aSoon = da !== null && da <= 30
    const bSoon = db !== null && db <= 30
    if (aSoon && !bSoon) return -1
    if (!aSoon && bSoon) return 1
    return a.name.localeCompare(b.name, 'cs')
  })

  const openMember = members.find(m => m.id === openId) ?? null

  return (
    <div className="space-y-5">
      {/* Department filter */}
      <div className="flex gap-1.5 flex-wrap">
        {allDepts.map(d => (
          <button
            key={d}
            onClick={() => setDept(d)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              dept === d ? 'bg-violet text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:text-navy'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-400">{sorted.length} {sorted.length === 1 ? 'člen' : sorted.length < 5 ? 'členové' : 'členů'}</p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(member => {
          const days = daysUntilBirthday(member.birthday)
          const birthdaySoon = days !== null && days <= 30
          const photo = profiles[member.id]?.photo ?? null
          return (
            <button
              key={member.id}
              onClick={() => setOpenId(member.id)}
              className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(25,70,105,0.08)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Dominant medailonek: circular photo on watercolor splash, name + position below */}
              <Medailonek member={member} photo={photo} />

              <div className="px-1.5 pb-1.5 flex flex-col gap-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
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
                </div>

                {(profiles[member.id]?.bio ?? member.bio) && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{profiles[member.id]?.bio ?? member.bio}</p>
                )}

                <div className={`flex items-center gap-2 text-xs rounded-full px-3 py-2 ${birthdaySoon ? 'bg-violet/10 text-violet font-medium' : 'bg-slate-50 text-slate-400'}`}>
                  <Cake className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {member.birthday ? formatBirthday(member.birthday) : 'Narozeniny neuvedeny'}
                    {birthdaySoon && days !== null && (
                      <span className="ml-1">· za {days === 0 ? 'dnes!' : `${days} dní`}</span>
                    )}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 text-center pt-2">Klikni na kolegu a podívej se na jeho medailonek. Svůj vlastní si můžeš upravit.</p>

      {openMember && (
        <MemberDetailModal
          member={openMember}
          override={profiles[openMember.id] ?? {}}
          isMe={!!viewerEmail && viewerEmail.toLowerCase() === openMember.email.toLowerCase()}
          onClose={() => setOpenId(null)}
          onSave={(patch) => saveTeamProfile(openMember.id, patch)}
        />
      )}
    </div>
  )
}
