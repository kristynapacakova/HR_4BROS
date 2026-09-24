'use client'

import { useState } from 'react'
import { Stethoscope, ChevronDown, ExternalLink } from 'lucide-react'

/**
 * Redukční hranice pro náhradu mzdy (hodinové) — MĚNÍ SE KAŽDÝ ROK.
 * Aktuální hodnoty a popis výpočtu: https://www.vypocet.cz/popis-vypoctu-nemocenske
 */
const YEAR = 2026
const REDUCTION_BANDS = [
  { limit: 294.85, rate: 0.9 },   // do 1. redukční hranice → 90 %
  { limit: 442.05, rate: 0.6 },   // do 2. redukční hranice → 60 %
  { limit: 884.05, rate: 0.3 },   // do 3. redukční hranice → 30 %
]
const COMPENSATION_RATE = 0.6      // náhrada mzdy = 60 % redukovaného průměru
const HOURS_PER_DAY = 8

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

/**
 * Obecný výpočet náhrady při nemoci — zadá se průměrný hodinový výdělek,
 * počet hodin běžného pracovního dne a počet dní nemoci.
 */
export function computeSickPayGeneric(avgHourly: number, hoursPerDay: number, sickDays: number) {
  // redukce průměrného hodinového výdělku
  let reduced = 0
  let prev = 0
  for (const band of REDUCTION_BANDS) {
    if (avgHourly > prev) {
      reduced += (Math.min(avgHourly, band.limit) - prev) * band.rate
      prev = band.limit
    }
  }
  const compensationHourly = reduced * COMPENSATION_RATE
  const compensationDay = compensationHourly * hoursPerDay
  const normalDay = avgHourly * hoursPerDay
  const employerDays = Math.min(sickDays, 14)   // prvních 14 dní platí zaměstnavatel
  const csszDays = Math.max(sickDays - 14, 0)   // od 15. dne platí ČSSZ nemocenské
  const compensationTotal = compensationDay * employerDays
  const normalTotal = normalDay * employerDays
  const deduction = normalTotal - compensationTotal
  return { avgHourly, reduced, compensationHourly, compensationDay, normalDay, employerDays, csszDays, compensationTotal, deduction }
}

export function computeSickPay(monthlySalary: number, sickDays: number) {
  const avgHourly = (monthlySalary * 12) / 2088
  return computeSickPayGeneric(avgHourly, HOURS_PER_DAY, sickDays)
}

export function SickPayCard({ monthlySalary, initialDays = 0 }: { monthlySalary: number; initialDays?: number }) {
  const [days, setDays] = useState(initialDays || 3)
  const [open, setOpen] = useState(false)
  const r = computeSickPay(monthlySalary, days)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="font-headline font-semibold text-navy">Náhrada při nemoci</h3>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{YEAR}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-xs text-slate-400">Dní nemoci:</label>
          <input
            type="number" min={1} max={60}
            value={days}
            onChange={e => setDays(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-navy text-center focus:outline-none focus:ring-2 focus:ring-violet"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Nemoc se neodečítá z dovolené — místo mzdy dostáváš náhradu. Orientační výpočet z aktuálního platu.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-400">Náhrada za den</p>
          <p className="text-lg font-headline font-bold text-navy">{fmt(r.compensationDay)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Běžná mzda za den</p>
          <p className="text-lg font-headline font-bold text-slate-400">{fmt(r.normalDay)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Srážka ze mzdy ({r.employerDays} dní)</p>
          <p className="text-lg font-headline font-bold text-red-500">−{fmt(r.deduction)}</p>
        </div>
      </div>

      <button
        onClick={() => setOpen(o => !o)}
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-violet hover:text-violet-dark transition-colors"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {open ? 'Skrýt rozpis výpočtu' : 'Zobrazit rozpis výpočtu'}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl bg-[#F7F8FE] p-4 space-y-1.5 text-sm">
          {[
            ['Průměrný hodinový výdělek', fmt(r.avgHourly) + '/h'],
            [`Po redukci (90/60/30 % dle hranic ${YEAR})`, fmt(r.reduced) + '/h'],
            ['Náhrada mzdy (60 % redukovaného)', fmt(r.compensationHourly) + '/h'],
            [`Náhrada za den (${HOURS_PER_DAY} h)`, fmt(r.compensationDay)],
            [`Dny hrazené zaměstnavatelem (1.–14. den)`, `${r.employerDays} dní → ${fmt(r.compensationTotal)}`],
            ...(r.csszDays > 0 ? [[`Od 15. dne platí ČSSZ (nemocenské)`, `${r.csszDays} dní`]] : []),
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between gap-4">
              <span className="text-slate-500">{label}</span>
              <span className="font-semibold text-navy whitespace-nowrap">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Celková srážka oproti běžné mzdě</span>
            <span className="font-bold text-red-500">−{fmt(r.deduction)}</span>
          </div>
          <a
            href="https://www.vypocet.cz/popis-vypoctu-nemocenske"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet pt-1 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Popis výpočtu nemocenské (vypocet.cz) — hranice se mění každý rok
          </a>
        </div>
      )}
    </div>
  )
}
