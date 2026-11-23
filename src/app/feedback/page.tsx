import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { FeedbackForm } from './FeedbackForm'
import { MessageSquareHeart } from 'lucide-react'

export default async function FeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  return (
    <AppShell title="Schránka důvěry" isAdmin={isAdmin} isTL={isTL} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Hero */}
        <div className="relative bg-navy overflow-hidden">
          <div className="relative z-10 px-7 py-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquareHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-headline text-white mb-1">Schránka důvěry</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Tady máš bezpečný prostor říct cokoliv — pochvalu, stížnost, návrh nebo cokoliv, co tě trápí. Můžeš psát anonymně i pod svým jménem, volba je jen na tobě.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <FeedbackForm userName={user?.name || session.user.email || ''} />

      </div>
    </AppShell>
  )
}
