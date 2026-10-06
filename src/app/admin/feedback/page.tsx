import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_FEEDBACK, FEEDBACK_CATEGORIES } from '@/lib/mock-data'
import { EyeOff, User, MessageSquareHeart } from 'lucide-react'

const STATUS_CONFIG = {
  NEW:      { label: 'Nová',     bg: 'bg-violet/10 text-violet',    dot: 'bg-violet' },
  READ:     { label: 'Přečtena', bg: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-400' },
  RESOLVED: { label: 'Vyřešena', bg: 'bg-green-50 text-green-700',  dot: 'bg-green-400' },
}

function formatDate(d: Date) {
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function AdminFeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const feedback = DEMO_FEEDBACK
  const newCount      = feedback.filter(f => f.status === 'NEW').length
  const anonymousCount = feedback.filter(f => f.anonymous).length

  return (
    <AppShell title="Schránka důvěry" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-2xl font-headline text-navy">{feedback.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Celkem zpráv</p>
          </div>
          <div className={`rounded-2xl border shadow-sm p-5 ${newCount > 0 ? 'bg-violet/5 border-violet/20' : 'bg-white border-slate-100'}`}>
            <p className={`text-2xl font-headline ${newCount > 0 ? 'text-violet' : 'text-navy'}`}>{newCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Nových zpráv</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-2xl font-headline text-navy">{anonymousCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Anonymních</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <MessageSquareHeart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">Zatím žádné zprávy.</p>
            </div>
          ) : (
            feedback.map(item => {
              const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW
              const categoryLabel = FEEDBACK_CATEGORIES.find(c => c.value === item.category)?.label

              return (
                <div key={item.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${item.status === 'NEW' ? 'border-violet/20' : 'border-slate-100'}`}>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.anonymous ? 'bg-slate-100' : 'bg-navy'}`}>
                        {item.anonymous
                          ? <EyeOff className="w-4 h-4 text-slate-400" />
                          : <User className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {item.anonymous ? 'Anonymní odesílatel' : item.authorName}
                        </p>
                        <p className="text-xs text-slate-400">{formatDate(item.submittedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {categoryLabel && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full hidden sm:inline-flex">
                          {categoryLabel}
                        </span>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${status.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="px-6 py-5">
                    <p className="text-sm text-navy leading-relaxed">{item.message}</p>
                  </div>

                  {/* Admin note / response */}
                  {item.adminNote && (
                    <div className="px-6 pb-5">
                      <div className="bg-violet/5 border border-violet/10 rounded-xl px-4 py-3">
                        <p className="text-xs font-medium text-violet mb-1">Odpověď HR</p>
                        <p className="text-sm text-navy/80">{item.adminNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {item.status !== 'RESOLVED' && (
                    <div className="px-6 pb-4 flex gap-2">
                      <button className="text-xs text-slate-500 hover:text-navy border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                        Označit jako přečteno
                      </button>
                      <button className="text-xs text-white bg-violet hover:bg-violet-dark px-3 py-1.5 rounded-lg transition-colors">
                        Označit jako vyřešeno
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </AppShell>
  )
}
