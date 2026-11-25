'use client'

import { useEffect, useState } from 'react'
import type { PersonRecord } from './mock-data'
import type { PersonOverride } from './person-admin-client'

/**
 * Faktury od 4Bros pro OSVČ (IČO) — nájem kancelářského místa a občerstvení.
 *
 * Pravidlo: HR v Admin → Uživatelé vyplní u IČaře „Kancelář (Kč/měs)“ a „Občerstvení (Kč/měs)“.
 * Každý měsíc (1. den) se přes API Fakturoidu automaticky vystaví faktura s těmito položkami
 * (položka s nulou nebo prázdná se vynechá; když jsou obě prázdné, faktura se nevystaví).
 * Uživatel ji vidí v Moje odměna → Faktury od 4Bros, otevře / stáhne PDF a vidí stav (zaplacena / nezaplacena / po splatnosti).
 *
 * ── Napojení na Fakturoid (API v3, ověřit aktuální dokumentaci https://www.fakturoid.cz/api/v3) ──
 * - Autorizace: OAuth 2 „client credentials“ (Client ID + Secret z Nastavení → API), token se obnovuje; tajné údaje jen na serveru.
 *   Každý požadavek musí mít hlavičku User-Agent s názvem aplikace a kontaktem (firemní, ne osobní).
 * - Základ: https://app.fakturoid.cz/api/v3/accounts/{slug}/
 * - Odběratel (subject): při prvním vystavení POST subjects.json { name, registration_no: IČO, email, street, city, zip };
 *   uložit subject_id k uživateli (User.fakturoidSubjectId), při změně IČO / adresy PATCH subjects/{id}.json.
 * - Faktura: POST invoices.json { subject_id, issued_on, due (dní splatnosti), lines: [{ name, quantity: 1, unit_name: 'měs', unit_price, vat_rate }] },
 *   pak odeslat e-mailem (message / fire endpoint) a uložit id, number, public_html_url, pdf_url.
 * - Stav: pole status (open, sent, overdue, paid, cancelled). Fakturoid je napárovaný na banku → zaplacení se pozná samo.
 *   Do aplikace přes webhook (událost invoice_paid / invoice_overdue…) nebo noční kontrolu; webhook ověřit tajným tokenem.
 * - PDF: GET invoices/{id}/download.pdf (stáhne server a pošle uživateli; uživatel nikdy nedostane API token).
 * - Spouštění: cron 1. dne v měsíci v aplikaci (částky se berou z aplikace v ten den). Alternativa: opakovaná faktura
 *   (generator) přímo ve Fakturoidu — pak by se při změně částky musela upravit i tam. Doporučení: cron v aplikaci.
 * - Idempotence: na jednoho uživatele a měsíc max. 1 faktura (unikátní klíč personId + rok + měsíc), opakované spuštění nic nezdvojí.
 * - Neaktivní uživatel (Admin → Uživatelé) fakturu nedostane.
 *
 * Demo: faktury se dopočítají z dnešních částek; stav simuluje localStorage (HR ho v adminu může přepnout).
 */

export type OfficeInvoiceStatus = 'PAID' | 'UNPAID' | 'OVERDUE'
export interface OfficeInvoiceLine { name: string; quantity: number; unit: string; unitPrice: number }
export interface OfficeInvoice {
  id: string
  personId: string
  number: string
  month: number // 1–12, za který měsíc
  year: number
  issuedOn: string // YYYY-MM-DD
  dueOn: string
  lines: OfficeInvoiceLine[]
  total: number
  status: OfficeInvoiceStatus
  paidOn: string | null
}

export const OFFICE_INVOICE_STATUS_LABEL: Record<OfficeInvoiceStatus, string> = {
  PAID: 'Zaplacena',
  UNPAID: 'Nezaplacena',
  OVERDUE: 'Po splatnosti',
}

export const OFFICE_INVOICE_DUE_DAYS = 14
export const SUPPLIER = {
  name: 'Four Bros s.r.o.',
  address: 'Praha',
  note: 'Údaje dodavatele se načtou z účtu ve Fakturoidu.',
}

const KEY = 'fb-office-invoice-status'
export const OFFICE_INVOICE_CHANGED_EVENT = 'fb-office-invoice-changed'
type StatusOverride = { status: 'PAID' | 'UNPAID'; paidOn: string | null }

