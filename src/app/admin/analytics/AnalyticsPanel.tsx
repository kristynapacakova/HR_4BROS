import {
  DEMO_HEADCOUNT_TREND,
  DEMO_FLUCTUATION,
  DEMO_DEPARTMENT_HEADCOUNT,
  DEMO_EMPLOYEE_PERFORMANCE,
  DEMO_TURNOVER_RATE,
  DEMO_AVG_TENURE,
  DEMO_OPEN_POSITIONS,
  EMPLOYMENT_TYPES,
} from '@/lib/mock-data'
import { AnalyticsCharts } from './AnalyticsCharts'
import { TrendingUp, TrendingDown, Users, Clock } from 'lucide-react'

export function AnalyticsPanel() {
  const totalNastupy = DEMO_FLUCTUATION.reduce((s, m) => s + m.nastupy, 0)
  const totalOdchody = DEMO_FLUCTUATION.reduce((s, m) => s + m.odchody, 0)
  const currentHeadcount = DEMO_HEADCOUNT_TREND[DEMO_HEADCOUNT_TREND.length - 1].count

  return (
    <div className="space-y-6">

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-alice flex items-center justify-center">
              <Users className="w-4 h-4 text-navy" />
            </div>
            <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +50%
            </span>
          </div>
          <p className="text-2xl font-headline font-semibold text-navy">{currentHeadcount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Celkem zaměstnanců</p>
        </div>

        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs text-slate-400">2024</span>
          </div>
          <p className="text-2xl font-headline font-semibold text-navy">{DEMO_TURNOVER_RATE}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Míra fluktuace</p>
        </div>

        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-alice flex items-center justify-center">
              <Clock className="w-4 h-4 text-navy" />
            </div>
          </div>
          <p className="text-2xl font-headline font-semibold text-navy">{DEMO_AVG_TENURE}</p>
          <p className="text-xs text-slate-400 mt-0.5">Průměrná délka (měs.)</p>
        </div>

        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
          <p className="text-2xl font-headline font-semibold text-navy">{DEMO_OPEN_POSITIONS}</p>
          <p className="text-xs text-slate-400 mt-0.5">Otevřené pozice</p>
        </div>
      </div>

      {/* Charts row */}
      <AnalyticsCharts
        headcountTrend={DEMO_HEADCOUNT_TREND}
        fluctuation={DEMO_FLUCTUATION}
        departmentHeadcount={DEMO_DEPARTMENT_HEADCOUNT}
        nastupy={totalNastupy}
        odchody={totalOdchody}
      />

      {/* Tenure & employment type breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-6">
          <h3 className="font-headline font-semibold text-navy mb-4">Délka spolupráce</h3>
          <div className="space-y-3">
            {DEMO_EMPLOYEE_PERFORMANCE.sort((a, b) => b.tenure - a.tenure).map((emp) => (
              <div key={emp.id} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">{emp.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-navy truncate">{emp.name}</span>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{emp.tenure} měs.</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-navy h-1.5 rounded-full"
                      style={{ width: `${Math.min((emp.tenure / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-6">
          <h3 className="font-headline font-semibold text-navy mb-4">Typy spolupráce</h3>
          <div className="space-y-3">
            {EMPLOYMENT_TYPES.map((et) => {
              const count = DEMO_EMPLOYEE_PERFORMANCE.filter((e) => e.employmentType === et.value).length
              if (count === 0) return null
              const pct = Math.round((count / DEMO_EMPLOYEE_PERFORMANCE.length) * 100)
              return (
                <div key={et.value} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-navy w-12 flex-shrink-0">{et.value}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="bg-violet h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right flex-shrink-0">{count} os. ({pct}%)</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold text-navy">{totalNastupy}</p>
              <p className="text-xs text-slate-400">Nástupy 2024</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-navy">{totalOdchody}</p>
              <p className="text-xs text-slate-400">Odchody 2024</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
