'use client'

export interface PhotoPosition {
  x: number // 0-100, % from left
  y: number // 0-100, % from top
  zoom: number // 100-300, %
}

export interface TeamProfileOverride {
  photo?: string | null
  photoPos?: PhotoPosition
  bio?: string | null
  interests?: string[]
  helpWith?: string | null
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
