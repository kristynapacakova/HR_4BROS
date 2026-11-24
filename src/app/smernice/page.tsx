import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_DIRECTIVES, getDemoUserById } from '@/lib/mock-data'
import { DirectivesClient } from './DirectivesClient'

export default async function SmernicePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  // každý vidí svá potvrzení (dřív TL a OSVČ viděli Janova)
  const user = getDemoUserById(session.user.id)
  return (
    <AppShell
      title="Interní směrnice"
      isAdmin={isAdmin}
      isTL={isTL}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <DirectivesClient directives={DEMO_DIRECTIVES} currentEmployeeId={user.id} currentEmployeeName={user.name} currentEmployeeEmail={user.email} />
    </AppShell>
  )
}
