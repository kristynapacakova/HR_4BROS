import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_USER_ICO, DEMO_ICO_INVOICES } from '@/lib/mock-data'
import { InvoiceOverview } from './InvoiceOverview'

export default async function FakturyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  // Fakturační historie je v demu zatím reálně vyplněná jen pro jednoho OSVČ (DEMO_USER_ICO).
  const icoEmployees = DEMO_EMPLOYEES.filter((e) => e.employmentType === 'ICO').map((e) => ({
    id: e.email.toLowerCase() === DEMO_USER_ICO.email.toLowerCase() ? DEMO_USER_ICO.id : e.id,
    name: e.name,
    email: e.email,
  }))

  return (
    <AppShell
      title="Přehled faktur OSVČ"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <p className="text-sm text-slate-500">
          Faktura za nájem kancelářského místa a občerstvení chodí od OSVČ na firemní mail a časem se sem bude tahat
          automaticky z Fakturoidu (napárovaného na banku), včetně toho, jestli je zaplacená. Zatím je to mock — stav
          plateb nastavuje HR ručně přímo tady.
        </p>
        <InvoiceOverview employees={icoEmployees} invoices={DEMO_ICO_INVOICES} />
      </div>
    </AppShell>
  )
}
