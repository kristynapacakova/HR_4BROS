import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_TEAM, DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { MemberProfileClient } from './MemberProfileClient'

export default async function TeamMemberPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  const sorted = [...DEMO_TEAM].sort((a, b) => a.name.localeCompare(b.name, 'cs'))
  const idx = sorted.findIndex((m) => m.id === params.id)
  if (idx === -1) notFound()

  const member = sorted[idx]
  const prev = sorted[(idx - 1 + sorted.length) % sorted.length]
  const next = sorted[(idx + 1) % sorted.length]

  return (
    <AppShell
      title="Tým Four Bros"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <MemberProfileClient
        member={member}
        prev={{ id: prev.id, name: prev.name }}
        next={{ id: next.id, name: next.name }}
        viewerEmail={session.user.email ?? null}
      />
    </AppShell>
  )
}
