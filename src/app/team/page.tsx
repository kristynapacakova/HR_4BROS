import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_TEAM, DEMO_USER, DEMO_ADMIN, TEAM_DEPARTMENTS } from '@/lib/mock-data'
import { TeamClient } from './TeamClient'

export default async function TeamPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  return (
    <AppShell
      title="Tým Four Bros"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <TeamClient members={DEMO_TEAM} departments={TEAM_DEPARTMENTS} isAdmin={isAdmin} />
    </AppShell>
  )
}
