'use client'

import { useEffect, useState } from 'react'
import { DEMO_FEEDBACK, FEEDBACK_CATEGORIES } from '@/lib/mock-data'
import { loadAllFeedbackOverrides, saveFeedbackOverride, FEEDBACK_ADMIN_CHANGED_EVENT, type FeedbackOverride } from '@/lib/feedback-client'
import { EyeOff, User, MessageSquareHeart } from 'lucide-react'

const STATUS_CONFIG = {
  NEW:      { label: 'Nová',     bg: 'bg-violet/10 text-violet',    dot: 'bg-violet' },
  READ:     { label: 'Přečtena', bg: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-400' },
  RESOLVED: { label: 'Vyřešena', bg: 'bg-mint-tint text-mint-dark', dot: 'bg-mint' },
}

function formatDate(d: Date) {
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function FeedbackPanel() {
  const [overrides, setOverrides] = useState<Record<string, FeedbackOverride>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    const refresh = () => setOverrides(loadAllFeedbackOverrides())
    refresh()
    window.addEventListener(FEEDBACK_ADMIN_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(FEEDBACK_ADMIN_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const items = DEMO_FEEDBACK.map(f => ({
    ...f,
    status: overrides[f.id]?.status ?? f.status,
    adminNote: overrides[f.id]?.adminNote ?? f.adminNote,
  }))

  const newCount = items.filter(f => f.status === 'NEW').length
  const anonymousCount = items.filter(f => f.anonymous).length

  const submitReply = (id: string) => {
    saveFeedbackOverride(id, { status: 'RESOLVED', adminNote: replyText.trim() || null })
    setReplyingTo(null)
    setReplyText('')
  }

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
          <p className="text-2xl font-headline text-navy">{items.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Celkem zpráv</p>
        </div>
        <div className={`shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5 ${newCount > 0 ? 'bg-violet/5' : 'bg-white'}`}>
          <p className={`text-2xl font-headline ${newCount > 0 ? 'text-violet' : 'text-navy'}`}>{newCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Nových zpráv</p>
        </div>
        <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-5">
          <p className="text-2xl font-headline text-navy">{anonymousCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Anonymních</p>
        </div>
      </div>

      <p className="text-xs text-slate-400">Vidí jen HR — nikdo jiný (ani admin bez HR role, ani team lead) sem nemá přístup.</p>

      {/* Messages */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-12 text-center">
            <MessageSquareHeart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">Zatím žádné zprávy.</p>
          </div>
        ) : (
          items.map(item => {
            const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW
            const categoryLabel = FEEDBACK_CATEGORIES.find(c => c.value === item.category)?.label

            return (
              <div key={item.id} className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center ${item.anonymous ? 'bg-slate-100' : 'bg-navy'}`}>
                      {item.anonymous ? <EyeOff className="w-4 h-4 text-slate-400" /> : <User className="w-4 h-4 text-white" />}
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
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full hidden sm:inline-flex">{categoryLabel}</span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${status.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <p className="text-sm text-navy leading-relaxed">{item.message}</p>
                </div>

                {item.adminNote && (
                  <div className="px-6 pb-5">
                    <div className="bg-violet/5 shadow-[inset_0_0_0_1px_rgba(131,77,251,0.2)] px-4 py-3">
                      <p className="text-xs font-medium text-violet mb-1">Odpověď HR</p>
                      <p className="text-sm text-navy/80">{item.adminNote}</p>
                    </div>
                  </div>
                )}

                {item.status !== 'RESOLVED' && replyingTo !== item.id && (
                  <div className="px-6 pb-4 flex gap-2">
                    <button
                      onClick={() => saveFeedbackOverride(item.id, { status: 'READ' })}
                      className="text-xs text-slate-500 hover:text-navy shadow-[inset_0_0_0_1px_rgba(13,33,79,0.2)] px-3 py-1.5 transition-colors"
                    >
                      Označit jako přečteno
                    </button>
                    <button
                      onClick={() => { setReplyingTo(item.id); setReplyText('') }}
                      className="text-xs text-white bg-violet hover:bg-violet-dark px-3 py-1.5 transition-colors"
                    >
                      Odpovědět a označit jako vyřešeno
                    </button>
                  </div>
                )}

                {replyingTo === item.id && (
                  <div className="px-6 pb-5 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Volitelná odpověď pro odesílatele..."
                      rows={2}
                      className="w-full px-3 py-2 shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] text-sm text-navy focus:outline-none focus:shadow-[inset_0_0_0_1px_#0D214F]"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setReplyingTo(null)} className="text-xs text-slate-500 shadow-[inset_0_0_0_1px_rgba(13,33,79,0.2)] px-3 py-1.5">Zrušit</button>
                      <button onClick={() => submitReply(item.id)} className="text-xs text-white bg-violet hover:bg-violet-dark px-3 py-1.5">Uložit a vyřešit</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
