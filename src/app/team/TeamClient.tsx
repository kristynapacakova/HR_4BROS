'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

const SENIORITY_ORDER: Record<string, number> = {
  LEAD: 0, SENIOR: 2, MEDIOR: 3, JUNIOR: 4,
}

export function formatBirthday(raw: string | null): string {
  if (!raw) return '—'
  const [, month, day] = raw.split('-')
  const months = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']
  return `${parseInt(day)}. ${months[parseInt(month) - 1]}`
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-y-6 gap-x-3">
            {group.members.map(member => {
          const override = profiles[member.id]
          return (
            <Link
              key={member.id}
              href={`/team/${member.id}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#F7F8FE] flex items-center justify-center transition-transform group-hover:scale-[1.03]">
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
                  <span style={{ fontSize: 32 }}>{member.emoji}</span>
                )}
              </div>
              <p className="font-headline font-semibold text-navy text-sm mt-3 truncate w-full group-hover:text-violet transition-colors">{member.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate w-full">{member.position}</p>
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
