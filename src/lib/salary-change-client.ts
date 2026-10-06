'use client'

import type { SalaryChangeRequest } from './mock-data'

const KEY = 'fb-salary-changes'
export const SALARY_CHANGE_CHANGED_EVENT = 'fb-salary-change-changed'

export function loadSalaryChanges(seed: SalaryChangeRequest[]): SalaryChangeRequest[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(KEY, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

export function saveSalaryChanges(list: SalaryChangeRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(SALARY_CHANGE_CHANGED_EVENT))
  } catch { /* noop */ }
}
