'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { EmployeesListHeader } from './EmployeesListHeader'
import { TeamLeadCell } from './TeamLeadCell'
import { RoleCell, IcoFieldsCell } from './PersonFieldsCell'
import { UserStatusCell, useStatusFilter } from './UserStatusCell'
import { SENIORITY_LEVELS, DEMO_EMPLOYEES, TEAM_DEPARTMENTS } from '@/lib/mock-data'
import { departmentColor } from '@/lib/team-colors'
import { Avatar, personView, useProfiles } from '@/app/team/teamPeople'

type DemoEmployee = typeof DEMO_EMPLOYEES[number]

const TYPE_LABEL: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'IČO' }

function tenure(start: Date): string {
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (months < 12) return `${months} m`
  const y = Math.floor(months / 12), m = months % 12
  return m > 0 ? `${y} r ${m} m` : `${y} r`
}

/** Po týmech. Řádek: Uživatel | Pozice | Team lead | Ve firmě | Stav | rozbalit. Mzdu má Přehled odměn, dovolenou Trackdesk. */
const GRID = 'grid grid-cols-[minmax(220px,1.6fr)_minmax(180px,1.4fr)_minmax(150px,1fr)_96px_170px_28px] gap-4 items-center'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmployeesPanel(_: { employees?: DemoEmployee[] }) {
  const profiles = useProfiles()
  const [filter, setFilter] = useState<'active' | 'inactive' | 'all'>('active')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const { isActive, counts } = useStatusFilter(DEMO_EMPLOYEES)
  const q = query.trim().toLowerCase()
  const employees = DEMO_EMPLOYEES
    .filter(e => filter === 'all' || (filter === 'active') === isActive(e.id))
    .filter(e => !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm">
          {([['active', 'Aktivní', counts.active], ['inactive', 'Neaktivní', counts.inactive], ['all', 'Všichni', DEMO_EMPLOYEES.length]] as const).map(([k, l, n]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={`px-3 py-1.5 font-semibold border ${filter === k ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-[rgba(13,33,79,0.14)] hover:border-navy'}`}>{l} ({n})</button>
          ))}
        </div>
        <label className="relative flex-1 min-w-[200px] max-w-xs ml-auto">
          <Search className="w-4 h-4 text-navy/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Hledat uživatele" className="w-full border border-[rgba(13,33,79,0.25)] bg-white pl-9 pr-3 py-2 text-sm text-navy focus:outline-none focus:border-violet" />
        </label>
      </div>

      <div className="bg-white border border-[rgba(13,33,79,0.14)]">
        <EmployeesListHeader count={employees.length} />
        {employees.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-navy/50 border-t border-[rgba(13,33,79,0.08)]">
            {filter === 'inactive' ? 'Žádní neaktivní uživatelé. Když někdo skončí, deaktivuj ho — nemusíš ho mazat.' : 'Nikdo neodpovídá hledání.'}
          </p>
        )}
      </div>

      {TEAM_DEPARTMENTS.map(dept => {
        const members = employees.filter(e => e.department === dept).sort((x, y) => x.name.localeCompare(y.name, 'cs'))
        if (!members.length) return null
        const isCollapsed = collapsed[dept] ?? false
        return (
          <section key={dept} className="bg-white border border-[rgba(13,33,79,0.14)]">
            <button type="button" onClick={() => setCollapsed(c => ({ ...c, [dept]: !isCollapsed }))} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-alice/40">
              <span className="w-3 h-3 flex-shrink-0" style={{ background: departmentColor(dept) }} />
              <span className="font-headline text-navy text-[16px]" style={{ fontWeight: 600 }}>{dept}</span>
              <span className="text-sm text-navy/55">{members.length} {members.length === 1 ? 'uživatel' : members.length < 5 ? 'uživatelé' : 'uživatelů'}</span>
              <ChevronDown className={`ml-auto w-4 h-4 text-navy/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
            </button>
            {!isCollapsed && (
              <>
                <div className={`${GRID} px-5 py-2.5 border-t border-[rgba(13,33,79,0.08)] text-[11px] font-semibold text-navy/50`}>
                  <span>Uživatel</span>
                  <span className="text-center">Pozice</span>
                  <span className="text-center">Team lead</span>
                  <span className="text-center">Ve firmě</span>
                  <span className="text-center">Stav</span>
                  <span />
                </div>
                <ul>
                  {members.map(emp => {
            const senLabel = SENIORITY_LEVELS.find(s => s.value === emp.seniority)?.label
            const isICO = emp.employmentType === 'ICO'
            const open = openId === emp.id
            const active = isActive(emp.id)
            return (
              <li key={emp.id} className="border-t border-[rgba(13,33,79,0.08)]">
                <div className={`${GRID} px-5 py-3 ${active ? '' : 'opacity-60'}`}>
                  <button type="button" onClick={() => setOpenId(open ? null : emp.id)} className="flex items-center gap-3 min-w-0 text-left group">
                    <Avatar p={personView(emp, profiles[emp.id])} size={36} fontSize={12} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-navy truncate group-hover:text-violet">{emp.name}</span>
                      <span className="block text-[11px] text-navy/50 truncate">{emp.email}</span>
                    </span>
                  </button>

                  <span className="min-w-0 text-center">
                    <span className="block text-sm text-navy truncate">{emp.position || '—'}</span>
                    <span className="block text-[11px] text-navy/50 truncate"><b className="font-semibold text-navy/70">{TYPE_LABEL[emp.employmentType] ?? emp.employmentType}</b>{senLabel ? ` · ${senLabel}` : ''}</span>
                  </span>

                  <span className="min-w-0 flex justify-center"><TeamLeadCell teamMemberId={emp.id} baseTeamLeadId={emp.teamLeadId} /></span>

                  <span className="text-sm text-navy/70 text-center">{tenure(emp.startDate)}</span>

                  <div className="flex justify-center text-center"><UserStatusCell person={emp} /></div>

                  <button type="button" onClick={() => setOpenId(open ? null : emp.id)} aria-label={open ? 'Sbalit' : 'Upravit nastavení'} title="Role, OSVČ, deaktivace" className="text-navy/40 hover:text-navy">
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {open && (
                  <div className="px-5 pb-4">
                    <div className="ml-12 bg-alice/60 border border-[rgba(13,33,79,0.08)] px-4 py-3 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-navy/55 mb-1">Role</span>
                        <RoleCell person={emp} />
                      </label>
                      {isICO && (
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-navy/55 mb-1">OSVČ — IČO / kancelář / občerstvení</span>
                          <IcoFieldsCell person={emp} />
                        </div>
                      )}
                      {active && (
                        <div className="ml-auto self-end">
                          <UserStatusCell person={emp} mode="action" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
                  })}
                </ul>
              </>
            )}
          </section>
        )
      })}
    </div>
  )
}
