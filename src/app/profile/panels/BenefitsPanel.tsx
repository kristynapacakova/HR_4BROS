'use client'

import { useEffect, useState } from 'react'
import { Dumbbell, GraduationCap, CheckCircle2, Clock, XCircle, Plus, Link2 } from 'lucide-react'
import { DEMO_EDU_BUDGETS, DEMO_EDU_REQUESTS, DEFAULT_EDU_BUDGET, type EduRequest } from '@/lib/mock-data'
import { loadEduRequests, saveEduRequests, loadEduBudgetOverrides, EDU_CHANGED_EVENT } from '@/lib/edu-budget-client'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }: { status: EduRequest['status'] }) {
  if (status === 'APPROVED') return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
      <CheckCircle2 className="w-3 h-3" /> Schváleno
    </span>
  )
  if (status === 'REJECTED') return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
      <XCircle className="w-3 h-3" /> Zamítnuto
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
      <Clock className="w-3 h-3" /> Čeká na HR
    </span>
  )
}

export function BenefitsPanel({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const [allRequests, setAllRequests] = useState<EduRequest[]>([])
  const [budgetTotal, setBudgetTotal] = useState(DEFAULT_EDU_BUDGET)
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [url, setUrl] = useState('')

  const refresh = () => {
    setAllRequests(loadEduRequests(DEMO_EDU_REQUESTS))
    const overrides = loadEduBudgetOverrides()
    setBudgetTotal(overrides[employeeId] ?? DEMO_EDU_BUDGETS[employeeId] ?? DEFAULT_EDU_BUDGET)
  }

  useEffect(() => {
    refresh()
    window.addEventListener(EDU_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(EDU_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  const myRequests = allRequests
    .filter(r => r.employeeId === employeeId)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  const drawn = myRequests.filter(r => r.status === 'APPROVED').reduce((s, r) => s + r.amount, 0)
  const pending = myRequests.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0)
  const remaining = budgetTotal - drawn
  const pct = budgetTotal > 0 ? Math.min(100, Math.round((drawn / budgetTotal) * 100)) : 0

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!title.trim() || !amt || amt <= 0) return
    const newReq: EduRequest = {
      id: `edu-${Date.now()}`,
      employeeId,
      employeeName,
      title: title.trim(),
      amount: amt,
      url: url.trim() || null,
      status: 'PENDING',
      requestedAt: new Date().toISOString().slice(0, 10),
    }
    saveEduRequests([newReq, ...allRequests])
    setTitle('')
    setAmount('')
    setUrl('')
    setAddOpen(false)
  }

  return (
    <div className="space-y-5">

      {/* Multisportka */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-navy">Multisport karta</h3>
              <p className="text-xs text-slate-400 mt-0.5">Neomezený vstup do sportovišť po celé ČR</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aktivní od 1. 2. 2026
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Kartu ti vydá HR při nástupu. Ztrátu nebo změnu nahlas na HR — doprovodnou kartu pro partnera/ku lze dokoupit.
        </p>
      </div>

      {/* Vzdělávací budget */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-violet" />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-navy">Vzdělávací budget</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kurzy, knihy, konference — {fmt(budgetTotal)} na rok</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-headline font-bold text-violet">{fmt(remaining)}</p>
            <p className="text-[11px] text-slate-400">zbývá letos</p>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1.5">
          <div className="bg-violet h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-slate-400 mb-4">
          Vyčerpáno {fmt(drawn)} z {fmt(budgetTotal)} ({pct} %)
          {pending > 0 && <> · čeká na schválení {fmt(pending)}</>}
        </p>

        {myRequests.length > 0 && (
          <div className="divide-y divide-slate-50 border-t border-slate-100">
            {myRequests.map(r => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm text-navy truncate">
                      {r.title}
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-violet hover:text-violet-dark ml-1.5 align-middle">
                          <Link2 className="w-3 h-3" />
                        </a>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">{new Date(r.requestedAt).toLocaleDateString('cs-CZ')}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <span className="text-sm font-semibold text-navy flex-shrink-0">{fmt(r.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {!addOpen ? (
          <button
            onClick={() => setAddOpen(true)}
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-violet hover:text-violet-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Nová žádost o čerpání
          </button>
        ) : (
          <form onSubmit={submitRequest} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Co chceš čerpat</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="např. kurz, kniha, konference…"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Částka (Kč)</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Odkaz (volitelné)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" className="px-4 py-2 bg-violet hover:bg-violet-dark text-white text-sm font-medium rounded-full transition-colors">
                Odeslat ke schválení
              </button>
              <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy transition-colors">
                Zrušit
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-slate-400 mt-3">
          Žádost posoudí HR — po schválení se ti částka odečte z budgetu.
        </p>
      </div>

    </div>
  )
}
