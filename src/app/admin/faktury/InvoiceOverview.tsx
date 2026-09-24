'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, FileText, Plus, Check, XCircle } from 'lucide-react'
import type { IcoInvoiceRecord, InvoicePaymentStatus, TeamAdjustmentRequest } from '@/lib/mock-data'
import { INVOICE_STATUS_LABELS, DEMO_TEAM_ADJUSTMENTS, DEMO_ADMIN } from '@/lib/mock-data'
import { loadInvoiceStatuses, saveInvoiceStatus, invoiceStatusKey, INVOICE_STATUS_CHANGED_EVENT } from '@/lib/invoice-status-client'
import { loadTeamAdjustments, saveTeamAdjustments, TEAM_ADJUSTMENT_CHANGED_EVENT } from '@/lib/team-adjustment-client'
import { pushNotification } from '@/lib/notifications-client'

const MONTH_NAMES_CZ = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec']

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n) + ' Kč'
}

function invoiceTotal(inv: IcoInvoiceRecord | null) {
  return inv ? inv.salaryAmount + inv.officeAmount + inv.refreshAmount + inv.otherAmount : 0
}

function adjAmount(a: TeamAdjustmentRequest) {
  return a.sign === 'MINUS' ? -a.amount : a.amount
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

interface AdjustFormState {
  employeeId: string
  employeeName: string
  title: string
  amount: string
  sign: 'PLUS' | 'MINUS'
  month: number
  year: number
}

export function InvoiceOverview({ employees, invoices, canPropose, proposerId, proposerName, proposerEmail, isHrReviewer }: {
  employees: { id: string; name: string; email?: string }[]
  invoices: IcoInvoiceRecord[]
  /** TL pohled — může navrhnout úpravu odměny, čeká na schválení HR. */
  canPropose?: boolean
  proposerId?: string
  proposerName?: string
  proposerEmail?: string
  /** HR pohled — vidí a schvaluje/zamítá návrhy úprav od team leadů. */
  isHrReviewer?: boolean
}) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [detailId, setDetailId] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, InvoicePaymentStatus>>({})
  const [adjustments, setAdjustments] = useState<TeamAdjustmentRequest[]>([])
  const [adjustForm, setAdjustForm] = useState<AdjustFormState | null>(null)

  useEffect(() => {
    const refresh = () => {
      setStatuses(loadInvoiceStatuses())
      setAdjustments(loadTeamAdjustments(DEMO_TEAM_ADJUSTMENTS))
    }
    refresh()
    window.addEventListener(INVOICE_STATUS_CHANGED_EVENT, refresh)
    window.addEventListener(TEAM_ADJUSTMENT_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(INVOICE_STATUS_CHANGED_EVENT, refresh)
      window.removeEventListener(TEAM_ADJUSTMENT_CHANGED_EVENT, refresh)
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
    const email = employees.find((e) => e.id === employeeId)?.email
    if (next === 'ZAPLACENO' && email) {
      pushNotification({
        recipientEmail: email,
        title: 'Faktura zaplacena',
        body: `Faktura za ${MONTH_NAMES_CZ[m - 1]} ${y} byla označena jako zaplacená.`,
        href: '/payslips',
      })
    }
  }

  const adjustmentsFor = (employeeId: string, m: number, y: number) =>
    adjustments.filter((a) => a.employeeId === employeeId && a.month === m && a.year === y)

  const approvedTotalFor = (employeeId: string, m: number, y: number) =>
    adjustmentsFor(employeeId, m, y).filter((a) => a.status === 'APPROVED').reduce((s, a) => s + adjAmount(a), 0)

  const openAdjustForm = (employeeId: string, employeeName: string, m: number, y: number) => {
    setAdjustForm({ employeeId, employeeName, title: '', amount: '', sign: 'PLUS', month: m, year: y })
  }

  const submitAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustForm || !proposerId || !proposerName || !proposerEmail) return
    const amt = Number(adjustForm.amount)
    if (!adjustForm.title.trim() || !amt || amt <= 0) return
    const newReq: TeamAdjustmentRequest = {
      id: `adj-${Date.now()}`,
      teamLeadId: proposerId,
      teamLeadName: proposerName,
      teamLeadEmail: proposerEmail,
      employeeId: adjustForm.employeeId,
      employeeName: adjustForm.employeeName,
      title: adjustForm.title.trim(),
      amount: amt,
      sign: adjustForm.sign,
      month: adjustForm.month,
      year: adjustForm.year,
      status: 'PENDING',
      requestedAt: new Date().toISOString().slice(0, 10),
    }
    saveTeamAdjustments([newReq, ...adjustments])
    pushNotification({
      recipientEmail: DEMO_ADMIN.email,
      title: 'Návrh úpravy odměny čeká na schválení',
      body: `${proposerName} navrhl(a) ${adjustForm.sign === 'PLUS' ? '+' : '−'}${fmt(amt)} pro ${adjustForm.employeeName} — ${adjustForm.title.trim()}`,
      href: '/admin/faktury',
    })
    setAdjustForm(null)
  }

  const decideAdjustment = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const req = adjustments.find((a) => a.id === id)
    saveTeamAdjustments(adjustments.map((a) => (a.id === id ? { ...a, status } : a)))
    if (req) {
      pushNotification({
        recipientEmail: req.teamLeadEmail,
        title: status === 'APPROVED' ? 'Návrh úpravy odměny schválen' : 'Návrh úpravy odměny zamítnut',
        body: `${req.employeeName} — ${req.title} (${req.sign === 'PLUS' ? '+' : '−'}${fmt(req.amount)})`,
        href: '/admin/tym-fakturace',
      })
    }
  }

  const pendingForHr = adjustments.filter((a) => a.status === 'PENDING')

  const rows = employees.map((emp) => ({
    emp,
    invoice: invoices.find((i) => i.employeeId === emp.id && i.month === month && i.year === year) ?? null,
  }))

  const detailEmp = employees.find((e) => e.id === detailId)
  const detailInvoices = detailId
    ? invoices.filter((i) => i.employeeId === detailId).sort((a, b) => (b.year - a.year) || (b.month - a.month))
    : []

  return (
    <div className="space-y-6">

      {/* HR — čekající návrhy úprav od team leadů */}
      {isHrReviewer && pendingForHr.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <h3 className="font-headline font-semibold text-navy">Návrhy úprav odměny od team leadů</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">{pendingForHr.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingForHr.map((a) => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-navy">{a.employeeName} — {a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Navrhl(a) {a.teamLeadName} · {MONTH_NAMES_CZ[a.month - 1]} {a.year} ·{' '}
                    <span className={a.sign === 'MINUS' ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                      {a.sign === 'PLUS' ? '+' : '−'}{fmt(a.amount)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => decideAdjustment(a.id, 'APPROVED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Schválit
                  </button>
                  <button
                    onClick={() => decideAdjustment(a.id, 'REJECTED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Zamítnout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <th className="px-4 py-3 font-medium">Úpravy</th>
                <th className="px-4 py-3 font-medium">Celkem</th>
                <th className="px-4 py-3 font-medium">Stav</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map(({ emp, invoice }) => {
                const rowAdjustments = adjustmentsFor(emp.id, month, year)
                const approvedAdj = approvedTotalFor(emp.id, month, year)
                const pendingAdj = rowAdjustments.filter((a) => a.status === 'PENDING')
                const grandTotal = invoiceTotal(invoice) + approvedAdj
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-navy">{emp.name}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice ? fmt(invoice.salaryAmount) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice ? fmt(invoice.officeAmount) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice ? fmt(invoice.refreshAmount) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {invoice?.otherLabel ? `${invoice.otherLabel} ${fmt(invoice.otherAmount)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        {approvedAdj !== 0 ? (
                          <span className={approvedAdj > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                            {approvedAdj > 0 ? '+' : '−'}{fmt(Math.abs(approvedAdj))}
                          </span>
                        ) : (canPropose || pendingAdj.length > 0) ? '—' : null}
                        {pendingAdj.length > 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full flex-shrink-0" title="Čeká na schválení HR">
                            {pendingAdj.length}× čeká
                          </span>
                        )}
                        {canPropose && (
                          <button
                            onClick={() => openAdjustForm(emp.id, emp.name, month, year)}
                            title="Navrhnout úpravu odměny"
                            className="p-1 text-slate-300 hover:text-violet rounded-full hover:bg-violet/10 transition-colors flex-shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">{invoice || approvedAdj !== 0 ? fmt(grandTotal) : '—'}</td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulář — navrhnout úpravu odměny */}
      {adjustForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAdjustForm(null)}>
          <form
            onSubmit={submitAdjustment}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline font-semibold text-navy">Navrhnout úpravu — {adjustForm.employeeName}</h3>
              <button type="button" onClick={() => setAdjustForm(null)} className="p-1 text-slate-400 hover:text-navy rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">{MONTH_NAMES_CZ[adjustForm.month - 1]} {adjustForm.year} · musí schválit HR</p>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Popis (např. prémie za projekt)</label>
              <input
                type="text"
                required
                value={adjustForm.title}
                onChange={(e) => setAdjustForm({ ...adjustForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Částka (Kč)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Typ</label>
                <select
                  value={adjustForm.sign}
                  onChange={(e) => setAdjustForm({ ...adjustForm, sign: e.target.value as 'PLUS' | 'MINUS' })}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                >
                  <option value="PLUS">Přičíst (+)</option>
                  <option value="MINUS">Odečíst (−)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full px-4 py-2.5 bg-violet hover:bg-violet-dark text-white text-sm font-medium rounded-full transition-colors">
              Odeslat ke schválení HR
            </button>
          </form>
        </div>
      )}

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
                      <td className="px-4 py-3 font-semibold text-navy">{fmt(invoiceTotal(inv) + approvedTotalFor(inv.employeeId, inv.month, inv.year))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {detailInvoices.length === 0 && (
                <p className="px-6 py-10 text-center text-slate-400 text-sm">Zatím žádné faktury.</p>
              )}
            </div>

            {adjustmentsFor(detailEmp.id, month, year).length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Úpravy — {MONTH_NAMES_CZ[month - 1]} {year}</p>
                <div className="space-y-1.5">
                  {adjustmentsFor(detailEmp.id, month, year).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{a.title} <span className="text-slate-400">— {a.teamLeadName}</span></span>
                      <span className="flex items-center gap-2 flex-shrink-0">
                        <span className={a.sign === 'MINUS' ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                          {a.sign === 'PLUS' ? '+' : '−'}{fmt(a.amount)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          a.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                          a.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {a.status === 'APPROVED' ? 'Schváleno' : a.status === 'REJECTED' ? 'Zamítnuto' : 'Čeká na HR'}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="px-6 py-3 text-[11px] text-slate-400 border-t border-slate-100">
              Náhled faktury z Fakturoidu zatím v demu není dostupný — časem se sem propíše přes API.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
