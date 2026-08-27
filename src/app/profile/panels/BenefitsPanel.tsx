'use client'

import { useEffect, useRef, useState } from 'react'
import { Dumbbell, GraduationCap, CheckCircle2, Clock, XCircle, Plus, Link2, Upload, HeartPulse, ChevronDown } from 'lucide-react'
import {
  DEMO_EDU_BUDGETS, DEMO_EDU_REQUESTS, DEFAULT_EDU_BUDGET, type EduRequest,
  DEMO_BENEFIT_SELECTION, DEMO_SPORT_REQUESTS, SPORT_CONTRIBUTION_AMOUNT, MULTISPORT_MONTHLY_COST,
  type SportBenefitRequest,
} from '@/lib/mock-data'
import { loadEduRequests, saveEduRequests, loadEduBudgetOverrides, EDU_CHANGED_EVENT } from '@/lib/edu-budget-client'
import { loadBenefitSelections, loadSportRequests, saveSportRequests, BENEFIT_CHANGED_EVENT } from '@/lib/benefit-client'

const MONTH_NAMES_CZ = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec']

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

export function BenefitsPanel({ employeeId, employeeName, employmentType }: { employeeId: string; employeeName: string; employmentType?: string | null }) {
  const [allRequests, setAllRequests] = useState<EduRequest[]>([])
  const [budgetTotal, setBudgetTotal] = useState(DEFAULT_EDU_BUDGET)
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [url, setUrl] = useState('')

  const [benefitType, setBenefitType] = useState<'MULTISPORT' | 'SPORT_CONTRIBUTION' | null>(null)
  const [sportRequests, setSportRequests] = useState<SportBenefitRequest[]>([])
  const [sportHistoryOpen, setSportHistoryOpen] = useState(false)
  const [eduHistoryOpen, setEduHistoryOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isICO = employmentType === 'ICO'

  const refresh = () => {
    setAllRequests(loadEduRequests(DEMO_EDU_REQUESTS))
    const overrides = loadEduBudgetOverrides()
    setBudgetTotal(overrides[employeeId] ?? DEMO_EDU_BUDGETS[employeeId] ?? DEFAULT_EDU_BUDGET)
    const selections = loadBenefitSelections(DEMO_BENEFIT_SELECTION)
    setBenefitType(selections[employeeId] ?? null)
    setSportRequests(loadSportRequests(DEMO_SPORT_REQUESTS))
  }

  useEffect(() => {
    refresh()
    window.addEventListener(EDU_CHANGED_EVENT, refresh)
    window.addEventListener(BENEFIT_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(EDU_CHANGED_EVENT, refresh)
      window.removeEventListener(BENEFIT_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const mySportRequests = sportRequests
    .filter(r => r.employeeId === employeeId)
    .sort((a, b) => (b.year - a.year) || (b.month - a.month))

  const currentMonthRequest = mySportRequests.find(r => r.month === currentMonth && r.year === currentYear)

  const submitSportRequest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const newReq: SportBenefitRequest = {
      id: `sport-${Date.now()}`,
      employeeId,
      employeeName,
      month: currentMonth,
      year: currentYear,
      receiptName: file.name,
      status: 'PENDING',
      requestedAt: new Date().toISOString().slice(0, 10),
    }
    saveSportRequests([newReq, ...sportRequests])
    e.target.value = ''
  }

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

      {/* Sportovní benefit — Multisport karta, nebo příspěvek na sport */}
      {benefitType === null && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-navy">Sportovní benefit</h3>
              <p className="text-xs text-slate-400 mt-0.5">HR ti zatím nenastavilo Multisport kartu ani příspěvek na sport.</p>
            </div>
          </div>
        </div>
      )}

      {benefitType === 'MULTISPORT' && (
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
              Aktivní
            </span>
          </div>
          {isICO ? (
            <p className="text-xs text-slate-400 mt-4">
              Firma přispívá {fmt(SPORT_CONTRIBUTION_AMOUNT)} měsíčně, zbytek ({fmt(MULTISPORT_MONTHLY_COST - SPORT_CONTRIBUTION_AMOUNT)}) se ti odečte z odměny za daný měsíc — najdeš to v záložce <strong>Moje odměna</strong>.
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-4">
              Kartu ti vydá HR při nástupu. Cena karty se ti standardně strhává ze mzdy. Ztrátu nebo změnu nahlas na HR.
            </p>
          )}
        </div>
      )}

      {benefitType === 'SPORT_CONTRIBUTION' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-navy">Příspěvek na sport</h3>
              <p className="text-xs text-slate-400 mt-0.5">{fmt(SPORT_CONTRIBUTION_AMOUNT)} měsíčně po nahrání dokladu a schválení HR</p>
            </div>
          </div>

          <p className="text-sm text-navy mb-2">
            {MONTH_NAMES_CZ[currentMonth - 1]} {currentYear}
          </p>

          {currentMonthRequest ? (
            <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm text-navy truncate">{currentMonthRequest.receiptName}</p>
                <p className="text-xs text-slate-400">{new Date(currentMonthRequest.requestedAt).toLocaleDateString('cs-CZ')}</p>
              </div>
              <StatusBadge status={currentMonthRequest.status} />
            </div>
          ) : (
            <div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={submitSportRequest} />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:text-navy hover:border-slate-300 transition-colors w-full"
              >
                <Upload className="w-4 h-4 flex-shrink-0" />
                Nahrát doklad za tento měsíc
              </button>
            </div>
          )}

          {(() => {
            const history = mySportRequests.filter(r => r.id !== currentMonthRequest?.id)
            if (history.length === 0) return null
            return (
              <div className="mt-4 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSportHistoryOpen((o) => !o)}
                  className="w-full flex items-center justify-between py-2 text-xs font-medium text-slate-500 hover:text-navy transition-colors"
                >
                  <span>Historie ({history.length})</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sportHistoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {sportHistoryOpen && (
                  <div className="divide-y divide-slate-50">
                    {history.map(r => (
                      <div key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-navy truncate">{MONTH_NAMES_CZ[r.month - 1]} {r.year} — {r.receiptName}</p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          <p className="text-xs text-slate-400 mt-3">
            Po schválení HR se ti {fmt(SPORT_CONTRIBUTION_AMOUNT)} připočte k odměně za daný měsíc.
          </p>
        </div>
      )}

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

        {(() => {
          const recent = myRequests.filter(r => {
            const d = new Date(r.requestedAt)
            return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
          })
          const history = myRequests.filter(r => !recent.includes(r))

          const renderRow = (r: EduRequest) => (
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
          )

          return (
            <>
              {recent.length > 0 && (
                <div className="divide-y divide-slate-50 border-t border-slate-100">
                  {recent.map(renderRow)}
                </div>
              )}
              {history.length > 0 && (
                <div className={recent.length > 0 ? 'mt-1' : 'border-t border-slate-100'}>
                  <button
                    type="button"
                    onClick={() => setEduHistoryOpen((o) => !o)}
                    className="w-full flex items-center justify-between py-2 text-xs font-medium text-slate-500 hover:text-navy transition-colors"
                  >
                    <span>Historie ({history.length})</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${eduHistoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {eduHistoryOpen && (
                    <div className="divide-y divide-slate-50">
                      {history.map(renderRow)}
                    </div>
                  )}
                </div>
              )}
            </>
          )
        })()}

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
