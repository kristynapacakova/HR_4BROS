'use client'

import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'
import { INVOICE_STATUS_LABELS, type InvoicePaymentStatus } from '@/lib/mock-data'
import {
  loadInvoiceStatuses, saveInvoiceStatus, invoiceStatusKey, INVOICE_STATUS_CHANGED_EVENT,
} from '@/lib/invoice-status-client'

const MONTH_NAMES_CZ = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec']

export function InvoiceStatusAdmin({ employees, items }: {
  employees: { id: string; name: string }[]
  items: { label: string; amount: number }[]
}) {
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

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-violet" />
          <h3 className="font-headline font-semibold text-navy">Stav plateb — nájem a občerstvení (OSVČ)</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {MONTH_NAMES_CZ[month - 1]} {year} · {items.map((i) => i.label).join(', ')} · celkem {items.reduce((s, i) => s + i.amount, 0)} Kč měsíčně.
          Zatím se nastavuje ručně — časem se propíše z Fakturoidu a firemního mailu automaticky.
        </p>
      </div>
      <div className="divide-y divide-slate-50">
        {employees.map((emp) => {
          const key = invoiceStatusKey(emp.id, month, year)
          const status = statuses[key] ?? 'NEZAPLACENO'
          return (
            <div key={emp.id} className="px-6 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-navy">{emp.name}</p>
              <select
                value={status}
                onChange={(e) => saveInvoiceStatus(key, e.target.value as InvoicePaymentStatus)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              >
                {(Object.entries(INVOICE_STATUS_LABELS) as [InvoicePaymentStatus, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
