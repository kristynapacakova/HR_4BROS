import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_TEAM, DEMO_TL, DEMO_USER_ICO, DEMO_ICO_INVOICES } from '@/lib/mock-data'
import { TeamFakturaceClient } from './TeamFakturaceClient'

export default async function TymFakturacePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'TL') redirect('/dashboard')

  const team = DEMO_TEAM.map((m) => ({
    id: m.id,
    email: m.email,
    name: m.name,
    employmentType: m.employmentType,
    teamLeadId: m.teamLeadId,
    // Fakturační historie je v demu zatím reálně vyplněná jen pro jednoho OSVČ.
    invoiceEmployeeId: m.email.toLowerCase() === DEMO_USER_ICO.email.toLowerCase() ? DEMO_USER_ICO.id : m.id,
  }))

  return (
    <AppShell
      title="Fakturace týmu"
      isAdmin={false}
      isTL={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <p className="text-sm text-slate-500">
          Přehled faktur OSVČ spolupracovníků, které ti HR přiřadilo do týmu. Faktura za nájem kancelářského místa
          a občerstvení se časem bude tahat automaticky z Fakturoidu — zatím stav plateb nastavuje HR ručně.
        </p>
        <TeamFakturaceClient team={team} teamLeadId={DEMO_TL.id} invoices={DEMO_ICO_INVOICES} />
      </div>
    </AppShell>
  )
}
