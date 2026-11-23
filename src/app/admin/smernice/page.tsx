import { auth } from '@/lib/auth'
import { PageHero } from '@/components/layout/PageHero'
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
      <div className="w-full space-y-6">
        <PageHero kicker="Administrace" title="Správa směrnic">
          Vytvářejte směrnice ze šablon, publikujte je a sledujte, kdo je potvrdil. Lidé je najdou v sekci Interní směrnice.
        </PageHero>
        <DirectivesAdminClient directives={DEMO_DIRECTIVES} templates={DIRECTIVE_TEMPLATES} />
      </div>
    </AppShell>
  )
}
