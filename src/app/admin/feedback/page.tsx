import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { FeedbackPanel } from './FeedbackPanel'

export default async function AdminFeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppShell title="Schránka důvěry" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-3xl mx-auto">
        <FeedbackPanel />
      </div>
    </AppShell>
  )
}
