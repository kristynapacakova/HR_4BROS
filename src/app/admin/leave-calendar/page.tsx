import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_TEAM_LEAVES } from '@/lib/mock-data'
import { LeaveCalendar } from './LeaveCalendar'

export default async function LeaveCalendarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  if (!isAdmin && !isTL) redirect('/dashboard')

  const serializedLeaves = DEMO_TEAM_LEAVES.map((l) => ({
    ...l,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
  }))

  return (
    <AppShell
      title="Přehled docházky"
      isAdmin={isAdmin}
      isTL={isTL}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <LeaveCalendar leaves={serializedLeaves} canEdit={isAdmin} />
    </AppShell>
  )
}
