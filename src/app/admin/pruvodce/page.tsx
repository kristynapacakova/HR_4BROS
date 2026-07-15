import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PruvodceClient } from './PruvodceClient'

export default async function PruvodcePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppShell
      title="Průvodce on/offboardingem"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <PruvodceClient />
    </AppShell>
  )
}
