'use client'

import type { PersonRecord } from '@/lib/mock-data'
import { TeamHero } from './TeamHero'
import { TeamRows } from './TeamRows'
import { personView, useProfiles } from './teamPeople'

export function formatBirthday(raw: string | null): string {
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

export function TeamClient({ members, departments }: {
  members: PersonRecord[]
  departments: string[]
  isAdmin: boolean
  viewerEmail?: string | null
}) {
  const profiles = useProfiles()
  const people = members.map(m => personView(m, profiles[m.id]))
  const deptOrder = ['Head office', ...departments.filter(d => d !== 'Head office')]

  return (
    <div className="space-y-5">
      <TeamHero
        members={people.map(p => ({ id: p.id, name: p.name, department: p.department, birthdayInDays: daysUntilBirthday(p.birthdayEff) }))}
        departments={deptOrder}
      />

      <p className="text-xs text-navy/50">Klikni na kolegu a otevřeš jeho medailonek.</p>

      <TeamRows people={people} teams={deptOrder} />
    </div>
  )
}
