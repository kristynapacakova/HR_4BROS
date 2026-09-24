'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, CheckCircle2, XCircle, Clock, Link2 } from 'lucide-react'
import type { EduRequest } from '@/lib/mock-data'
import { PERSONA_EMAIL_BY_ID } from '@/lib/mock-data'
import {
  loadEduRequests, saveEduRequests,
  loadEduBudgetOverrides, saveEduBudgetOverrides,
  EDU_CHANGED_EVENT,
} from '@/lib/edu-budget-client'
import { pushNotification } from '@/lib/notifications-client'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

interface Employee {
  id: string
  name: string
  department: string | null
  budget: number
}

export function EduBudgetAdmin({
  employees, seedRequests, defaultBudget,
}: {
  employees: Employee[]
  seedRequests: EduRequest[]
  defaultBudget: number
}) {
  const [requests, setRequests] = useState<EduRequest[]>([])
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({})
  const [savedRow, setSavedRow] = useState<string | null>(null)

  const refresh = () => {
    setRequests(loadEduRequests(seedRequests))
    setOverrides(loadEduBudgetOverrides())
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
  }, [])

  const budgetFor = (empId: string) =>
    overrides[empId] ?? employees.find((e) => e.id === empId)?.budget ?? defaultBudget

  const drawnFor = (empId: string) =>
    requests.filter((r) => r.employeeId === empId && r.status === 'APPROVED').reduce((s, r) => s + r.amount, 0)

  const pending = requests.filter((r) => r.status === 'PENDING').sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))
  const processed = requests.filter((r) => r.status !== 'PENDING').sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  const setStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    saveEduRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)))
    const req = requests.find((r) => r.id === id)
    const email = req && PERSONA_EMAIL_BY_ID[req.employeeId]
    if (req && email) {
      pushNotification({
        recipientEmail: email,
        title: status === 'APPROVED' ? 'Vzdělávací budget schválen' : 'Vzdělávací budget zamítnut',
        body: `${req.title} — ${fmt(req.amount)}`,
        href: '/profile?tab=benefity',
      })
    }
  }

  const saveBudget = (empId: string) => {
    const raw = budgetInputs[empId]
    const value = Number(raw)
    if (!raw || isNaN(value) || value < 0) return
    saveEduBudgetOverrides({ ...overrides, [empId]: value })
    setSavedRow(empId)
    setTimeout(() => setSavedRow((r) => (r === empId ? null : r)), 1500)
  }

  return (
    <div className="space-y-6">

      {/* Rozpočty */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-alice rounded-full flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-navy" />
          </div>
          <h3 className="font-headline font-semibold text-navy">Roční rozpočty</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {employees.map((emp) => {
            const budget = budgetFor(emp.id)
            const drawn = drawnFor(emp.id)
            return (
              <div key={emp.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy">{emp.name}</p>
                  <p className="text-xs text-slate-400">
                    {emp.department} · vyčerpáno {fmt(drawn)} z {fmt(budget)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder={String(budget)}
                    value={budgetInputs[emp.id] ?? ''}
                    onChange={(e) => setBudgetInputs((s) => ({ ...s, [emp.id]: e.target.value }))}
                    className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                  />
                  <button
                    onClick={() => saveBudget(emp.id)}
                    className="px-3 py-1.5 bg-violet/10 hover:bg-violet/20 text-violet text-xs font-medium rounded-full transition-colors"
                  >
                    {savedRow === emp.id ? 'Uloženo ✓' : 'Uložit'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Čekající žádosti */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <h3 className="font-headline font-semibold text-navy">Čekající žádosti</h3>
          {pending.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">{pending.length}</span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Žádné čekající žádosti</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pending.map((r) => (
              <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy">{r.employeeName}</p>
                  <p className="text-sm text-slate-600">
                    {r.title} — {fmt(r.amount)}
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-violet hover:text-violet-dark ml-1.5 align-middle">
                        <Link2 className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(r.requestedAt).toLocaleDateString('cs-CZ')}</p>
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
            <h3 className="font-headline font-semibold text-navy">Vyřízené žádosti</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {processed.map((r) => (
              <div key={r.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-navy">{r.employeeName} — {r.title}</p>
                  <p className="text-xs text-slate-400">{new Date(r.requestedAt).toLocaleDateString('cs-CZ')}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-navy">{fmt(r.amount)}</span>
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
