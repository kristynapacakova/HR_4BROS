'use client'

import type { InvoicePaymentStatus } from './mock-data'

const KEY = 'fb-invoice-status'
export const INVOICE_STATUS_CHANGED_EVENT = 'fb-invoice-status-changed'

export function invoiceStatusKey(employeeId: string, month: number, year: number) {
  return `${employeeId}-${year}-${month}`
}

export function loadInvoiceStatuses(): Record<string, InvoicePaymentStatus> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveInvoiceStatus(key: string, status: InvoicePaymentStatus) {
  try {
    const all = loadInvoiceStatuses()
    all[key] = status
    localStorage.setItem(KEY, JSON.stringify(all))
    window.dispatchEvent(new Event(INVOICE_STATUS_CHANGED_EVENT))
  } catch { /* noop */ }
}
