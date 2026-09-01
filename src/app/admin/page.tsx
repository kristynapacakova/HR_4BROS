import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { Users, CalendarDays, ArrowRight, TrendingUp, Clock, Banknote, BarChart2 } from 'lucide-react'
import { DEMO_EMPLOYEES, DEMO_ALL_LEAVE_REQUESTS, DEMO_HR_STATS } from '@/lib/mock-data'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

const CONTRACT_COLORS: Record<string, string> = {
  HPP: 'bg-violet',
  IČO: 'bg-amber-400',
  DPP: 'bg-violet',
  DPČ: 'bg-sky-400',
}

const SENIORITY_COLORS = ['bg-green-400', 'bg-violet', 'bg-violet/60', 'bg-slate-300']

const DEPT_COLORS = ['bg-violet', 'bg-green-400', 'bg-amber-400', 'bg-red-400', 'bg-violet/50', 'bg-violet/30']

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const pendingLeaves = DEMO_ALL_LEAVE_REQUESTS.filter((r) => r.status === 'PENDING').length
  const s = DEMO_HR_STATS

  return (
    <AppShell title="Admin panel" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-400 mb-2">Aktivních lidí</p>
            <p className="text-3xl font-headline font-bold text-navy">{s.activePeople}</p>
            <p className="text-xs text-slate-400 mt-1">{s.paidPeople} placených</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-400 mb-2">Měsíční náklady</p>
            <p className="text-2xl font-headline font-bold text-navy">{fmt(s.monthlyCost)}</p>
            <p className="text-xs text-slate-400 mt-1">{fmt(s.annualCost)} / rok</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-400 mb-2">Průměr na osobu</p>
            <p className="text-2xl font-headline font-bold text-navy">{fmt(s.avgCostPerPerson)}</p>
            <p className="text-xs text-slate-400 mt-1">z {s.paidPeople} placených</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-400 mb-2">Efektivita</p>
            <p className="text-3xl font-headline font-bold text-violet">{s.efficiency}%</p>
            <p className="text-xs text-slate-400 mt-1">{s.clientHoursPerMonth.toLocaleString('cs-CZ')} / {s.totalHoursPerMonth.toLocaleString('cs-CZ')} h</p>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Typ smlouvy */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Typ smlouvy</p>
            <div className="space-y-3">
              {s.contractTypes.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="w-10 text-sm text-slate-600 text-right flex-shrink-0">{c.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full flex items-center px-3 ${CONTRACT_COLORS[c.label] ?? 'bg-violet'}`}
                      style={{ width: `${Math.max(c.percent, 8)}%` }}
                    >
                      <span className="text-white text-xs font-semibold whitespace-nowrap">
                        {c.count} ({c.percent}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seniorita */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Seniorita</p>
            <div className="space-y-3">
              {s.seniority.map((sr, i) => (
                <div key={sr.label} className="flex items-center gap-3">
                  <span className="w-14 text-sm text-slate-600 text-right flex-shrink-0">{sr.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
                    {sr.percent > 0 ? (
                      <div
                        className={`h-full rounded-full flex items-center px-3 ${SENIORITY_COLORS[i] ?? 'bg-violet'}`}
                        style={{ width: `${sr.percent}%` }}
                      >
                        <span className="text-white text-xs font-semibold whitespace-nowrap">
                          {sr.count} ({sr.percent}%)
                        </span>
                      </div>
                    ) : (
                      <div className="h-full flex items-center px-3">
                        <span className="text-slate-400 text-xs">{sr.count} (0%)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Oddělení */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Oddělení</p>
            <div className="space-y-3">
              {s.departments.map((d, i) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-slate-600 text-right flex-shrink-0">{d.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full flex items-center px-3 ${DEPT_COLORS[i] ?? 'bg-violet'}`}
                      style={{ width: `${Math.max(d.percent, 6)}%` }}
                    >
                      <span className="text-white text-xs font-semibold whitespace-nowrap">
                        {d.count} ({d.percent}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kapacita */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Kapacita</p>
            <div className="space-y-3">
              {[
                { label: 'Celkové hodiny / měsíc', value: `${s.totalHoursPerMonth.toLocaleString('cs-CZ')} h`, highlight: false },
                { label: 'Klientské hodiny',        value: `${s.clientHoursPerMonth.toLocaleString('cs-CZ')} h`, highlight: false },
                { label: 'Efektivita (klientské / celkové)', value: `${s.efficiency}%`, highlight: true },
                { label: 'Náklad na klientskou hodinu',      value: fmt(s.costPerClientHour), highlight: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className={`text-sm font-semibold ${row.highlight ? 'text-violet' : 'text-navy'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/employees" className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-violet transition-all flex items-center gap-4">
            <div className="p-2.5 bg-alice rounded-full text-navy group-hover:bg-violet group-hover:text-white transition-colors flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy text-sm">Uživatelé</p>
              <p className="text-xs text-slate-400">{DEMO_EMPLOYEES.length} aktivních</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet transition-colors" />
          </Link>
          <Link href="/admin/leave-requests" className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-violet transition-all flex items-center gap-4">
            <div className="p-2.5 bg-alice rounded-full text-navy group-hover:bg-violet group-hover:text-white transition-colors flex-shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy text-sm">Žádosti o dovolenou</p>
              <p className="text-xs text-slate-400">{pendingLeaves} čekajících</p>
            </div>
            {pendingLeaves > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{pendingLeaves}</span>}
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet transition-colors" />
          </Link>
          <Link href="/admin/odmeny" className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-violet transition-all flex items-center gap-4">
            <div className="p-2.5 bg-alice rounded-full text-navy group-hover:bg-violet group-hover:text-white transition-colors flex-shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy text-sm">Přehled odměn</p>
              <p className="text-xs text-slate-400">Výplaty a faktury</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet transition-colors" />
          </Link>
          <Link href="/admin/analytics" className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-violet transition-all flex items-center gap-4">
            <div className="p-2.5 bg-alice rounded-full text-navy group-hover:bg-violet group-hover:text-white transition-colors flex-shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy text-sm">Analytika</p>
              <p className="text-xs text-slate-400">Headcount, fluktuace, výkon</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet transition-colors" />
          </Link>
        </div>

      </div>
    </AppShell>
  )
}
