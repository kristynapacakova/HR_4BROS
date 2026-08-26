'use client'

import { useEffect, useState } from 'react'
import { Banknote, ChevronDown, TrendingUp, Clock, Download, Stethoscope, Dumbbell } from 'lucide-react'
import { computeSickPay } from '@/app/profile/panels/SickPayCard'
import { DEMO_BENEFIT_SELECTION, DEMO_SPORT_REQUESTS, SPORT_CONTRIBUTION_AMOUNT, MULTISPORT_MONTHLY_COST, ICO_MONTHLY_EXPENSES, type BenefitType } from '@/lib/mock-data'
import { loadBenefitSelections, loadSportRequests, BENEFIT_CHANGED_EVENT } from '@/lib/benefit-client'

const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

interface Payslip {
  id: string
  month: number
  year: number
  grossAmount: number
  netAmount: number
  currency: string
  fileUrl: string | null
  planned?: boolean
}

interface SalaryInfo {
  currentSalary: number
  currency: string
  nextRaiseDate: Date
  nextRaiseAmount: number
  lastRaiseDate: Date
}

function PayslipRow({ p, isICO }: { p: Payslip; isICO: boolean }) {
  return (
    <div className={`px-6 py-4 flex items-center gap-4 transition-colors ${p.planned ? 'bg-violet/[0.02] hover:bg-violet/[0.04]' : 'hover:bg-slate-50'}`}>
      <div className={`p-2.5 rounded-lg flex-shrink-0 ${p.planned ? 'bg-violet/10' : 'bg-alice'}`}>
        <Banknote className={`w-5 h-5 ${p.planned ? 'text-violet' : 'text-navy'}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-navy">{MONTH_NAMES[p.month - 1]} {p.year}</p>
          {p.planned && (
            <span className="px-1.5 py-0.5 bg-violet/10 text-violet rounded text-xs">plánováno</span>
          )}
        </div>
        {!isICO && <p className="text-xs text-slate-400 mt-0.5">Hrubá: {fmt(p.grossAmount, p.currency)}</p>}
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${p.planned ? 'text-violet' : 'text-navy'}`}>
          {fmt(p.netAmount, p.currency)}
        </p>
        <p className="text-xs text-slate-400">{isICO ? 'odměna' : 'čistá'}</p>
      </div>
      {!p.planned && !isICO && (
        <button
          className="flex-shrink-0 p-2 text-slate-300 hover:text-violet rounded-full hover:bg-violet/5 transition-colors"
          title={`Stáhnout výplatní pásku — ${MONTH_NAMES[p.month - 1]} ${p.year} (demo)`}
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function YearPanel({ year, payslips, isICO }: { year: number; payslips: Payslip[]; isICO: boolean }) {
  const byMonth = new Map(payslips.map(p => [p.month, p]))
  // Celý rok leden–prosinec, i pro měsíce bez záznamu
  const allMonths = Array.from({ length: 12 }, (_, i) => 12 - i).map(m => byMonth.get(m) ?? null)
  const yearTotal = payslips.filter(p => !p.planned).reduce((sum, p) => sum + p.netAmount, 0)

  return (
    <div>
      {yearTotal > 0 && (
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500">{isICO ? `Celkem odměna za ${year}` : `Celkem čistá za ${year}`}</span>
          <span className="font-semibold text-navy">{fmt(yearTotal, 'CZK')}</span>
        </div>
      )}
      <div className="divide-y divide-slate-50">
        {allMonths.map((p, i) => {
          const month = 12 - i
          if (!p) {
            return (
              <div key={month} className="px-6 py-3 flex items-center gap-4 opacity-40">
                <div className="p-2.5 rounded-lg bg-slate-100 flex-shrink-0">
                  <Banknote className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 flex-1">{MONTH_NAMES[month - 1]} {year} — bez záznamu</p>
              </div>
            )
          }
          return <PayslipRow key={p.id} p={p} isICO={isICO} />
        })}
      </div>
    </div>
  )
}

export function PayslipsClient({
  payslips,
  salaryInfo,
  employmentType,
  pageTitle,
  sickDays = 0,
  employeeId,
}: {
  payslips: Payslip[]
  salaryInfo: SalaryInfo
  employmentType: string
  pageTitle: string
  /** Dny nemoci v aktuálním měsíci — zobrazí rozpis srážky */
  sickDays?: number
  employeeId?: string
}) {
  const [showSickDetail, setShowSickDetail] = useState(false)
  const [benefitType, setBenefitType] = useState<BenefitType | null>(null)
  const [approvedThisMonth, setApprovedThisMonth] = useState(false)

  useEffect(() => {
    if (!employeeId) return
    const refresh = () => {
      const selections = loadBenefitSelections(DEMO_BENEFIT_SELECTION)
      setBenefitType(selections[employeeId] ?? null)
      const now = new Date()
      const requests = loadSportRequests(DEMO_SPORT_REQUESTS)
      setApprovedThisMonth(requests.some(r =>
        r.employeeId === employeeId && r.status === 'APPROVED' &&
        r.month === now.getMonth() + 1 && r.year === now.getFullYear()
      ))
    }
    refresh()
    window.addEventListener(BENEFIT_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(BENEFIT_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [employeeId])

  const sorted = [...payslips].sort((a, b) => (b.year - a.year) || (b.month - a.month))

  const byYear = sorted.reduce<Record<number, Payslip[]>>((acc, p) => {
    (acc[p.year] ??= []).push(p)
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)
  const currentCalendarYear = new Date().getFullYear()
  const defaultYear = years.includes(currentCalendarYear) ? currentCalendarYear : (years[0] ?? currentCalendarYear)
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear)

  const latestReal = payslips.find(p => !p.planned)
  const isICO = employmentType === 'ICO'

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Hero — current salary */}
      {latestReal && (
        <div className="relative bg-navy rounded-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-violet opacity-20" />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-[0.03]" />
          </div>
          <div className="relative z-10 px-7 py-6">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
              {isICO ? 'Poslední faktura' : 'Poslední výplata'} — {MONTH_NAMES[latestReal.month - 1]} {latestReal.year}
            </p>
            <div className="flex items-end gap-8 flex-wrap">
              {!isICO && (
                <div>
                  <p className="text-white/50 text-xs mb-1">Hrubá mzda</p>
                  <p className="text-xl font-headline font-semibold text-white/80">{fmt(latestReal.grossAmount, latestReal.currency)}</p>
                </div>
              )}
              <div>
                <p className="text-white/50 text-xs mb-1">{isICO ? 'Měsíční odměna' : 'Čistá mzda'}</p>
                <p className="text-3xl font-headline font-bold text-white">{fmt(latestReal.netAmount, latestReal.currency)}</p>
              </div>
            </div>

            {/* Next raise info */}
            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 w-fit">
              <TrendingUp className="w-4 h-4 text-violet-light flex-shrink-0" />
              <p className="text-sm text-white/80">
                Další navýšení:{' '}
                <span className="font-semibold text-white">+{fmt(salaryInfo.nextRaiseAmount, salaryInfo.currency)}</span>
                {' '}od{' '}
                <span className="font-semibold text-white">
                  {salaryInfo.nextRaiseDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rozpis odměny tento měsíc — základ, doplňkové položky, benefit, nemoc, k výplatě */}
      {latestReal && (isICO || benefitType || (!isICO && sickDays > 0)) && (() => {
        const sick = !isICO && sickDays > 0 ? computeSickPay(salaryInfo.currentSalary, sickDays) : null
        const benefitAmount =
          benefitType === 'SPORT_CONTRIBUTION' && approvedThisMonth ? SPORT_CONTRIBUTION_AMOUNT :
          benefitType === 'MULTISPORT' && isICO ? -(MULTISPORT_MONTHLY_COST - SPORT_CONTRIBUTION_AMOUNT) :
          0
        const icoExpensesTotal = isICO ? ICO_MONTHLY_EXPENSES.reduce((s, e) => s + e.amount, 0) : 0
        const adjustedNet = latestReal.netAmount + benefitAmount + icoExpensesTotal - (sick?.deduction ?? 0)

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-navy mb-3">Rozpis odměny — {MONTH_NAMES[latestReal.month - 1]} {latestReal.year}</p>
            <div className="space-y-2 text-sm">
              {isICO ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Měsíční paušál</span>
                    <span className="font-medium text-navy">{fmt(latestReal.netAmount, latestReal.currency)}</span>
                  </div>
                  {ICO_MONTHLY_EXPENSES.map((e) => (
                    <div key={e.label} className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">{e.label}</span>
                      <span className="font-medium text-green-600">+{fmt(e.amount, 'CZK')}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Hrubá mzda</span>
                  <span className="font-medium text-navy">{fmt(latestReal.grossAmount, latestReal.currency)}</span>
                </div>
              )}

              {benefitType === 'SPORT_CONTRIBUTION' && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    Příspěvek na sport {approvedThisMonth ? '' : '(čeká na schválení)'}
                  </span>
                  <span className={`font-medium ${approvedThisMonth ? 'text-green-600' : 'text-slate-400'}`}>
                    {approvedThisMonth ? `+${fmt(SPORT_CONTRIBUTION_AMOUNT, 'CZK')}` : '—'}
                  </span>
                </div>
              )}

              {benefitType === 'MULTISPORT' && isICO && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    Multisport — doplatek nad příspěvek firmy
                  </span>
                  <span className="font-medium text-red-500">
                    −{fmt(MULTISPORT_MONTHLY_COST - SPORT_CONTRIBUTION_AMOUNT, 'CZK')}
                  </span>
                </div>
              )}

              {sick && (
                <div>
                  <button onClick={() => setShowSickDetail(s => !s)} className="w-full flex items-center justify-between gap-4 text-left">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      Nemoc — {sickDays} {sickDays === 1 ? 'den' : sickDays < 5 ? 'dny' : 'dní'}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showSickDetail ? 'rotate-180' : ''}`} />
                    </span>
                    <span className="font-medium text-red-500">−{fmt(sick.deduction, 'CZK')}</span>
                  </button>
                  {showSickDetail && (
                    <div className="mt-3 rounded-2xl bg-[#F7F8FE] p-4 space-y-1.5">
                      {[
                        ['Průměrný hodinový výdělek', `${fmt(sick.avgHourly, 'CZK')}/h`],
                        ['Po redukci (90/60/30 %)', `${fmt(sick.reduced, 'CZK')}/h`],
                        ['Náhrada mzdy (60 % redukovaného)', `${fmt(sick.compensationHourly, 'CZK')}/h`],
                        ['Náhrada za den (8 h)', fmt(sick.compensationDay, 'CZK')],
                        [`Hrazeno zaměstnavatelem (1.–14. den)`, `${sick.employerDays} dní → ${fmt(sick.compensationTotal, 'CZK')}`],
                        ...(sick.csszDays > 0 ? [['Od 15. dne platí ČSSZ (nemocenské)', `${sick.csszDays} dní`]] : []),
                      ].map(([label, value]) => (
                        <div key={label as string} className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-navy whitespace-nowrap">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-slate-200">
                <span className="text-navy font-semibold">{isICO ? 'Odměna k fakturaci' : 'Čistá k výplatě'}</span>
                <span className="font-bold text-navy">{fmt(adjustedNet, latestReal.currency)}</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Přehled výplat — klikatelné roky nahoře, výchozí je aktuální rok */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-headline font-semibold text-navy mb-3">
            {isICO ? 'Přehled faktur' : 'Přehled výplat'}
          </h3>
          <div className="flex flex-wrap gap-1">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  y === selectedYear ? 'bg-violet text-white' : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {byYear[selectedYear] ? (
          <YearPanel year={selectedYear} payslips={byYear[selectedYear]} isICO={isICO} />
        ) : (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">Zatím nejsou k dispozici žádné záznamy.</div>
        )}
      </div>
    </div>
  )
}
