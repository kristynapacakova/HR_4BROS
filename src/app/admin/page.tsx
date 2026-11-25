import { auth } from '@/lib/auth'
import { PageHero } from '@/components/layout/PageHero'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'
import { EmployeesPanel } from './employees/EmployeesPanel'
import { AnalyticsPanel } from './analytics/AnalyticsPanel'
import { AssetsClient } from './assets/AssetsClient'
import { AdminTabs } from './AdminTabs'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')


  return (
    <AppShell title="Admin panel" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="w-full space-y-6">
        <PageHero kicker="Administrace" title="Admin panel">Analytika týmu, lidé a zapůjčený majetek na jednom místě.</PageHero>

        <AdminTabs
          panels={{
            uzivatele: <EmployeesPanel employees={DEMO_EMPLOYEES} />,
            analytika: <AnalyticsPanel />,
            majetek: <AssetsClient employees={DEMO_EMPLOYEES.map(e => ({ id: e.id, name: e.name, email: e.email }))} />,
          }}
        />

      </div>
    </AppShell>
  )
}
