import { auth } from '@/lib/auth'
import { PageHero } from '@/components/layout/PageHero'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_USER_ICO, DEMO_ICO_INVOICES, DEMO_EXPENSE_REQUESTS, payslipsFor } from '@/lib/mock-data'
import { OdmenySection } from './OdmenySection'
import type { PayslipRow } from './OdmenyTabs'

export default async function OdmenyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  // Stejná data jako v Moje odměna — výplaty i faktury se počítají z údajů člověka (mock-data: payslipsFor)
  const payslipRows: PayslipRow[] = DEMO_EMPLOYEES.flatMap(emp =>
    payslipsFor(emp.id).map(p => ({
      id: p.id, personId: emp.id, name: emp.name, email: emp.email,
      employmentType: emp.employmentType,
      grossAmount: p.grossAmount, netAmount: p.netAmount,
      month: p.month, year: p.year, currency: p.currency, planned: p.planned,
    })),
  )

  const icoEmployees = DEMO_EMPLOYEES.filter(e => e.employmentType === 'ICO').map(e => ({
    id: e.email.toLowerCase() === DEMO_USER_ICO.email.toLowerCase() ? DEMO_USER_ICO.id : e.id,
    name: e.name, email: e.email,
  }))

  return (
    <AppShell title="Přehled odměn" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="w-full">
        <PageHero kicker="Administrace" title="Přehled odměn">Výplaty, faktury OSVČ a doklady k proplacení po lidech a měsících.</PageHero>
        <OdmenySection payslipRows={payslipRows} icoEmployees={icoEmployees} invoices={DEMO_ICO_INVOICES} expenseRequests={DEMO_EXPENSE_REQUESTS} />
      </div>
    </AppShell>
  )
}
