import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_TEAM_LEAVES } from '@/lib/mock-data'
import { LeaveCalendar } from './LeaveCalendar'

export default async function LeaveCalendarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const serializedLeaves = DEMO_TEAM_LEAVES.map((l) => ({
    ...l,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
  }))

  return (
    <AppShell
      title="Přehled docházky"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <LeaveCalendar leaves={serializedLeaves} />
    </AppShell>
  )
}
