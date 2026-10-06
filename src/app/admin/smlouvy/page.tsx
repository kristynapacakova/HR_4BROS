import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_ADMIN, CONTRACT_TEMPLATES, DEMO_CONTRACTS } from '@/lib/mock-data'
import { ContractsClient } from './ContractsClient'

export default async function SmlouvyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const user = DEMO_ADMIN

  return (
    <AppShell
      title="Správa smluv"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-5xl mx-auto">
        <ContractsClient templates={CONTRACT_TEMPLATES} contracts={DEMO_CONTRACTS} />
      </div>
    </AppShell>
  )
}
