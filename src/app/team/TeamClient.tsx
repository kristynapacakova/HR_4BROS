'use client'

import { useState } from 'react'
import { Cake, Briefcase, Users2 } from 'lucide-react'

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

const DEPT_COLORS: Record<string, string> = {
  Creative: 'bg-violet/10 text-violet',
  Performance: 'bg-blue-50 text-blue-700',
  Account: 'bg-amber-50 text-amber-700',
  Sales: 'bg-green-50 text-green-700',
  Backoffice: 'bg-slate-100 text-slate-600',
  HR: 'bg-pink-50 text-pink-700',
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

export function TeamClient({ members, departments, isAdmin }: {
  members: Member[]
  departments: string[]
  isAdmin: boolean
}) {
  const [dept, setDept] = useState<string>('Všichni')
  const allDepts = ['Všichni', ...departments]

  const filtered = dept === 'Všichni' ? members : members.filter(m => m.department === dept)

  // Sort: upcoming birthdays first (within 30 days), then alphabetically
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

      {/* Member count */}
      <p className="text-sm text-slate-400">{sorted.length} {sorted.length === 1 ? 'člen' : sorted.length < 5 ? 'členové' : 'členů'}</p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(member => {
          const days = daysUntilBirthday(member.birthday)
          const birthdaySoon = days !== null && days <= 30
          return (
            <div key={member.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(25,70,105,0.08)] hover:-translate-y-0.5 transition-all duration-200">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="absolute -inset-1 rounded-full opacity-20 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)', filter: 'blur(6px)' }}
                  />
                  <div className="relative w-12 h-12 rounded-full bg-[#F7F8FE] flex items-center justify-center text-2xl border border-slate-100">
                    {member.emoji}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-headline font-semibold text-navy truncate">{member.name}</p>
                  <p className="text-sm text-slate-500 truncate">{member.position}</p>
                </div>
              </div>

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

              {/* Bio */}
              {member.bio && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{member.bio}</p>
              )}

              {/* Birthday */}
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
          )
        })}
      </div>

      {!isAdmin && (
        <p className="text-xs text-slate-400 text-center pt-2">Úpravy profilů může provádět pouze admin nebo HR.</p>
      )}
    </div>
  )
}
