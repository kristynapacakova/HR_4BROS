'use client'

import type { TeamAdjustmentRequest } from './mock-data'

const KEY = 'fb-team-adjustments'
export const TEAM_ADJUSTMENT_CHANGED_EVENT = 'fb-team-adjustment-changed'

export function loadTeamAdjustments(seed: TeamAdjustmentRequest[]): TeamAdjustmentRequest[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(KEY, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

export function saveTeamAdjustments(list: TeamAdjustmentRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(TEAM_ADJUSTMENT_CHANGED_EVENT))
  } catch { /* noop */ }
}
