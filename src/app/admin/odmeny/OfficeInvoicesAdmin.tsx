'use client'

import { useState } from 'react'
import { Eye, Check, RotateCcw } from 'lucide-react'
import { DEMO_TEAM } from '@/lib/mock-data'
import { officeInvoicesFor, useOfficeInvoiceStatuses, setOfficeInvoicePaid, type OfficeInvoice } from '@/lib/fakturoid'
import { useIsActive } from '@/lib/user-status-client'
import { OfficeInvoiceModal, OfficeInvoiceStatusTag, usePersonOverrides } from '@/components/OfficeInvoices'

const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']
const kc = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n) + ' Kč'

/** Přehled odměn → Faktury za kancelář: co 4Bros vystavilo OSVČ za nájem a občerstvení a jestli je to zaplacené. */
export function OfficeInvoicesAdmin() {
  const overrides = usePersonOverrides()
  const statuses = useOfficeInvoiceStatuses()
  const isActive = useIsActive()
  const [offset, setOffset] = useState(0)
  const [open, setOpen] = useState<OfficeInvoice | null>(null)

  const today = new Date()
  const ref = new Date(today.getFullYear(), today.getMonth() - offset, 1)
  const month = ref.getMonth() + 1, year = ref.getFullYear()
  const icos = DEMO_TEAM.filter(m => m.employmentType === 'ICO' && isActive(m.id)).sort((a, b) => a.name.localeCompare(b.name, 'cs'))
  const rows = icos.map(m => ({ m, inv: officeInvoicesFor(m, overrides[m.id], statuses, today, 24).find(i => i.month === month && i.year === year) }))
  const issued = rows.filter(r => r.inv)
  const unpaid = issued.filter(r => r.inv!.status !== 'PAID')

  return (
    <div className="space-y-4">
      <p className="text-sm text-navy/60">
        Faktury, které 4Bros každý měsíc automaticky vystavuje OSVČ přes Fakturoid — položky podle toho, co je u člověka vyplněné
        v Admin panel → Uživatelé (kancelář, občerstvení). Zaplacení se propíše z Fakturoidu napárovaného na banku. V demu jde stav přepnout ručně.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center border border-[rgba(13,33,79,0.14)] bg-white">
          <button type="button" onClick={() => setOffset(o => o + 1)} className="px-3 py-1.5 text-navy/60 hover:text-navy">‹</button>
          <span className="px-3 py-1.5 text-sm font-semibold text-navy capitalize min-w-[130px] text-center">{MONTHS[month - 1]} {year}</span>
          <button type="button" onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0} className="px-3 py-1.5 text-navy/60 hover:text-navy disabled:opacity-30">›</button>
        </div>
        <span className="text-sm text-navy/60">Vystaveno <b className="text-navy">{issued.length}</b> · nezaplaceno <b className="text-navy">{unpaid.length}</b>{unpaid.length ? ` (${kc(unpaid.reduce((s, r) => s + r.inv!.total, 0))})` : ''}</span>
      </div>

      <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-x-auto"><div className="min-w-[820px]">
        <div className="grid grid-cols-[minmax(170px,1.4fr)_110px_90px_100px_90px_120px_64px] gap-3 px-5 py-2.5 text-[11px] font-semibold text-navy/50 border-b border-[rgba(13,33,79,0.08)]">
          <span>Uživatel</span><span className="text-center">Číslo</span><span className="text-right">Kancelář</span><span className="text-right">Občerstvení</span><span className="text-right">Celkem</span><span className="text-center">Stav</span><span />
        </div>
        <ul className="divide-y divide-[rgba(13,33,79,0.06)]">
          {rows.map(({ m, inv }) => (
            <li key={m.id} className="grid grid-cols-[minmax(170px,1.4fr)_110px_90px_100px_90px_120px_64px] gap-3 items-center px-5 py-2.5 text-sm">
              <span className="font-semibold text-navy truncate">{m.name}</span>
              {inv ? (
                <>
                  <span className="text-center text-[12px] text-navy/55">{inv.number}</span>
                  <span className="text-right text-navy/70">{kc(inv.lines.find(l => l.name.includes('kancel'))?.unitPrice ?? 0)}</span>
                  <span className="text-right text-navy/70">{kc(inv.lines.find(l => l.name.includes('erstven'))?.unitPrice ?? 0)}</span>
                  <span className="text-right font-semibold text-navy">{kc(inv.total)}</span>
                  <span className="text-center"><OfficeInvoiceStatusTag status={inv.status} /></span>
                  <span className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => setOpen(inv)} title="Otevřít" className="p-1 text-navy/50 hover:text-navy"><Eye className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setOfficeInvoicePaid(inv.id, inv.status !== 'PAID')} title={inv.status === 'PAID' ? 'Vrátit na nezaplaceno (demo)' : 'Označit jako zaplacenou (demo)'} className={`p-1 ${inv.status === 'PAID' ? 'text-navy/30 hover:text-navy' : 'text-navy/60 hover:text-violet'}`}>
                      {inv.status === 'PAID' ? <RotateCcw className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                  </span>
                </>
              ) : (
                <span className="col-span-6 text-[12px] text-navy/45">Nevystaveno — nemá vyplněný nájem ani občerstvení, nebo ještě nenastoupil(a).</span>
              )}
            </li>
          ))}
        </ul>
      </div></div>
      {open && <OfficeInvoiceModal inv={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