export function loadOfficeInvoiceStatuses(): Record<string, StatusOverride> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}
/** Demo: ručně přepnout stav (v ostré verzi přijde z Fakturoidu). */
export function setOfficeInvoicePaid(id: string, paid: boolean) {
  const map = loadOfficeInvoiceStatuses()
  map[id] = { status: paid ? 'PAID' : 'UNPAID', paidOn: paid ? new Date().toISOString().slice(0, 10) : null }
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch { /* noop */ }
  window.dispatchEvent(new Event(OFFICE_INVOICE_CHANGED_EVENT))
}
export function useOfficeInvoiceStatuses() {
  const [map, setMap] = useState<Record<string, StatusOverride>>({})
  useEffect(() => {
    const refresh = () => setMap(loadOfficeInvoiceStatuses())
    refresh()
    window.addEventListener(OFFICE_INVOICE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(OFFICE_INVOICE_CHANGED_EVENT, refresh); window.removeEventListener('storage', refresh) }
  }, [])
  return map
}

/** demo: kdo ještě nezaplatil fakturu za aktuální měsíc (Tomáš = ukázkový OSVČ) */
const DEMO_UNPAID = ['t4', 't12', 't15']

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Aktuální částky (úprava HR v Admin → Uživatelé má přednost před výchozí hodnotou). */
export function officeAmountsOf(person: PersonRecord, override?: PersonOverride) {
  const office = override?.officeAmount !== undefined ? override.officeAmount : person.officeAmount
  const refresh = override?.refreshAmount !== undefined ? override.refreshAmount : person.refreshAmount
  return { office: office ?? 0, refresh: refresh ?? 0 }
}

export function invoiceLinesFor(person: PersonRecord, override?: PersonOverride): OfficeInvoiceLine[] {
  if (person.employmentType !== 'ICO') return []
  const { office, refresh } = officeAmountsOf(person, override)
  return [
    ...(office > 0 ? [{ name: 'Nájem kancelářského místa', quantity: 1, unit: 'měs', unitPrice: office }] : []),
    ...(refresh > 0 ? [{ name: 'Občerstvení', quantity: 1, unit: 'měs', unitPrice: refresh }] : []),
  ]
}

/**
 * Faktury za posledních `months` měsíců (vč. aktuálního), nejnovější první — jen od nástupu.
 * Demo stav: vystavena 1. den měsíce, splatnost 14 dní, uhrazeno 10. den; aktuální měsíc nezaplacený jen u DEMO_UNPAID.
 */
export function officeInvoicesFor(
  person: PersonRecord, override: PersonOverride | undefined, statuses: Record<string, StatusOverride>,
  today = new Date(), months = 12,
): OfficeInvoice[] {
  const lines = invoiceLinesFor(person, override)
  if (!lines.length) return []
  const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
  const out: OfficeInvoice[] = []
  const start = new Date(person.startDate.getFullYear(), person.startDate.getMonth(), 1)
  for (let i = 0; i < months; i++) {
    const issued = new Date(today.getFullYear(), today.getMonth() - i, 1)
    if (issued < start) break
    const due = new Date(issued.getFullYear(), issued.getMonth(), 1 + OFFICE_INVOICE_DUE_DAYS)
    const month = issued.getMonth() + 1, year = issued.getFullYear()
    const id = `oi-${person.id}-${year}-${String(month).padStart(2, '0')}`
    const ov = statuses[id]
    const defaultPaid = new Date(year, month - 1, 10) <= today && !(i === 0 && DEMO_UNPAID.includes(person.id))
    const paid = ov ? ov.status === 'PAID' : defaultPaid
    const paidOn = ov ? ov.paidOn : defaultPaid ? iso(new Date(year, month - 1, 10)) : null
    out.push({
      id, personId: person.id,
      number: `K${year}${String(month).padStart(2, '0')}-${person.id.replace('t', '').padStart(3, '0')}`,
      month, year, issuedOn: iso(issued), dueOn: iso(due), lines, total,
      status: paid ? 'PAID' : due < today ? 'OVERDUE' : 'UNPAID',
      paidOn: paid ? paidOn : null,
    })
  }
  return out
}
