'use client'

import { useEffect, useState } from 'react'
import { TEAM_LEAD_CANDIDATES } from '@/lib/mock-data'
import { loadTeamLeadOverrides, saveTeamLeadOverride, TEAM_LEAD_CHANGED_EVENT } from '@/lib/team-lead-client'

export function TeamLeadCell({ teamMemberId, baseTeamLeadId }: { teamMemberId: string; baseTeamLeadId: string | null }) {
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

  const current = teamMemberId in overrides ? overrides[teamMemberId] : baseTeamLeadId

  // Team leader nemůže sám sobě přiřadit sám sebe.
  const candidates = TEAM_LEAD_CANDIDATES.filter((c) => c.id !== teamMemberId)
  if (candidates.length === 0) return <span className="text-slate-400">—</span>

  return (
    <select
      value={current ?? ''}
      onChange={(e) => saveTeamLeadOverride(teamMemberId, e.target.value || null)}
      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent bg-white"
    >
      <option value="">Nepřiřazeno</option>
      {candidates.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}
