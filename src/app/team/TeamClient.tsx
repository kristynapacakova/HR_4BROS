'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cake, Briefcase, Users2 } from 'lucide-react'
import { loadTeamProfiles, TEAM_PROFILE_CHANGED_EVENT, type TeamProfileOverride } from '@/lib/team-profile-client'

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

const SENIORITY_ORDER: Record<string, number> = {
  LEAD: 0, SENIOR: 2, MEDIOR: 3, JUNIOR: 4,
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

export function formatBirthday(raw: string | null): string {
  if (!raw) return '—'
  const [, month, day] = raw.split('-')
  const months = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']
  return `${parseInt(day)}. ${months[parseInt(month) - 1]}`
}

export function daysUntilBirthday(raw: string | null): number | null {
  if (!raw) return null
  const now = new Date()
  const [, m, d] = raw.split('-').map(Number)
  const next = new Date(now.getFullYear(), m - 1, d)
  if (next < now) next.setFullYear(now.getFullYear() + 1)
  return Math.ceil((next.getTime() - now.getTime()) / 86400000)
}

export function TeamClient({ members, departments }: {
  members: Member[]
  departments: string[]
  isAdmin: boolean
  viewerEmail?: string | null
}) {
  const [dept, setDept] = useState<string>('Všichni')
  const [profiles, setProfiles] = useState<Record<string, TeamProfileOverride>>({})
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

  // Řazení dle role/funkce: vedení a Team Leadi nahoře, pak HR tým, pak ostatní podle seniority.
  const rankOf = (m: Member) => {
    if (m.seniority === 'LEAD') return 0
    if (m.department === 'HR') return 1
    return SENIORITY_ORDER[m.seniority ?? ''] ?? 5
  }

  const sorted = [...filtered].sort((a, b) => {
    const ra = rankOf(a)
    const rb = rankOf(b)
    if (ra !== rb) return ra - rb
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

      <p className="text-sm text-slate-400">{sorted.length} {sorted.length === 1 ? 'člen' : sorted.length < 5 ? 'členové' : 'členů'}</p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(member => {
          const days = daysUntilBirthday(member.birthday)
          const birthdaySoon = days !== null && days <= 30
          const override = profiles[member.id]
          return (
            <Link
              key={member.id}
              href={`/team/${member.id}`}
              className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(25,70,105,0.08)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Photo + name — watercolor medailonek is reserved for the detail page */}
              <div className="w-full flex flex-col items-center pt-2">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#F7F8FE] flex items-center justify-center">
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
                    <span style={{ fontSize: 34 }}>{member.emoji}</span>
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className="font-headline font-bold text-navy tracking-wide uppercase text-sm truncate">{member.name}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5 truncate">{member.position}</p>
                </div>
              </div>

              <div className="px-1.5 pb-1.5 flex flex-col gap-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 justify-center">
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

                {(override?.bio ?? member.bio) && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 text-center">{override?.bio ?? member.bio}</p>
                )}

                <div className={`flex items-center gap-2 text-xs rounded-full px-3 py-2 justify-center ${birthdaySoon ? 'bg-violet/10 text-violet font-medium' : 'bg-slate-50 text-slate-400'}`}>
                  <Cake className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {member.birthday ? formatBirthday(member.birthday) : 'Narozeniny neuvedeny'}
                    {birthdaySoon && days !== null && (
                      <span className="ml-1">· za {days === 0 ? 'dnes!' : `${days} dní`}</span>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 text-center pt-2">Klikni na kolegu a podívej se na jeho medailonek. Svůj vlastní si můžeš upravit.</p>
    </div>
  )
}
