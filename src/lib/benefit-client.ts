'use client'

import type { BenefitType, SportBenefitRequest } from './mock-data'

const SELECTION_KEY = 'fb-benefit-selection'
const REQUESTS_KEY = 'fb-sport-requests'
export const BENEFIT_CHANGED_EVENT = 'fb-benefit-changed'

export function loadBenefitSelections(seed: Record<string, BenefitType>): Record<string, BenefitType> {
  try {
    const raw = localStorage.getItem(SELECTION_KEY)
    if (raw) return { ...seed, ...JSON.parse(raw) }
    return seed
  } catch {
    return seed
  }
}

export function saveBenefitSelection(employeeId: string, type: BenefitType) {
  try {
    const raw = localStorage.getItem(SELECTION_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[employeeId] = type
    localStorage.setItem(SELECTION_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event(BENEFIT_CHANGED_EVENT))
  } catch { /* noop */ }
}

export function loadSportRequests(seed: SportBenefitRequest[]): SportBenefitRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

export function saveSportRequests(list: SportBenefitRequest[]) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(BENEFIT_CHANGED_EVENT))
  } catch { /* noop */ }
}
