import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
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
import { TrendingUp, TrendingDown, Users, Clock, Briefcase, Star } from 'lucide-react'

function ScoreBar({ value, max = 100, color = 'bg-violet' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{value}%</span>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-blue-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function scoreBg(score: number) {
  if (score >= 90) return 'bg-green-50 text-green-700'
  if (score >= 75) return 'bg-blue-50 text-blue-700'
  if (score >= 60) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const totalNastupy = DEMO_FLUCTUATION.reduce((s, m) => s + m.nastupy, 0)
  const totalOdchody = DEMO_FLUCTUATION.reduce((s, m) => s + m.odchody, 0)
  const currentHeadcount = DEMO_HEADCOUNT_TREND[DEMO_HEADCOUNT_TREND.length - 1].count
  const avgPerformance = Math.round(
    DEMO_EMPLOYEE_PERFORMANCE.reduce((s, e) => s + e.performanceScore, 0) / DEMO_EMPLOYEE_PERFORMANCE.length
  )

  return (
    <AppShell
      title="HR Analytika"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-alice rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-navy" />
              </div>
              <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +50%
              </span>
            </div>
            <p className="text-2xl font-headline font-semibold text-navy">{currentHeadcount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Celkem zaměstnanců</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-xs text-slate-400">2024</span>
            </div>
            <p className="text-2xl font-headline font-semibold text-navy">{DEMO_TURNOVER_RATE}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Míra fluktuace</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-alice rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-navy" />
              </div>
            </div>
            <p className="text-2xl font-headline font-semibold text-navy">{DEMO_AVG_TENURE}</p>
            <p className="text-xs text-slate-400 mt-0.5">Průměrná délka (měs.)</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-violet/10 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-violet" />
              </div>
            </div>
            <p className="text-2xl font-headline font-semibold text-navy">{avgPerformance}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Průměrná efektivita</p>
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

        {/* Employee performance table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Efektivita zaměstnanců</h3>
            <p className="text-xs text-slate-400 mt-0.5">Docházka, plnění úkolů, hodnocení</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Zaměstnanec</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Typ</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Docházka</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Úkoly</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Onboarding</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Skóre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {DEMO_EMPLOYEE_PERFORMANCE.sort((a, b) => b.performanceScore - a.performanceScore).map((emp) => {
                  const etLabel = EMPLOYMENT_TYPES.find((t) => t.value === emp.employmentType)?.value || emp.employmentType
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">{emp.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-navy">{emp.name}</p>
                            <p className="text-xs text-slate-400">{emp.position} · {emp.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          {etLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ScoreBar value={emp.attendanceRate} color="bg-green-400" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-blue-400 h-2 rounded-full"
                              style={{ width: `${(emp.tasksCompleted / emp.tasksTotal) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-12 text-right">{emp.tasksCompleted}/{emp.tasksTotal}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ScoreBar value={emp.onboardingProgress} color={emp.onboardingProgress === 100 ? 'bg-green-400' : 'bg-amber-400'} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${scoreBg(emp.performanceScore)}`}>
                          {emp.performanceScore}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenure & employment type breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-headline font-semibold text-navy mb-4">Délka spolupráce</h3>
            <div className="space-y-3">
              {DEMO_EMPLOYEE_PERFORMANCE.sort((a, b) => b.tenure - a.tenure).map((emp) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
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

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
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
            <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-navy">{totalNastupy}</p>
                <p className="text-xs text-slate-400">Nástupy 2024</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-navy">{totalOdchody}</p>
                <p className="text-xs text-slate-400">Odchody 2024</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-navy">{DEMO_OPEN_POSITIONS}</p>
                <p className="text-xs text-slate-400">Otevřené pozice</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
