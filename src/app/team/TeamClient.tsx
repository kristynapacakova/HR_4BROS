'use client'

import { useState } from 'react'
import { X, Cake, Briefcase, Anchor } from 'lucide-react'

interface Member {
  id: string
  name: string
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

const DEPT_COLORS: Record<string, { pill: string; dot: string }> = {
  Creative:    { pill: 'bg-violet/20 text-violet-light', dot: 'bg-violet' },
  Performance: { pill: 'bg-sky-500/20 text-sky-300',    dot: 'bg-sky-400' },
  Account:     { pill: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-400' },
  Sales:       { pill: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-400' },
  Backoffice:  { pill: 'bg-white/10 text-white/60',      dot: 'bg-white/40' },
  HR:          { pill: 'bg-pink-500/20 text-pink-300',   dot: 'bg-pink-400' },
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

// Deterministic pastel-on-navy avatar bg from name
function avatarGradient(name: string) {
  const gradients = [
    'from-violet to-indigo-700',
    'from-sky-600 to-blue-800',
    'from-emerald-600 to-teal-800',
    'from-amber-500 to-orange-700',
    'from-pink-600 to-rose-800',
    'from-indigo-500 to-violet-700',
  ]
  const i = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length
  return gradients[i]
}

function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const days = daysUntilBirthday(member.birthday)
  const birthdaySoon = days !== null && days <= 7
  const dept = DEPT_COLORS[member.department] ?? { pill: 'bg-white/10 text-white/60', dot: 'bg-white/40' }
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="group relative bg-navy rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(14,35,55,0.18)] hover:shadow-[0_8px_32px_rgba(14,35,55,0.32)] transition-all duration-200 hover:-translate-y-0.5 text-left w-full"
    >
      {/* Avatar area */}
      <div className={`relative bg-gradient-to-br ${avatarGradient(member.name)} aspect-square flex items-center justify-center`}>
        {/* Emoji big */}
        <span className="text-5xl select-none drop-shadow-lg">{member.emoji}</span>

        {/* Initials fallback overlay — subtle */}
        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-navy/50 backdrop-blur-sm flex items-center justify-center">
          <span className="text-white/80 text-[10px] font-bold tracking-wide">{initials}</span>
        </div>

        {/* Birthday ribbon */}
        {birthdaySoon && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-navy text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            <Cake className="w-2.5 h-2.5" />
            {days === 0 ? 'Dnes!' : `za ${days} dní`}
          </div>
        )}

        {/* Dept dot */}
        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${dept.dot} ring-2 ring-navy/60`} />
      </div>

      {/* Info strip */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="font-headline font-semibold text-white text-sm leading-tight truncate">{member.name}</p>
        <p className="text-white/50 text-[11px] truncate mt-0.5">{member.position}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dept.pill}`}>
            {member.department}
          </span>
          {member.seniority && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/50">
              {SENIORITY_LABEL[member.seniority]}
            </span>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 ring-2 ring-inset ring-violet/0 group-hover:ring-violet/40 rounded-2xl transition-all duration-200 pointer-events-none" />
    </button>
  )
}

function MemberDetail({ member, onClose }: { member: Member; onClose: () => void }) {
  const days = daysUntilBirthday(member.birthday)
  const birthdaySoon = days !== null && days <= 30
  const dept = DEPT_COLORS[member.department] ?? { pill: 'bg-white/10 text-white/60', dot: 'bg-white/40' }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm" />

      <div
        className="relative bg-navy w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div className={`relative bg-gradient-to-br ${avatarGradient(member.name)} pt-10 pb-8 flex flex-col items-center gap-3`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-navy/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-7xl drop-shadow-xl select-none">{member.emoji}</span>

          <div className="text-center px-6">
            <h2 className="font-headline font-semibold text-white text-xl leading-tight">{member.name}</h2>
            <p className="text-white/60 text-sm mt-0.5">{member.position}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${dept.pill}`}>
              {member.department}
            </span>
            {member.seniority && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-navy/30 text-white/60">
                {SENIORITY_LABEL[member.seniority]}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 border-t border-white/[0.07]">
          {/* Bio */}
          {member.bio && (
            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">O mně</p>
              <p className="text-white/70 text-sm leading-relaxed">{member.bio}</p>
            </div>
          )}

          {/* Details row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.06] rounded-2xl px-4 py-3">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Narozeniny</p>
              <div className="flex items-center gap-1.5">
                <Cake className={`w-3.5 h-3.5 flex-shrink-0 ${birthdaySoon ? 'text-amber-400' : 'text-white/40'}`} />
                <p className={`text-sm font-medium ${birthdaySoon ? 'text-amber-300' : 'text-white/70'}`}>
                  {formatBirthday(member.birthday)}
                </p>
              </div>
              {birthdaySoon && days !== null && (
                <p className="text-amber-400 text-[10px] mt-0.5 font-semibold">
                  {days === 0 ? '🎂 Dnes!' : `za ${days} dní`}
                </p>
              )}
            </div>

            <div className="bg-white/[0.06] rounded-2xl px-4 py-3">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Spolupráce</p>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                <p className="text-sm font-medium text-white/70">{member.employmentType}</p>
              </div>
            </div>
          </div>

          {/* Anchor decoration */}
          <div className="flex items-center justify-center pt-1 pb-2 opacity-10">
            <Anchor className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamClient({ members, departments, isAdmin: _isAdmin }: {
  members: Member[]
  departments: string[]
  isAdmin: boolean
}) {
  const [dept, setDept] = useState<string>('Všichni')
  const [selected, setSelected] = useState<Member | null>(null)
  const allDepts = ['Všichni', ...departments]

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

  return (
    <div className="space-y-5">
      {/* Dept filter — pill style */}
      <div className="flex gap-1.5 flex-wrap">
        {allDepts.map(d => (
          <button
            key={d}
            onClick={() => setDept(d)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              dept === d
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white/80 text-slate-500 hover:text-navy hover:bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
            }`}
          >
            {d}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-slate-400 pr-1">
          {sorted.length} {sorted.length === 1 ? 'člen' : sorted.length < 5 ? 'členové' : 'členů'}
        </span>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {sorted.map(member => (
          <MemberCard key={member.id} member={member} onClick={() => setSelected(member)} />
        ))}
      </div>

      {/* Detail overlay */}
      {selected && (
        <MemberDetail member={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
