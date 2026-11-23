import { auth } from '@/lib/auth'
import { PageHero } from '@/components/layout/PageHero'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { FeedbackPanel } from './FeedbackPanel'

export default async function AdminFeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppShell title="Schránka důvěry" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="w-full">
        <PageHero kicker="Administrace" title="Schránka důvěry">Zprávy od lidí — anonymní i podepsané. Odpovídej a označuj vyřešené.</PageHero>
        <FeedbackPanel />
      </div>
    </AppShell>
  )
}
