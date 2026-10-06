'use client'

import { useState } from 'react'
import { Stethoscope, ChevronDown, ExternalLink } from 'lucide-react'
import { computeSickPayGeneric } from '@/app/profile/panels/SickPayCard'

const YEAR = 2026

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

type Mode = 'monthly' | 'hourly'

/**
 * Samostatná kalkulačka náhrady při nemoci — nezávislá na přihlášeném účtu.
 * Kdokoliv si zadá vlastní úvazek, hodinovku nebo měsíční odměnu a dny nemoci.
 */
export function SickPayEstimator() {
  const [mode, setMode] = useState<Mode>('monthly')
  const [monthlyHours, setMonthlyHours] = useState(174)
  const [monthlySalary, setMonthlySalary] = useState(45000)
  const [hourlyRate, setHourlyRate] = useState(300)
  const [sickDays, setSickDays] = useState(3)
  const [open, setOpen] = useState(false)

  const hoursPerDay = monthlyHours > 0 ? monthlyHours / 21.75 : 8
  const avgHourly = mode === 'monthly'
    ? (monthlyHours > 0 ? monthlySalary / monthlyHours : 0)
    : hourlyRate

  const r = computeSickPayGeneric(avgHourly, hoursPerDay, sickDays)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-red-400" />
        </div>
        <h3 className="font-headline font-semibold text-navy">Kalkulačka náhrady při nemoci</h3>
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{YEAR}</span>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-slate-50 rounded-full p-1 w-fit mb-4">
        <button
          onClick={() => setMode('monthly')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            mode === 'monthly' ? 'bg-white text-violet shadow-sm' : 'text-slate-500'
          }`}
        >
          Měsíční odměna
        </button>
        <button
          onClick={() => setMode('hourly')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            mode === 'hourly' ? 'bg-white text-violet shadow-sm' : 'text-slate-500'
          }`}
        >
          Hodinová sazba
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Úvazek (h/měs)</label>
          <input
            type="number" min={1}
            value={monthlyHours}
            onChange={e => setMonthlyHours(Math.max(1, Number(e.target.value) || 0))}
            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet"
          />
        </div>
        {mode === 'monthly' ? (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Měsíční odměna (Kč)</label>
            <input
              type="number" min={0}
              value={monthlySalary}
              onChange={e => setMonthlySalary(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Hodinová sazba (Kč/h)</label>
            <input
              type="number" min={0}
              value={hourlyRate}
              onChange={e => setHourlyRate(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>
        )}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Dní nemoci</label>
          <input
            type="number" min={1} max={60}
            value={sickDays}
            onChange={e => setSickDays(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm text-navy text-center focus:outline-none focus:ring-2 focus:ring-violet"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Nemoc se neodečítá z dovolené — místo mzdy dostáváš náhradu. Orientační výpočet, hranice se mění každý rok.
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
            [`Náhrada za den (${hoursPerDay.toFixed(1)} h)`, fmt(r.compensationDay)],
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
