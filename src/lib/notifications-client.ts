'use client'

export interface AppNotification {
  id: string
  recipientEmail: string
  title: string
  body: string
  href?: string
  createdAt: string
  read: boolean
}

const KEY = 'fb-notifications'
export const NOTIFICATIONS_CHANGED_EVENT = 'fb-notifications-changed'

function readRaw(): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeRaw(list: AppNotification[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT))
  } catch { /* noop */ }
}

export function loadNotifications(seed: AppNotification[] = []): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(KEY, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

export function pushNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  writeRaw([
    { ...n, id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), read: false },
    ...readRaw(),
  ])
}

export function markRead(id: string) {
  writeRaw(readRaw().map((n) => (n.id === id ? { ...n, read: true } : n)))
}

export function markAllRead(recipientEmail: string) {
  writeRaw(readRaw().map((n) => (n.recipientEmail.toLowerCase() === recipientEmail.toLowerCase() ? { ...n, read: true } : n)))
}
