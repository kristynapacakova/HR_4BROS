import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EXPENSE_REQUESTS, DEMO_EMPLOYEES, ICO_MONTHLY_EXPENSES } from '@/lib/mock-data'
import { ExpenseAdmin } from './ExpenseAdmin'
import { InvoiceStatusAdmin } from './InvoiceStatusAdmin'

export default async function VydajePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const icoEmployees = DEMO_EMPLOYEES.filter((e) => e.employmentType === 'ICO').map((e) => ({ id: e.id, name: e.name }))

  return (
    <AppShell
      title="Doklady k proplacení"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-sm text-slate-500">
          Doklady, které lidé nahráli v záložce Moje odměna — příspěvky na sport, náklady ke klientům, cestovné apod.
          Po schválení se částka promítne do jejich odměny/faktury za daný měsíc.
        </p>
        <ExpenseAdmin seedRequests={DEMO_EXPENSE_REQUESTS} />

        {icoEmployees.length > 0 && (
          <InvoiceStatusAdmin employees={icoEmployees} items={ICO_MONTHLY_EXPENSES} />
        )}
      </div>
    </AppShell>
  )
}
