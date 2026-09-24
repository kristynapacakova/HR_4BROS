import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_TEAM, DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { MemberProfileClient } from './MemberProfileClient'

export default async function TeamMemberPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  const sorted = [...DEMO_TEAM].sort((a, b) => a.name.localeCompare(b.name, 'cs'))
  const idx = sorted.findIndex((m) => m.id === params.id)
  if (idx === -1) notFound()

  const member = sorted[idx]

  return (
    <AppShell
      title="Tým Four Bros"
      isAdmin={isAdmin}
      isTL={isTL}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <MemberProfileClient
        member={member}
        allMembers={sorted.map((m) => ({ id: m.id, name: m.name, emoji: m.emoji }))}
        viewerEmail={session.user.email ?? null}
      />
    </AppShell>
  )
}
