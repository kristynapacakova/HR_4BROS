'use client'

export interface TeamProfileOverride {
  photo?: string | null
  bio?: string | null
  gallery?: string[]
}

const KEY = 'fb-team-profiles'
export const TEAM_PROFILE_CHANGED_EVENT = 'fb-team-profile-changed'

function loadAll(): Record<string, TeamProfileOverride> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(map: Record<string, TeamProfileOverride>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
    window.dispatchEvent(new Event(TEAM_PROFILE_CHANGED_EVENT))
  } catch { /* noop */ }
}

export function loadTeamProfiles(): Record<string, TeamProfileOverride> {
  return loadAll()
}

export function saveTeamProfile(memberId: string, override: TeamProfileOverride) {
  const all = loadAll()
  all[memberId] = { ...all[memberId], ...override }
  saveAll(all)
}
