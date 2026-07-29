'use client'

import { useState } from 'react'
import { Banknote, ChevronLeft, ChevronRight, TrendingUp, Clock } from 'lucide-react'

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

export function PayslipsClient({
  payslips,
  salaryInfo,
  employmentType,
  pageTitle,
}: {
  payslips: Payslip[]
  salaryInfo: SalaryInfo
  employmentType: string
  pageTitle: string
}) {
  const currentYear = new Date().getFullYear()
  const years = Array.from(new Set(payslips.map(p => p.year))).sort((a, b) => b - a)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const yearPayslips = payslips
    .filter(p => p.year === selectedYear)
    .sort((a, b) => b.month - a.month)

  const latestReal = payslips.find(p => !p.planned)
  const isICO = employmentType === 'ICO'
  const yearIdx = years.indexOf(selectedYear)

  const yearTotal = yearPayslips.filter(p => !p.planned).reduce((sum, p) => sum + p.netAmount, 0)
  const yearHasPlanned = yearPayslips.some(p => p.planned)

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

      {/* Year selector */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-headline font-semibold text-navy">
              {isICO ? 'Přehled faktur' : 'Přehled výplat'}
            </h3>
            {yearHasPlanned && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-violet/10 text-violet rounded text-xs font-medium">
                <Clock className="w-3 h-3" />
                Plánováno
              </span>
            )}
          </div>
          {/* Year navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => yearIdx < years.length - 1 && setSelectedYear(years[yearIdx + 1])}
              disabled={yearIdx >= years.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-navy" />
            </button>
            <div className="flex gap-1">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    y === selectedYear
                      ? 'bg-violet text-white'
                      : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={() => yearIdx > 0 && setSelectedYear(years[yearIdx - 1])}
              disabled={yearIdx <= 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-navy" />
            </button>
          </div>
        </div>

        {/* Annual summary row */}
        {yearTotal > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Celkem čistá za {selectedYear}</span>
            <span className="font-semibold text-navy">{fmt(yearTotal, 'CZK')}</span>
          </div>
        )}

        {/* Months list */}
        <div className="divide-y divide-slate-50">
          {yearPayslips.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              Pro rok {selectedYear} nejsou k dispozici žádné záznamy.
            </div>
          ) : (
            yearPayslips.map((p) => (
              <div key={p.id} className={`px-6 py-4 flex items-center gap-4 transition-colors ${p.planned ? 'bg-violet/[0.02] hover:bg-violet/[0.04]' : 'hover:bg-slate-50'}`}>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
