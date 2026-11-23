import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_ADMIN, DEMO_DIRECTIVES, DIRECTIVE_TEMPLATES } from '@/lib/mock-data'
import { DirectivesAdminClient } from './DirectivesAdminClient'

export default async function AdminSmernicePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppShell
      title="Interní směrnice"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={DEMO_ADMIN.employmentType}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="kicker mb-1">Správa směrnic</p>
          <p className="text-sm text-slate-500">
            Vytvářejte směrnice ze šablon, publikujte je a sledujte, kdo je potvrdil. Lidé je najdou v sekci Interní směrnice.
          </p>
        </div>
        <DirectivesAdminClient directives={DEMO_DIRECTIVES} templates={DIRECTIVE_TEMPLATES} />
      </div>
    </AppShell>
  )
}
