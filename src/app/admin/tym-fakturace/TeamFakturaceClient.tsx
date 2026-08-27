'use client'

import { useEffect, useState } from 'react'
import type { IcoInvoiceRecord } from '@/lib/mock-data'
import { loadTeamLeadOverrides, TEAM_LEAD_CHANGED_EVENT } from '@/lib/team-lead-client'
import { InvoiceOverview } from '../faktury/InvoiceOverview'

interface TeamMember {
  id: string
  email: string
  name: string
  employmentType: string
  teamLeadId: string | null
  invoiceEmployeeId: string
}

export function TeamFakturaceClient({ team, teamLeadId, invoices }: {
  team: TeamMember[]
  teamLeadId: string
  invoices: IcoInvoiceRecord[]
}) {
  const [overrides, setOverrides] = useState<Record<string, string | null>>({})

  useEffect(() => {
    const refresh = () => setOverrides(loadTeamLeadOverrides())
    refresh()
    window.addEventListener(TEAM_LEAD_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TEAM_LEAD_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const effectiveLeadOf = (m: TeamMember) => (m.id in overrides ? overrides[m.id] : m.teamLeadId)

  const myIcoTeam = team
    .filter((m) => effectiveLeadOf(m) === teamLeadId && m.employmentType === 'ICO')
    .map((m) => ({ id: m.invoiceEmployeeId, name: m.name }))

  if (myIcoTeam.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 text-center">
        <p className="text-sm text-slate-400">Zatím ti HR nepřiřadilo žádného OSVČ spolupracovníka do týmu.</p>
      </div>
    )
  }

  return <InvoiceOverview employees={myIcoTeam} invoices={invoices} />
}
