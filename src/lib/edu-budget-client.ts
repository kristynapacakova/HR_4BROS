'use client'

import type { EduRequest } from './mock-data'

const REQUESTS_KEY = 'fb-edu-requests'
const BUDGETS_KEY = 'fb-edu-budgets'
export const EDU_CHANGED_EVENT = 'fb-edu-changed'

export function loadEduRequests(seed: EduRequest[]): EduRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

export function saveEduRequests(list: EduRequest[]) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(EDU_CHANGED_EVENT))
  } catch { /* noop */ }
}

export function loadEduBudgetOverrides(): Record<string, number> {
  try {
    const raw = localStorage.getItem(BUDGETS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveEduBudgetOverrides(map: Record<string, number>) {
  try {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event(EDU_CHANGED_EVENT))
  } catch { /* noop */ }
}
