import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_DIRECTIVES, DIRECTIVE_TEMPLATES, DEMO_ADMIN } from '@/lib/mock-data'
import { DirectivesAdminClient } from './DirectivesAdminClient'

export default async function AdminSmernicePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')
  return (
    <AppShell
      title="Interní směrnice — Správa"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={DEMO_ADMIN.employmentType}
    >
      <DirectivesAdminClient directives={DEMO_DIRECTIVES} templates={DIRECTIVE_TEMPLATES} />
    </AppShell>
  )
}
