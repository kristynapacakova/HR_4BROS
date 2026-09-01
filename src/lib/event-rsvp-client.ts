'use client'

export type RsvpStatus = 'YES' | 'NO'

export interface EventRsvp {
  [eventKey: string]: {
    [employeeId: string]: { status: RsvpStatus; name: string }
  }
}

const KEY = 'fb-event-rsvp'
export const EVENT_RSVP_CHANGED = 'fb-event-rsvp-changed'

export function eventKey(title: string, date: string): string {
  return `${title}__${date}`
}

export function loadEventRsvp(): EventRsvp {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveEventRsvp(key: string, employeeId: string, name: string, status: RsvpStatus) {
  try {
    const all = loadEventRsvp()
    all[key] = { ...all[key], [employeeId]: { status, name } }
    localStorage.setItem(KEY, JSON.stringify(all))
    window.dispatchEvent(new Event(EVENT_RSVP_CHANGED))
  } catch { /* noop */ }
}
