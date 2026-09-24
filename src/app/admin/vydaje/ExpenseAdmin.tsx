'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, FileText, Pencil, Trash2 } from 'lucide-react'
import { EXPENSE_CATEGORIES, PERSONA_EMAIL_BY_ID, type ExpenseRequest } from '@/lib/mock-data'
import { loadExpenseRequests, saveExpenseRequests, EXPENSE_CHANGED_EVENT } from '@/lib/expense-client'
import { pushNotification } from '@/lib/notifications-client'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

const MONTH_NAMES_CZ = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec']
const CATEGORY_LABEL = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.value, c.label]))

function EditForm({ req, onSave, onCancel }: {
  req: ExpenseRequest
  onSave: (patch: Partial<ExpenseRequest>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(req.title)
  const [amount, setAmount] = useState(String(req.amount))
  const [sign, setSign] = useState<'PLUS' | 'MINUS'>(req.sign)
  const [category, setCategory] = useState(req.category)
  const [month, setMonth] = useState(req.month)
  const [year, setYear] = useState(req.year)

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Co to bylo</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Kategorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          >
            {EXPENSE_CATEGORIES.filter((c) => c.value !== 'SPORT').map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Částka (Kč)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Měsíc</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          >
            {MONTH_NAMES_CZ.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Rok</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Typ položky</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSign('PLUS')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
              sign === 'PLUS' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            + Proplatit
          </button>
          <button
            type="button"
            onClick={() => setSign('MINUS')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
              sign === 'MINUS' ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 text-slate-500'
            }`}
          >
            − Strhnout
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSave({ title: title.trim(), amount: Number(amount) || req.amount, sign, category, month, year })}
          className="px-4 py-2 bg-violet hover:bg-violet-dark text-white text-sm font-medium rounded-full transition-colors"
        >
          Uložit změny
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy transition-colors">
          Zrušit
        </button>
      </div>
    </div>
  )
}

export function ExpenseAdmin({ seedRequests }: { seedRequests: ExpenseRequest[] }) {
  const [requests, setRequests] = useState<ExpenseRequest[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

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
    const req = requests.find((r) => r.id === id)
    const email = req && PERSONA_EMAIL_BY_ID[req.employeeId]
    if (req && email) {
      pushNotification({
        recipientEmail: email,
        title: status === 'APPROVED' ? 'Doklad k proplacení schválen' : 'Doklad k proplacení zamítnut',
        body: `${req.title} — ${fmt(req.amount)}`,
        href: '/payslips',
      })
    }
  }

  const saveEdit = (id: string, patch: Partial<ExpenseRequest>) => {
    saveExpenseRequests(requests.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    setEditingId(null)
  }

  const deleteReq = (id: string) => {
    saveExpenseRequests(requests.filter((r) => r.id !== id))
    setEditingId(null)
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
              <div key={r.id} className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                    <button
                      onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                      className="p-1.5 text-slate-300 hover:text-violet rounded-full hover:bg-violet/5 transition-colors"
                      title="Upravit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReq(r.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="Smazat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {editingId === r.id && (
                  <EditForm req={r} onSave={(patch) => saveEdit(r.id, patch)} onCancel={() => setEditingId(null)} />
                )}
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
              <div key={r.id} className="px-6 py-3">
                <div className="flex items-center justify-between gap-3">
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
                    <button
                      onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                      className="p-1.5 text-slate-300 hover:text-violet rounded-full hover:bg-violet/5 transition-colors"
                      title="Upravit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReq(r.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="Smazat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {editingId === r.id && (
                  <EditForm req={r} onSave={(patch) => saveEdit(r.id, patch)} onCancel={() => setEditingId(null)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
