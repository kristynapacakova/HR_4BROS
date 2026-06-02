'use client'

import { useState } from 'react'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]

interface Payslip {
  id: string
  name: string
  month?: number
  year?: number
}

export function PayslipYearPicker({ payslipsByYear, years }: {
  payslipsByYear: Record<number, Payslip[]>
  years: number[]
}) {
  const [selectedYear, setSelectedYear] = useState(years[0])
  const idx = years.indexOf(selectedYear)
  const docs = payslipsByYear[selectedYear] ?? []

  return (
    <div>
      {/* Year selector */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
        <button
          onClick={() => idx < years.length - 1 && setSelectedYear(years[idx + 1])}
          disabled={idx >= years.length - 1}
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
                  ? 'bg-navy text-white'
                  : 'text-slate-500 hover:text-navy hover:bg-slate-50'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <button
          onClick={() => idx > 0 && setSelectedYear(years[idx - 1])}
          disabled={idx <= 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-navy" />
        </button>
      </div>

      {/* Months */}
      <div className="divide-y divide-slate-50">
        {docs.map(doc => (
          <div key={doc.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-14 text-center flex-shrink-0 bg-alice rounded-lg py-1.5">
              <p className="text-[10px] font-medium text-navy/50 uppercase tracking-wide">{doc.year}</p>
              <p className="text-sm font-headline font-bold text-navy leading-tight">{MONTH_NAMES[(doc.month ?? 1) - 1]}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy">{MONTH_NAMES[(doc.month ?? 1) - 1]} {doc.year}</p>
              <p className="text-xs text-slate-400">Výplatní páska</p>
            </div>
            <button className="flex-shrink-0 p-2 text-slate-300 hover:text-navy rounded-lg transition-colors" title="Stáhnout (demo)">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
