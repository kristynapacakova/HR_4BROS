import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_TL, DEMO_BENEFIT_SELECTION, DEMO_SPORT_REQUESTS } from '@/lib/mock-data'
import { BenefitAdmin } from './BenefitAdmin'

export default async function BenefityPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const employees = [
    ...DEMO_EMPLOYEES.map((e) => ({ id: e.id, name: e.name, department: e.department, employmentType: e.employmentType })),
    { id: DEMO_TL.id, name: DEMO_TL.name, department: DEMO_TL.department, employmentType: DEMO_TL.employmentType },
  ].map((e) => ({ ...e, benefitType: DEMO_BENEFIT_SELECTION[e.id] ?? null }))

  return (
    <AppShell
      title="Sportovní benefit"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <p className="text-sm text-slate-500">
          Nastav každému člověku Multisport kartu, nebo příspěvek na sport (600 Kč měsíčně proti dokladu).
          Žádosti o příspěvek schvaluješ tady — po schválení se částka přičte k odměně za daný měsíc.
        </p>
        <BenefitAdmin employees={employees} seedRequests={DEMO_SPORT_REQUESTS} />
      </div>
    </AppShell>
  )
}
