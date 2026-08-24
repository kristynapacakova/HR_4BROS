import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { FeedbackForm } from './FeedbackForm'
import { ShieldCheck, Eye, EyeOff, MessageSquareHeart } from 'lucide-react'

export default async function FeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  return (
    <AppShell title="Schránka důvěry" isAdmin={isAdmin} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Hero */}
        <div className="relative bg-navy rounded-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white opacity-[0.06]" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white opacity-[0.03]" />
          </div>
          <div className="relative z-10 px-7 py-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
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

        {/* Anonymity info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy">Anonymní</p>
              <p className="text-xs text-slate-400 mt-0.5">HR vidí jen zprávu, tvé jméno zůstane skryté</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3">
            <div className="w-8 h-8 bg-violet/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-violet" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy">Se jménem</p>
              <p className="text-xs text-slate-400 mt-0.5">HR vidí i tvoje jméno, může tě zpětně kontaktovat</p>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            <strong>Garantujeme bezpečí.</strong> Anonymní zprávy nelze dohledat. Nikdo tě za upřímný feedback nebude postihovat.
          </p>
        </div>

        {/* Form */}
        <FeedbackForm userName={user?.name || session.user.email || ''} />

      </div>
    </AppShell>
  )
}
