'use client'

import { useEffect, useState } from 'react'
import { Eye, Download, X, Check } from 'lucide-react'
import { DEMO_TEAM, type PersonRecord } from '@/lib/mock-data'
import { loadPersonOverrides, PERSON_OVERRIDE_CHANGED_EVENT, type PersonOverride } from '@/lib/person-admin-client'
import {
  officeInvoicesFor, useOfficeInvoiceStatuses, OFFICE_INVOICE_STATUS_LABEL, SUPPLIER,
  type OfficeInvoice, type OfficeInvoiceStatus,
} from '@/lib/fakturoid'

const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']
const kc = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n) + ' Kč'
const d = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ')

export function usePersonOverrides() {
  const [map, setMap] = useState<Record<string, PersonOverride>>({})
  useEffect(() => {
    const refresh = () => setMap(loadPersonOverrides())
    refresh()
    window.addEventListener(PERSON_OVERRIDE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(PERSON_OVERRIDE_CHANGED_EVENT, refresh); window.removeEventListener('storage', refresh) }
  }, [])
  return map
}

/** Faktury jednoho člověka s aktuálními částkami a stavy. */
export function useOfficeInvoices(personId?: string): OfficeInvoice[] {
  const overrides = usePersonOverrides()
  const statuses = useOfficeInvoiceStatuses()
  const person = DEMO_TEAM.find(m => m.id === personId)
  return person ? officeInvoicesFor(person, overrides[person.id], statuses) : []
}

/** Klidná paleta: zaplacena = šedě ✓, nezaplacena = gold, po splatnosti = navy */
export function OfficeInvoiceStatusTag({ status }: { status: OfficeInvoiceStatus }) {
  if (status === 'PAID') return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy/55"><Check className="w-3 h-3" />{OFFICE_INVOICE_STATUS_LABEL.PAID}</span>
  return <span className={`text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 ${status === 'OVERDUE' ? 'bg-navy text-white' : 'bg-gold text-navy'}`}>{OFFICE_INVOICE_STATUS_LABEL[status]}</span>
}

function invoiceHtml(inv: OfficeInvoice, person: PersonRecord) {
  const rows = inv.lines.map(l => `<tr><td>${l.name}</td><td style="text-align:right">${l.quantity} ${l.unit}</td><td style="text-align:right">${kc(l.unitPrice)}</td><td style="text-align:right">${kc(l.unitPrice * l.quantity)}</td></tr>`).join('')
  return `<!doctype html><html lang="cs"><head><meta charset="utf-8"><title>Faktura ${inv.number}</title>
<style>body{font-family:system-ui,sans-serif;color:#0d214f;max-width:720px;margin:40px auto;padding:0 24px}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px;border-bottom:1px solid #e5e3f3;text-align:left;font-size:14px}.muted{color:#6b7591;font-size:12px}.tot{font-size:18px;font-weight:700;text-align:right;margin-top:12px}.grid{display:flex;gap:40px;margin-top:16px}</style></head>
<body><h1>Faktura ${inv.number}</h1><p class="muted">Ukázka z dema — v ostré verzi se otevře PDF z Fakturoidu.</p>
<div class="grid"><div><b>Dodavatel</b><br>${SUPPLIER.name}<br>${SUPPLIER.address}</div><div><b>Odběratel</b><br>${person.name}<br>IČO ${person.icoNumber ?? '—'}</div></div>
<p>Vystaveno ${d(inv.issuedOn)} · splatnost ${d(inv.dueOn)} · za ${MONTHS[inv.month - 1]} ${inv.year}</p>
<table><thead><tr><th>Položka</th><th style="text-align:right">Množství</th><th style="text-align:right">Cena</th><th style="text-align:right">Celkem</th></tr></thead><tbody>${rows}</tbody></table>
<p class="tot">Celkem k úhradě ${kc(inv.total)}</p></body></html>`
}

