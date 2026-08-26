'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, FileText } from 'lucide-react'
import type { IcoInvoiceRecord, InvoicePaymentStatus } from '@/lib/mock-data'
import { INVOICE_STATUS_LABELS } from '@/lib/mock-data'
import { loadInvoiceStatuses, saveInvoiceStatus, invoiceStatusKey, INVOICE_STATUS_CHANGED_EVENT } from '@/lib/invoice-status-client'

const MONTH_NAMES_CZ = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec']

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n) + ' Kč'
}

function total(inv: IcoInvoiceRecord) {
  return inv.salaryAmount + inv.officeAmount + inv.refreshAmount + inv.otherAmount
}

function StatusBadge({ status, onClick }: { status: InvoicePaymentStatus; onClick?: () => void }) {
  const style =
    status === 'ZAPLACENO' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
    status === 'CEKA_NA_UHRADU' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
    'bg-red-100 text-red-700 hover:bg-red-200'
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${style} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      title={onClick ? 'Klikni pro změnu stavu' : undefined}
    >
      {INVOICE_STATUS_LABELS[status]}
    </button>
  )
}

const STATUS_CYCLE: InvoicePaymentStatus[] = ['NEZAPLACENO', 'CEKA_NA_UHRADU', 'ZAPLACENO']

export function InvoiceOverview({ employees, invoices }: {
  employees: { id: string; name: string }[]
  invoices: IcoInvoiceRecord[]
}) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [detailId, setDetailId] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, InvoicePaymentStatus>>({})

  useEffect(() => {
    const refresh = () => setStatuses(loadInvoiceStatuses())
    refresh()
    window.addEventListener(INVOICE_STATUS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(INVOICE_STATUS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const shiftMonth = (dir: 1 | -1) => {
    let m = month + dir
    let y = year
    if (m > 12) { m = 1; y += 1 }
    if (m < 1) { m = 12; y -= 1 }
    setMonth(m); setYear(y)
  }

  const statusFor = (employeeId: string, m: number, y: number) =>
    statuses[invoiceStatusKey(employeeId, m, y)] ?? 'NEZAPLACENO'

  const cycleStatus = (employeeId: string, m: number, y: number) => {
    const key = invoiceStatusKey(employeeId, m, y)
    const current = statuses[key] ?? 'NEZAPLACENO'
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
    saveInvoiceStatus(key, next)
  }

  const rows = employees.map((emp) => ({
    emp,
    invoice: invoices.find((i) => i.employeeId === emp.id && i.month === month && i.year === year) ?? null,
  }))

  const detailEmp = employees.find((e) => e.id === detailId)
  const detailInvoices = detailId
    ? invoices.filter((i) => i.employeeId === detailId).sort((a, b) => (b.year - a.year) || (b.month - a.month))
    : []

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Month nav */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-violet/10 hover:bg-violet/20 text-violet text-sm font-medium rounded-full transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Předchozí měsíc
        </button>
        <h3 className="font-headline font-semibold text-navy">Přehled za {month}/{year}</h3>
        <button
          onClick={() => shiftMonth(1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-violet/10 hover:bg-violet/20 text-violet text-sm font-medium rounded-full transition-colors"
        >
          Další měsíc <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-6 py-3 font-medium">Období</th>
              <th className="px-4 py-3 font-medium">Plat</th>
              <th className="px-4 py-3 font-medium">Místo</th>
              <th className="px-4 py-3 font-medium">Občerstvení</th>
              <th className="px-4 py-3 font-medium">Další</th>
              <th className="px-4 py-3 font-medium">Celkem</th>
              <th className="px-4 py-3 font-medium">Stav</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(({ emp, invoice }) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-medium text-navy">{emp.name}</td>
                <td className="px-4 py-3 text-slate-600">{invoice ? fmt(invoice.salaryAmount) : '—'}</td>
                <td className="px-4 py-3 text-slate-600">{invoice ? fmt(invoice.officeAmount) : '—'}</td>
                <td className="px-4 py-3 text-slate-600">{invoice ? fmt(invoice.refreshAmount) : '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {invoice?.otherLabel ? `${invoice.otherLabel} ${fmt(invoice.otherAmount)}` : '—'}
                </td>
                <td className="px-4 py-3 font-semibold text-navy">{invoice ? fmt(total(invoice)) : '—'}</td>
                <td className="px-4 py-3">
                  {invoice && (
                    <StatusBadge status={statusFor(emp.id, month, year)} onClick={() => cycleStatus(emp.id, month, year)} />
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => setDetailId(emp.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet text-white text-xs font-medium rounded-lg hover:bg-violet-dark transition-colors ml-auto"
                  >
                    <FileText className="w-3.5 h-3.5" /> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal — historie faktur daného člověka */}
      {detailEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailId(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-headline font-semibold text-navy">{detailEmp.name} — historie faktur</h3>
              <button onClick={() => setDetailId(null)} className="p-1.5 text-slate-400 hover:text-navy rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-3 font-medium">Období</th>
                    <th className="px-4 py-3 font-medium">Plat</th>
                    <th className="px-4 py-3 font-medium">Místo</th>
                    <th className="px-4 py-3 font-medium">Občerstvení</th>
                    <th className="px-4 py-3 font-medium">Další</th>
                    <th className="px-4 py-3 font-medium">Faktura</th>
                    <th className="px-4 py-3 font-medium">Celkem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {detailInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-navy">{inv.month}/{inv.year}</td>
                      <td className="px-4 py-3 text-slate-600">{fmt(inv.salaryAmount)}</td>
                      <td className="px-4 py-3 text-slate-600">{fmt(inv.officeAmount)}</td>
                      <td className="px-4 py-3 text-slate-600">{fmt(inv.refreshAmount)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {inv.otherLabel ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            {inv.otherLabel} {fmt(inv.otherAmount)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={statusFor(inv.employeeId, inv.month, inv.year)}
                          onClick={() => cycleStatus(inv.employeeId, inv.month, inv.year)}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">č. {inv.invoiceNumber}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy">{fmt(total(inv))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {detailInvoices.length === 0 && (
                <p className="px-6 py-10 text-center text-slate-400 text-sm">Zatím žádné faktury.</p>
              )}
            </div>
            <p className="px-6 py-3 text-[11px] text-slate-400 border-t border-slate-100">
              Náhled faktury z Fakturoidu zatím v demu není dostupný — časem se sem propíše přes API.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
