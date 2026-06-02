'use client'

import { useState } from 'react'

interface PayslipRow {
  id: string
  name: string
  email: string
  employmentType: string
  grossAmount: number
  netAmount: number
  month: number
  year: number
  currency: string
}

interface InvoiceRow {
  id: string
  name: string
  email: string
  amount: number
  month: number
  year: number
  currency: string
  status: string
  invoiceNumber: string
}

interface OdmenyTabsProps {
  payslips: PayslipRow[]
  invoices: InvoiceRow[]
}

const MONTH_NAMES = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Vyplaceno',
  PENDING: 'Čeká',
  PROCESSING: 'Zpracovává se',
}

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
}

export function OdmenyTabs({ payslips, invoices }: OdmenyTabsProps) {
  const [tab, setTab] = useState<'hpp' | 'ico'>('hpp')

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1 mb-5">
        {([
          { id: 'hpp', label: 'Výplaty (HPP/DPP/DPČ)' },
          { id: 'ico', label: 'Fakturace (IČO)' },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t.id
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hpp' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Přehled výplat ({payslips.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Zaměstnanec</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Typ</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Období</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Hrubá</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Čistá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payslips.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{row.name}</p>
                      <p className="text-xs text-slate-400">{row.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        row.employmentType === 'HPP' ? 'bg-green-50 text-green-700' :
                        row.employmentType === 'DPP' ? 'bg-blue-50 text-blue-700' :
                        'bg-sky-50 text-sky-700'
                      }`}>
                        {row.employmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{MONTH_NAMES[row.month - 1]} {row.year}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.grossAmount, row.currency)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-navy">{formatCurrency(row.netAmount, row.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ico' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Přehled faktur ({invoices.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Dodavatel</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Číslo faktury</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Období</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Částka</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{row.name}</p>
                      <p className="text-xs text-slate-400">{row.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{row.invoiceNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{MONTH_NAMES[row.month - 1]} {row.year}</td>
                    <td className="px-6 py-4 text-right font-semibold text-navy">{formatCurrency(row.amount, row.currency)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[row.status] || 'bg-slate-50 text-slate-600'}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
