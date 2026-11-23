'use client'

import { useState } from 'react'
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
  const [dept, setDept] = useState<string>('Všichni')
  const profiles = useProfiles()
  const people = members.map(m => personView(m, profiles[m.id]))
  const deptOrder = ['Head office', ...departments.filter(d => d !== 'Head office')]
  const shown = dept === 'Všichni' ? people : people.filter(p => p.department === dept)

  return (
    <div className="space-y-5">
      <TeamHero
        members={people.map(p => ({ id: p.id, name: p.name, department: p.department, birthdayInDays: daysUntilBirthday(p.birthdayEff) }))}
        departments={deptOrder}
        active={dept}
        onPick={setDept}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-navy/60">
          {dept === 'Všichni' ? 'Celý tým' : dept} · {shown.length} {shown.length === 1 ? 'člověk' : shown.length < 5 ? 'lidé' : 'lidí'}
          {dept !== 'Všichni' && (
            <button onClick={() => setDept('Všichni')} className="ml-3 text-violet font-semibold">Zobrazit všechny ×</button>
          )}
        </p>
        <p className="text-xs text-navy/50">Klikni na tým v hlavičce, najeď na kolegu a uvidíš, co ho baví.</p>
      </div>

      <TeamRows key={dept} people={shown} teams={deptOrder} />
    </div>
  )
}
