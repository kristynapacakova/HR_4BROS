'use client'

import type { ExpenseRequest } from './mock-data'

const KEY = 'fb-expense-requests'
export const EXPENSE_CHANGED_EVENT = 'fb-expense-changed'

export function loadExpenseRequests(seed: ExpenseRequest[]): ExpenseRequest[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(KEY, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

export function saveExpenseRequests(list: ExpenseRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(EXPENSE_CHANGED_EVENT))
  } catch { /* noop */ }
}

export function markExpenseSeen(list: ExpenseRequest[], id: string) {
  saveExpenseRequests(list.map((r) => (r.id === id ? { ...r, seenByEmployee: true } : r)))
}
