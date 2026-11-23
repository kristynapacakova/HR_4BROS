import { auth } from '@/lib/auth'
import { PageHero } from '@/components/layout/PageHero'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_ADMIN } from '@/lib/mock-data'
import { SmlouvySection } from './SmlouvySection'

export default async function SmlouvyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppShell
      title="Smlouvy"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={DEMO_ADMIN.employmentType}
    >
      <div className="w-full">
        <PageHero kicker="Administrace" title="Smlouvy">Vytváření, podpisy a archiv smluv. Všechno na hlavičkovém papíře 4Bros.</PageHero>
        <SmlouvySection />
      </div>
    </AppShell>
  )
}
