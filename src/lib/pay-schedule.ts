/**
 * Termíny odměn 4Bros — do kdy OSVČ posílají fakturu a kdy se proplácí výplaty i faktury.
 * HR je mění v Admin → Přehled odměn → Přehled faktur OSVČ. V demu se ukládají do prohlížeče
 * (stejně jako odkaz na Google Kalendář); po napojení na databázi se budou sdílet pro všechny.
 */
export interface PaySchedule {
  /** Do kolikátého dne pošlou OSVČ fakturu za minulý měsíc */
  invoiceDueDay: number
  /** Kolikátého se proplácí výplaty (HPP) i faktury OSVČ */
  payDay: number
}

export const DEFAULT_PAY_SCHEDULE: PaySchedule = { invoiceDueDay: 10, payDay: 18 }
export const PAY_SCHEDULE_KEY = 'fb-pay-schedule'
export const PAY_SCHEDULE_CHANGED_EVENT = 'fb-pay-schedule-changed'

const clampDay = (n: unknown, fallback: number) => {
  const v = Math.round(Number(n))
  return Number.isFinite(v) && v >= 1 && v <= 28 ? v : fallback
}

export function loadPaySchedule(): PaySchedule {
  try {
    const raw = JSON.parse(localStorage.getItem(PAY_SCHEDULE_KEY) ?? 'null')
    if (raw) return {
      invoiceDueDay: clampDay(raw.invoiceDueDay, DEFAULT_PAY_SCHEDULE.invoiceDueDay),
      payDay: clampDay(raw.payDay, DEFAULT_PAY_SCHEDULE.payDay),
    }
  } catch { /* noop */ }
  return DEFAULT_PAY_SCHEDULE
}

export function savePaySchedule(s: PaySchedule) {
  try { localStorage.setItem(PAY_SCHEDULE_KEY, JSON.stringify(s)) } catch { /* noop */ }
  window.dispatchEvent(new Event(PAY_SCHEDULE_CHANGED_EVENT))
}

const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']
const MONTHS_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']

export interface PayNext { title: string; sub: string; inDays: number; dateLabel: string }

/** Nejbližší „peněžní“ termín pro člověka: výplata (HPP), nebo odeslání / proplacení faktury (OSVČ). */
export function computePayNext(isIco: boolean, schedule: PaySchedule = DEFAULT_PAY_SCHEDULE, now = new Date()): PayNext {
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const next = (day: number) => {
    let d = new Date(today.getFullYear(), today.getMonth(), day)
    if (d < today) d = new Date(today.getFullYear(), today.getMonth() + 1, day)
    return d
  }
  const label = (d: Date) => `${d.getDate()}. ${MONTHS_GEN[d.getMonth()]}`
  const days = (d: Date) => Math.round((d.getTime() - today.getTime()) / 86400000)
  const prevMonthOf = (d: Date) => MONTHS[new Date(d.getFullYear(), d.getMonth() - 1, 1).getMonth()]

  const pay = next(schedule.payDay)
  if (!isIco) {
    return { title: `Výplata za ${prevMonthOf(pay)} přijde ${label(pay)}`, sub: 'Výplatní pásku najdeš v Moje odměna', inDays: days(pay), dateLabel: label(pay) }
  }
  const due = next(schedule.invoiceDueDay)
  // Po termínu odeslání a před proplacením se odpočítává proplacení.
  if (due.getTime() > pay.getTime()) {
    return { title: `Faktura za ${prevMonthOf(pay)} bude proplacená kolem ${label(pay)}`, sub: `Další fakturu pošli do ${schedule.invoiceDueDay}. příštího měsíce`, inDays: days(pay), dateLabel: label(pay) }
  }
  return { title: `Fakturu za ${prevMonthOf(due)} pošli do ${label(due)}`, sub: `Proplácí se kolem ${schedule.payDay}. · podklady najdeš v Moje odměna`, inDays: days(due), dateLabel: label(due) }
}
