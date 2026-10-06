'use client'

import type { PersonRecord } from './mock-data'

export interface PersonOverride {
  role?: PersonRecord['role']
  icoNumber?: string | null
  officeAmount?: number | null
  refreshAmount?: number | null
  annualLeaveDays?: number | null
}

const OVERRIDES_KEY = 'fb-person-overrides'
export const PERSON_OVERRIDE_CHANGED_EVENT = 'fb-person-override-changed'

export function loadPersonOverrides(): Record<string, PersonOverride> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function savePersonOverride(personId: string, patch: PersonOverride) {
  try {
    const map = loadPersonOverrides()
    map[personId] = { ...map[personId], ...patch }
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event(PERSON_OVERRIDE_CHANGED_EVENT))
  } catch { /* noop */ }
}