export function downloadOfficeInvoice(inv: OfficeInvoice) {
  const person = DEMO_TEAM.find(m => m.id === inv.personId)
  if (!person) return
  const blob = new Blob([invoiceHtml(inv, person)], { type: 'text/html' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `faktura-${inv.number}.html`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function OfficeInvoiceModal({ inv, onClose }: { inv: OfficeInvoice; onClose: () => void }) {
  const person = DEMO_TEAM.find(m => m.id === inv.personId)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60" onClick={onClose}>
      <div className="bg-white border border-navy w-full max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(13,33,79,0.14)]">
          <p className="font-headline text-navy text-[17px]" style={{ fontWeight: 600 }}>Faktura {inv.number}</p>
          <button type="button" onClick={onClose} aria-label="Zavřít" className="text-navy/60 hover:text-navy"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 text-sm text-navy">
          <div className="flex flex-wrap items-center gap-3">
            <OfficeInvoiceStatusTag status={inv.status} />
            <span className="text-navy/60">
              {inv.status === 'PAID' && inv.paidOn ? `uhrazeno ${d(inv.paidOn)}` : `splatnost ${d(inv.dueOn)}`}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-navy/50 mb-0.5">Dodavatel</p>{SUPPLIER.name}</div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-navy/50 mb-0.5">Odběratel</p>{person?.name}<br /><span className="text-navy/60">IČO {person?.icoNumber ?? '—'}</span></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-navy/50 mb-0.5">Za období</p>{MONTHS[inv.month - 1]} {inv.year}</div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-navy/50 mb-0.5">Vystaveno</p>{d(inv.issuedOn)}</div>
          </div>
          <table className="w-full text-[13px]">
            <thead><tr className="text-left text-[11px] text-navy/50 border-b border-[rgba(13,33,79,0.1)]"><th className="py-2 font-semibold">Položka</th><th className="py-2 font-semibold text-right">Celkem</th></tr></thead>
            <tbody>
              {inv.lines.map(l => (
                <tr key={l.name} className="border-b border-[rgba(13,33,79,0.06)]"><td className="py-2">{l.name} <span className="text-navy/45">· {l.quantity} {l.unit}</span></td><td className="py-2 text-right">{kc(l.unitPrice * l.quantity)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="text-right font-headline text-[18px]" style={{ fontWeight: 600 }}>Celkem {kc(inv.total)}</p>
          <p className="text-[11px] text-navy/45">Faktura se vystavuje automaticky z Fakturoidu 1. den v měsíci. Zaplacení se propíše samo z banky.</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[rgba(13,33,79,0.14)]">
          <button type="button" onClick={() => downloadOfficeInvoice(inv)} className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-violet"><Download className="w-4 h-4" />Stáhnout</button>
        </div>
      </div>
    </div>
  )
}

/** Moje odměna (OSVČ): faktury od 4Bros za nájem a občerstvení. */
export function MyOfficeInvoices({ personId }: { personId?: string }) {
  const list = useOfficeInvoices(personId)
  const [open, setOpen] = useState<OfficeInvoice | null>(null)
  const unpaid = list.filter(i => i.status !== 'PAID')
  return (
    <div className="bg-white border border-[rgba(13,33,79,0.14)]">
      <div className="px-6 py-4 border-b border-[rgba(13,33,79,0.08)] flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-navy">Faktury od 4Bros</h3>
          <p className="text-xs text-navy/50 mt-0.5">Nájem kancelářského místa a občerstvení · vystavují se automaticky 1. den v měsíci</p>
        </div>
        {list.length > 0 && (unpaid.length
          ? <span className="text-xs text-navy/70">K úhradě <b className="text-navy">{kc(unpaid.reduce((s, i) => s + i.total, 0))}</b></span>
          : <span className="text-xs text-navy/50">✓ Vše zaplaceno</span>)}
      </div>
      {list.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-navy/50">Nemáš nastavený nájem ani občerstvení, takže ti žádné faktury nechodí.</p>
      ) : (
        <ul className="divide-y divide-[rgba(13,33,79,0.06)]">
          {list.map(inv => (
            <li key={inv.id} className="grid grid-cols-[minmax(130px,1fr)_minmax(120px,1fr)_100px_130px_auto] gap-3 items-center px-6 py-2.5 text-sm">
              <button type="button" onClick={() => setOpen(inv)} className="text-left font-semibold text-navy hover:text-violet capitalize">{MONTHS[inv.month - 1]} {inv.year}</button>
              <span className="text-[12px] text-navy/50">{inv.number}</span>
              <span className="text-right font-semibold text-navy">{kc(inv.total)}</span>
              <span className="text-center"><OfficeInvoiceStatusTag status={inv.status} /></span>
              <span className="flex items-center gap-1 justify-end">
                <button type="button" onClick={() => setOpen(inv)} title="Otevřít" className="p-1 text-navy/50 hover:text-navy"><Eye className="w-4 h-4" /></button>
                <button type="button" onClick={() => downloadOfficeInvoice(inv)} title="Stáhnout" className="p-1 text-navy/50 hover:text-navy"><Download className="w-4 h-4" /></button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && <OfficeInvoiceModal inv={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
