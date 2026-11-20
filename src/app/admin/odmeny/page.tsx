import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_PAYSLIPS, DEMO_USER_ICO, DEMO_ICO_INVOICES, DEMO_EXPENSE_REQUESTS } from '@/lib/mock-data'
import { OdmenySection } from './OdmenySection'

export default async function OdmenyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const hppEmployees = DEMO_EMPLOYEES.filter(e => e.employmentType && ['HPP', 'DPP', 'DPC'].includes(e.employmentType))
  const payslipRows = DEMO_PAYSLIPS.map(p => {
    const emp = hppEmployees[0]
    return {
      id: p.id, name: emp?.name || '—', email: emp?.email || '—',
      employmentType: emp?.employmentType || 'HPP',
      grossAmount: p.grossAmount, netAmount: p.netAmount,
      month: p.month, year: p.year, currency: p.currency,
    }
  })

  const icoEmployees = DEMO_EMPLOYEES.filter(e => e.employmentType === 'ICO').map(e => ({
    id: e.email.toLowerCase() === DEMO_USER_ICO.email.toLowerCase() ? DEMO_USER_ICO.id : e.id,
    name: e.name, email: e.email,
  }))

  return (
    <AppShell title="Přehled odměn" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-5xl mx-auto">
        <OdmenySection payslipRows={payslipRows} icoEmployees={icoEmployees} invoices={DEMO_ICO_INVOICES} expenseRequests={DEMO_EXPENSE_REQUESTS} />
      </div>
    </AppShell>
  )
}
