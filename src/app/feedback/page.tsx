import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { FeedbackForm } from './FeedbackForm'
import { SafeEnvelope } from './SafeEnvelope'

export default async function FeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  return (
    <AppShell title="Schránka důvěry" isAdmin={isAdmin} isTL={isTL} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
      <div className="w-full space-y-6">

        {/* Hero */}
        <div className="relative bg-navy overflow-hidden rozky rozky-lg after:z-20">
          <div className="relative z-10 px-7 py-7 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="kicker !text-white/60 mb-2">Bezpečný prostor</p>
              <h2 className="text-2xl font-headline text-white mb-2" style={{ fontWeight: 600 }}>Schránka důvěry</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Tady máš bezpečný prostor říct cokoliv — pochvalu, stížnost, návrh nebo cokoliv, co tě trápí. Můžeš psát anonymně i pod svým jménem, volba je jen na tobě.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em] text-gold">
                <span className="w-2 h-2 bg-gold" aria-hidden="true" />
                Zpráva je zamčená — anonymní nelze dohledat
              </p>
            </div>
            <SafeEnvelope className="w-40 sm:w-48 flex-shrink-0 self-center" />
          </div>
        </div>

        {/* Form */}
        <FeedbackForm userName={user?.name || session.user.email || ''} />

      </div>
    </AppShell>
  )
}
