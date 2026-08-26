'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react'
import { EXPENSE_CATEGORIES, type ExpenseRequest } from '@/lib/mock-data'
import { loadExpenseRequests, saveExpenseRequests, EXPENSE_CHANGED_EVENT } from '@/lib/expense-client'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

const MONTH_NAMES_CZ = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec']
const CATEGORY_LABEL = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.value, c.label]))

export function ExpenseAdmin({ seedRequests }: { seedRequests: ExpenseRequest[] }) {
  const [requests, setRequests] = useState<ExpenseRequest[]>([])

  useEffect(() => {
    const refresh = () => setRequests(loadExpenseRequests(seedRequests))
    refresh()
    window.addEventListener(EXPENSE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(EXPENSE_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pending = requests.filter((r) => r.status === 'PENDING').sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))
  const processed = requests.filter((r) => r.status !== 'PENDING').sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  const setStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    saveExpenseRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  return (
    <div className="space-y-6">
      {/* Čekající */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <h3 className="font-headline font-semibold text-navy">Čekající doklady</h3>
          {pending.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">{pending.length}</span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Žádné čekající doklady</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pending.map((r) => (
              <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy">{r.employeeName}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {r.title} — <span className={r.sign === 'MINUS' ? 'text-red-500 font-medium' : 'font-medium'}>{r.sign === 'MINUS' ? '−' : '+'}{fmt(r.amount)}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {CATEGORY_LABEL[r.category] ?? r.category} · {r.receiptName} · {MONTH_NAMES_CZ[r.month - 1]} {r.year}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setStatus(r.id, 'APPROVED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-full transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Schválit
                  </button>
                  <button
                    onClick={() => setStatus(r.id, 'REJECTED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-full transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Zamítnout
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historie */}
      {processed.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Vyřízené doklady</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {processed.map((r) => (
              <div key={r.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-navy">{r.employeeName} — {r.title}</p>
                  <p className="text-xs text-slate-400">{MONTH_NAMES_CZ[r.month - 1]} {r.year} · {r.receiptName}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-semibold ${r.sign === 'MINUS' ? 'text-red-500' : 'text-navy'}`}>
                    {r.sign === 'MINUS' ? '−' : '+'}{fmt(r.amount)}
                  </span>
                  {r.status === 'APPROVED' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Schváleno
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Zamítnuto
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
