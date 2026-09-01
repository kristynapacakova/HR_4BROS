import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_PAYSLIPS } from '@/lib/mock-data'
import { OdmenyTabs } from './OdmenyTabs'

// Mock IČO invoices data
const DEMO_ICO_INVOICES = [
  { id: 'inv1', employeeId: 'demo-employee-3', invoiceNumber: 'FV-2024-050', month: 5, year: 2024, amount: 95000, currency: 'CZK', status: 'PAID' },
  { id: 'inv2', employeeId: 'demo-employee-3', invoiceNumber: 'FV-2024-040', month: 4, year: 2024, amount: 95000, currency: 'CZK', status: 'PAID' },
  { id: 'inv3', employeeId: 'demo-employee-3', invoiceNumber: 'FV-2024-030', month: 3, year: 2024, amount: 90000, currency: 'CZK', status: 'PAID' },
  { id: 'inv4', employeeId: 'demo-employee-5-ico', invoiceNumber: 'FV-2024-051', month: 5, year: 2024, amount: 75000, currency: 'CZK', status: 'PENDING' },
  { id: 'inv5', employeeId: 'demo-employee-5-ico', invoiceNumber: 'FV-2024-041', month: 4, year: 2024, amount: 75000, currency: 'CZK', status: 'PAID' },
]

const ICO_CONTRACTOR_INFO: Record<string, { name: string; email: string }> = {
  'demo-employee-3': { name: 'Tomáš Dvořák', email: 'tomas.dvorak@fourbros.cz' },
  'demo-employee-5-ico': { name: 'Jakub Procházka', email: 'jakub.prochazka@fourbros.cz' },
}

export default async function OdmenyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  // Build payslip rows — join employee data
  const hppEmployees = DEMO_EMPLOYEES.filter(
    (e) => e.employmentType && ['HPP', 'DPP', 'DPC'].includes(e.employmentType)
  )

  const payslipRows = DEMO_PAYSLIPS.map((p) => {
    const emp = hppEmployees[0] // demo: all payslips belong to first HPP employee
    return {
      id: p.id,
      name: emp?.name || '—',
      email: emp?.email || '—',
      employmentType: emp?.employmentType || 'HPP',
      grossAmount: p.grossAmount,
      netAmount: p.netAmount,
      month: p.month,
      year: p.year,
      currency: p.currency,
    }
  })

  const invoiceRows = DEMO_ICO_INVOICES.map((inv) => {
    const info = ICO_CONTRACTOR_INFO[inv.employeeId] || { name: '—', email: '—' }
    return {
      id: inv.id,
      name: info.name,
      email: info.email,
      amount: inv.amount,
      month: inv.month,
      year: inv.year,
      currency: inv.currency,
      status: inv.status,
      invoiceNumber: inv.invoiceNumber,
    }
  })

  return (
    <AppShell
      title="Přehled odměn"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <p className="text-sm text-slate-500">Výplaty zaměstnanců (HPP/DPP/DPČ) a faktury externích spolupracovníků (IČO).</p>
        <OdmenyTabs payslips={payslipRows} invoices={invoiceRows} />
      </div>
    </AppShell>
  )
}
