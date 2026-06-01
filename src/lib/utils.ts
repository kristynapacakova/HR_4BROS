import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'CZK') {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatMonth(month: number, year: number) {
  const date = new Date(year, month - 1, 1)
  return new Intl.DateTimeFormat('cs-CZ', { month: 'long', year: 'numeric' }).format(date)
}

export function getLeaveTypeCz(type: string) {
  const map: Record<string, string> = {
    ANNUAL: 'Řádná dovolená',
    SICK: 'Nemocenská',
    PERSONAL: 'Osobní volno',
    UNPAID: 'Neplacené volno',
  }
  return map[type] ?? type
}

export function getStatusCz(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Čeká na schválení',
    APPROVED: 'Schváleno',
    REJECTED: 'Zamítnuto',
  }
  return map[status] ?? status
}

export function getDaysBetween(start: Date | string, end: Date | string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}
