import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_HR_STATS } from '@/lib/mock-data'
import { EmployeesPanel } from './employees/EmployeesPanel'
import { AnalyticsPanel } from './analytics/AnalyticsPanel'
import { AssetsClient } from './assets/AssetsClient'
import { AdminTabs } from './AdminTabs'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const s = DEMO_HR_STATS

  return (
    <AppShell title="Admin panel" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-6xl mx-auto space-y-6">

        <AdminTabs
          panels={{
            uzivatele: <EmployeesPanel employees={DEMO_EMPLOYEES} />,
            analytika: <AnalyticsPanel />,
            majetek: <AssetsClient employees={DEMO_EMPLOYEES.map(e => ({ id: e.id, name: e.name, email: e.email }))} />,
          }}
          header={
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
                <p className="text-xs font-medium text-slate-400 mb-2">Aktivních lidí</p>
                <p className="text-3xl font-headline font-bold text-navy">{s.activePeople}</p>
                <p className="text-xs text-slate-400 mt-1">{s.paidPeople} placených</p>
              </div>
              <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
                <p className="text-xs font-medium text-slate-400 mb-2">Měsíční náklady</p>
                <p className="text-2xl font-headline font-bold text-navy">{fmt(s.monthlyCost)}</p>
                <p className="text-xs text-slate-400 mt-1">{fmt(s.annualCost)} / rok</p>
              </div>
              <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
                <p className="text-xs font-medium text-slate-400 mb-2">Průměr na osobu</p>
                <p className="text-2xl font-headline font-bold text-navy">{fmt(s.avgCostPerPerson)}</p>
                <p className="text-xs text-slate-400 mt-1">z {s.paidPeople} placených</p>
              </div>
              <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
                <p className="text-xs font-medium text-slate-400 mb-2">Efektivita</p>
                <p className="text-3xl font-headline font-bold text-violet">{s.efficiency}%</p>
                <p className="text-xs text-slate-400 mt-1">{s.clientHoursPerMonth.toLocaleString('cs-CZ')} / {s.totalHoursPerMonth.toLocaleString('cs-CZ')} h</p>
              </div>
            </div>
          }
        />

      </div>
    </AppShell>
  )
}
