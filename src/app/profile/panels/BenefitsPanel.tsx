'use client'

import { useEffect, useRef, useState } from 'react'
import { Dumbbell, CheckCircle2, Clock, XCircle, Upload, HeartPulse, ChevronDown } from 'lucide-react'
import {
  DEMO_BENEFIT_SELECTION, DEMO_SPORT_REQUESTS, SPORT_CONTRIBUTION_AMOUNT, MULTISPORT_MONTHLY_COST,
  type SportBenefitRequest,
} from '@/lib/mock-data'
import { loadBenefitSelections, loadSportRequests, saveSportRequests, BENEFIT_CHANGED_EVENT } from '@/lib/benefit-client'

const MONTH_NAMES_CZ = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec']

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
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
  const [benefitType, setBenefitType] = useState<'MULTISPORT' | 'SPORT_CONTRIBUTION' | null>(null)
  const [sportRequests, setSportRequests] = useState<SportBenefitRequest[]>([])
  const [sportHistoryOpen, setSportHistoryOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isICO = employmentType === 'ICO'

  const refresh = () => {
    const selections = loadBenefitSelections(DEMO_BENEFIT_SELECTION)
    setBenefitType(selections[employeeId] ?? null)
    setSportRequests(loadSportRequests(DEMO_SPORT_REQUESTS))
  }

  useEffect(() => {
    refresh()
    window.addEventListener(BENEFIT_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
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

    </div>
  )
}
