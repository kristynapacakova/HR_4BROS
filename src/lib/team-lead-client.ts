'use client'

const OVERRIDES_KEY = 'fb-team-lead-overrides'
export const TEAM_LEAD_CHANGED_EVENT = 'fb-team-lead-changed'

export function loadTeamLeadOverrides(): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveTeamLeadOverride(memberId: string, leadId: string | null) {
  try {
    const map = loadTeamLeadOverrides()
    map[memberId] = leadId
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event(TEAM_LEAD_CHANGED_EVENT))
  } catch { /* noop */ }
}
