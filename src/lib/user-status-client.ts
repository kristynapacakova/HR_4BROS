'use client'

import { useEffect, useState } from 'react'

/**
 * Aktivní / neaktivní uživatel. Když člověk skončí, HR ho deaktivuje (nemaže):
 * zůstanou mu smlouvy, dokumenty, výplaty i historie. Když se vrátí, HR ho znovu aktivuje
 * a přidá se nové období spolupráce — není potřeba zakládat nový účet.
 *
 * Neaktivní: nepřihlásí se, nezobrazuje se v Týmu, na Dashboardu (narozeniny, výročí),
 * v přehledech plnění, smluv a směrnic, nedostává notifikace ani úkoly.
 * Demo: localStorage. Ostrá verze: User.status + tabulka období spolupráce (viz docs/predani/02).
 */
export interface EmploymentPeriod {
  start: string // YYYY-MM-DD
  end: string | null // null = trvá
  endReason?: string
}
export interface UserStatus {
  active: boolean
  periods: EmploymentPeriod[]
}

const KEY = 'fb-user-status'
export const USER_STATUS_CHANGED_EVENT = 'fb-user-status-changed'

export function loadUserStatuses(): Record<string, UserStatus> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}
function write(map: Record<string, UserStatus>) {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch { /* noop */ }
  window.dispatchEvent(new Event(USER_STATUS_CHANGED_EVENT))
}
const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Výchozí stav = aktivní od data nástupu. */
export function statusOf(map: Record<string, UserStatus>, id: string, startDate: Date): UserStatus {
  return map[id] ?? { active: true, periods: [{ start: iso(startDate), end: null }] }
}

export function deactivateUser(id: string, startDate: Date, end: string, endReason: string) {
  const map = loadUserStatuses()
  const st = statusOf(map, id, startDate)
  const periods = st.periods.map((p, i) => (i === st.periods.length - 1 && !p.end ? { ...p, end, endReason } : p))
  write({ ...map, [id]: { active: false, periods } })
}

export function reactivateUser(id: string, startDate: Date, start: string) {
  const map = loadUserStatuses()
  const st = statusOf(map, id, startDate)
  write({ ...map, [id]: { active: true, periods: [...st.periods, { start, end: null }] } })
}

export function useUserStatuses() {
  const [map, setMap] = useState<Record<string, UserStatus>>({})
  useEffect(() => {
    const refresh = () => setMap(loadUserStatuses())
    refresh()
    window.addEventListener(USER_STATUS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(USER_STATUS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return map
}

/** Funkce, která řekne, jestli je uživatel aktivní — pro filtrování seznamů lidí. */
export function useIsActive() {
  const map = useUserStatuses()
  return (id: string) => map[id]?.active !== false
}
