import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { PravidlaAccordion } from './PravidlaAccordion'

export default async function PravidlaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  return (
    <AppShell
      title="Pravidla"
      isAdmin={isAdmin}
      isTL={isTL}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto">
        <PravidlaAccordion />
      </div>
    </AppShell>
  )
}
