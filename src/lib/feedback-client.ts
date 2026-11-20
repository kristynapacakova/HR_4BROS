'use client'

const KEY = 'fb-feedback-admin'
export const FEEDBACK_ADMIN_CHANGED_EVENT = 'fb-feedback-admin-changed'

export interface FeedbackOverride {
  status?: 'NEW' | 'READ' | 'RESOLVED'
  adminNote?: string | null
}

function loadOverrides(): Record<string, FeedbackOverride> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function loadFeedbackOverride(id: string): FeedbackOverride | undefined {
  return loadOverrides()[id]
}

export function loadAllFeedbackOverrides(): Record<string, FeedbackOverride> {
  return loadOverrides()
}

export function saveFeedbackOverride(id: string, patch: FeedbackOverride) {
  const all = loadOverrides()
  all[id] = { ...all[id], ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
    window.dispatchEvent(new Event(FEEDBACK_ADMIN_CHANGED_EVENT))
  } catch { /* noop */ }
}
