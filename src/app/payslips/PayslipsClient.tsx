'use client'

import { useState } from 'react'
import { Banknote, ChevronDown, TrendingUp, Clock, Download, Stethoscope } from 'lucide-react'
import { computeSickPay } from '@/app/profile/panels/SickPayCard'

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
        <p className="text-xs text-slate-400 mt-0.5">Hrubá: {fmt(p.grossAmount, p.currency)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${p.planned ? 'text-violet' : 'text-navy'}`}>
          {fmt(p.netAmount, p.currency)}
        </p>
        <p className="text-xs text-slate-400">čistá</p>
      </div>
      {!p.planned && (
        <button
          className="flex-shrink-0 p-2 text-slate-300 hover:text-violet rounded-full hover:bg-violet/5 transition-colors"
          title={`Stáhnout ${isICO ? 'fakturu' : 'výplatní pásku'} — ${MONTH_NAMES[p.month - 1]} ${p.year} (demo)`}
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function YearAccordion({ year, payslips, isICO, defaultOpen = false }: {
  year: number; payslips: Payslip[]; isICO: boolean; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const byMonth = new Map(payslips.map(p => [p.month, p]))
  // Celý rok leden–prosinec, i pro měsíce bez záznamu
  const allMonths = Array.from({ length: 12 }, (_, i) => 12 - i).map(m => byMonth.get(m) ?? null)
  const yearTotal = payslips.filter(p => !p.planned).reduce((sum, p) => sum + p.netAmount, 0)
  const recordedCount = payslips.length

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-navy">{year}</span>
          <span className="text-xs text-slate-400">{recordedCount} {recordedCount === 1 ? 'záznam' : recordedCount < 5 ? 'záznamy' : 'záznamů'}</span>
        </div>
        <div className="flex items-center gap-3">
          {yearTotal > 0 && <span className="text-sm font-semibold text-navy">{fmt(yearTotal, 'CZK')}</span>}
          <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="divide-y divide-slate-50 bg-slate-50/40">
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
      )}
    </div>
  )
}

export function PayslipsClient({
  payslips,
  salaryInfo,
  employmentType,
  pageTitle,
  sickDays = 0,
}: {
  payslips: Payslip[]
  salaryInfo: SalaryInfo
  employmentType: string
  pageTitle: string
  /** Dny nemoci v aktuálním měsíci — zobrazí rozpis srážky */
  sickDays?: number
}) {
  const [showSickDetail, setShowSickDetail] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const sorted = [...payslips].sort((a, b) => (b.year - a.year) || (b.month - a.month))
  const recent = sorted.slice(0, 5)
  const older = sorted.slice(5)

  const olderByYear = older.reduce<Record<number, Payslip[]>>((acc, p) => {
    (acc[p.year] ??= []).push(p)
    return acc
  }, {})
  const olderYears = Object.keys(olderByYear).map(Number).sort((a, b) => b - a)

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
              <div>
                <p className="text-white/50 text-xs mb-1">Hrubá mzda</p>
                <p className="text-xl font-headline font-semibold text-white/80">{fmt(latestReal.grossAmount, latestReal.currency)}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Čistá mzda</p>
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

      {/* Nemoc v tomto měsíci — rozpis srážky */}
      {!isICO && sickDays > 0 && (() => {
        const r = computeSickPay(salaryInfo.currentSalary, sickDays)
        return (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <button onClick={() => setShowSickDetail(s => !s)} className="w-full flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy">Nemoc tento měsíc — {sickDays} {sickDays === 1 ? 'den' : sickDays < 5 ? 'dny' : 'dní'}</p>
                <p className="text-xs text-slate-400">Očekávaná srážka ze mzdy: <span className="font-semibold text-red-500">−{fmt(r.deduction, 'CZK')}</span></p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${showSickDetail ? 'rotate-180' : ''}`} />
            </button>
            {showSickDetail && (
              <div className="mt-4 rounded-2xl bg-[#F7F8FE] p-4 space-y-1.5 text-sm">
                {[
                  ['Průměrný hodinový výdělek', `${fmt(r.avgHourly, 'CZK')}/h`],
                  ['Po redukci (90/60/30 %)', `${fmt(r.reduced, 'CZK')}/h`],
                  ['Náhrada mzdy (60 % redukovaného)', `${fmt(r.compensationHourly, 'CZK')}/h`],
                  ['Náhrada za den (8 h)', fmt(r.compensationDay, 'CZK')],
                  [`Hrazeno zaměstnavatelem (1.–14. den)`, `${r.employerDays} dní → ${fmt(r.compensationTotal, 'CZK')}`],
                  ...(r.csszDays > 0 ? [['Od 15. dne platí ČSSZ (nemocenské)', `${r.csszDays} dní`]] : []),
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-navy whitespace-nowrap">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Srážka oproti běžné mzdě</span>
                  <span className="font-bold text-red-500">−{fmt(r.deduction, 'CZK')}</span>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Recent payslips — always visible */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-headline font-semibold text-navy">
            {isICO ? 'Posledních 5 faktur' : 'Posledních 5 výplat'}
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {recent.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">Zatím nejsou k dispozici žádné záznamy.</div>
          ) : (
            recent.map(p => <PayslipRow key={p.id} p={p} isICO={isICO} />)
          )}
        </div>
      </div>

      {/* Older payslips — collapsible, grouped by year (full Jan–Dec) */}
      {older.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowHistory(s => !s)}
            className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-headline font-semibold text-navy">
              {showHistory ? 'Skrýt starší historii' : 'Zobrazit starší historii'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{olderYears.length} {olderYears.length === 1 ? 'rok' : olderYears.length < 5 ? 'roky' : 'let'}</span>
              <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {showHistory && (
            <div>
              {olderYears.map((y, i) => (
                <YearAccordion key={y} year={y} payslips={olderByYear[y]} isICO={isICO} defaultOpen={i === 0} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
