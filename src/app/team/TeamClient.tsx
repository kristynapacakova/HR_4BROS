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

function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?…](?=\s|$)/)
  return (match ? match[0] : text).trim()
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

  // Řazení uvnitř oddělení: Team Leadi nahoře, pak podle seniority, pak abecedně.
  const rankOf = (m: Member) => (m.seniority === 'LEAD' ? 0 : SENIORITY_ORDER[m.seniority ?? ''] ?? 5)

  const sortGroup = (arr: Member[]) => [...arr].sort((a, b) => {
    const ra = rankOf(a)
    const rb = rankOf(b)
    if (ra !== rb) return ra - rb
    return a.name.localeCompare(b.name, 'cs')
  })

  // Oddělení do sekcí — HR (vedení) první, pak zbytek v pořadí TEAM_DEPARTMENTS.
  const deptOrder = ['HR', ...departments.filter(d => d !== 'HR')]
  const groups = deptOrder
    .map(d => ({ dept: d, members: sortGroup(filtered.filter(m => m.department === d)) }))
    .filter(g => g.members.length > 0)

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

      <p className="text-sm text-slate-400">{filtered.length} {filtered.length === 1 ? 'člen' : filtered.length < 5 ? 'členové' : 'členů'}</p>

      {/* Sekce podle oddělení */}
      {groups.map(group => (
        <div key={group.dept} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-navy text-sm">{group.dept}</h3>
            <span className="text-xs text-slate-400">{group.members.length}</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {group.members.map(member => {
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
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#F7F8FE] flex items-center justify-center">
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
                    <span style={{ fontSize: 28 }}>{member.emoji}</span>
                  )}
                </div>
                <div className="text-center mt-2 w-full">
                  <p className="font-headline font-bold text-navy tracking-wide uppercase text-xs truncate">{member.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 truncate">{member.position}</p>
                </div>
              </div>

              <div className="px-1 pb-1.5 flex flex-col gap-2">
                {/* Badges */}
                <div className="flex flex-wrap gap-1 justify-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${DEPT_COLORS[member.department] ?? 'bg-slate-100 text-slate-600'}`}>
                    <Users2 className="w-2.5 h-2.5" />
                    {member.department}
                  </span>
                  {member.seniority && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      <Briefcase className="w-2.5 h-2.5" />
                      {SENIORITY_LABEL[member.seniority] ?? member.seniority}
                    </span>
                  )}
                </div>

                {(override?.bio ?? member.bio) && (
                  <p className="text-[11px] text-slate-400 leading-relaxed truncate text-center" title={override?.bio ?? member.bio ?? undefined}>
                    {firstSentence(override?.bio ?? member.bio ?? '')}
                  </p>
                )}

                <div className={`flex items-center gap-1.5 text-[10px] rounded-full px-2.5 py-1.5 justify-center ${birthdaySoon ? 'bg-violet/10 text-violet font-medium' : 'bg-slate-50 text-slate-400'}`}>
                  <Cake className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
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
        </div>
      ))}

      <p className="text-xs text-slate-400 text-center pt-2">Klikni na kolegu a podívej se na jeho medailonek. Svůj vlastní si můžeš upravit.</p>
    </div>
  )
}
