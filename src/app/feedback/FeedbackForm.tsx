'use client'

import { useRef, useState } from 'react'
import { FEEDBACK_CATEGORIES } from '@/lib/mock-data'
import { Send, CheckCircle2, EyeOff, Eye, Paperclip, X, ShieldCheck } from 'lucide-react'

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FeedbackForm({ userName }: { userName: string }) {
  const [anonymous, setAnonymous] = useState(true)
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-headline text-navy mb-2">Zpráva odeslána!</h3>
        <p className="text-sm text-slate-400 mb-1">
          {anonymous ? 'Odeslali jste anonymně.' : `Odeslali jste pod jménem ${userName}.`}
        </p>
        <p className="text-sm text-slate-400">HR tým se vaší zprávou bude zabývat.</p>
        {attachment && (
          <p className="text-xs text-slate-400 mt-2">Příloha: {attachment.name} ({fmtSize(attachment.size)})</p>
        )}
        <button
          onClick={() => { setSent(false); setMessage(''); setCategory(''); setAttachment(null) }}
          className="mt-6 text-sm text-violet hover:text-violet-dark transition-colors font-medium"
        >
          Odeslat další zprávu
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

      {/* Anonymity toggle */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Kdo zprávu posílá?</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAnonymous(true)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              anonymous ? 'border-navy bg-navy text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium leading-tight">Anonymně</p>
              <p className={`text-xs mt-0.5 ${anonymous ? 'text-white/60' : 'text-slate-400'}`}>Jméno skryto</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setAnonymous(false)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              !anonymous ? 'border-navy bg-navy text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Eye className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium leading-tight">Se jménem</p>
              <p className={`text-xs mt-0.5 ${!anonymous ? 'text-white/60' : 'text-slate-400'}`}>{userName.split(' ')[0]}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Téma</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent bg-white"
        >
          <option value="">— Vyberte téma (volitelné) —</option>
          {FEEDBACK_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Zpráva</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Napiš cokoliv, co ti leží na srdci..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent resize-none leading-relaxed"
        />
        <p className="text-xs text-slate-400 mt-1.5 text-right">{message.length} znaků</p>
      </div>

      {/* Guarantee */}
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-700">
          <strong>Garantujeme bezpečí.</strong> Anonymní zprávy nelze dohledat. Nikdo tě za upřímný feedback nebude postihovat.
        </p>
      </div>

      {/* Attachment */}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Příloha (volitelné)</label>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
        />
        {attachment ? (
          <div className="flex items-center gap-2.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
            <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="flex-1 min-w-0 truncate text-navy">{attachment.name}</span>
            <span className="text-xs text-slate-400 flex-shrink-0">{fmtSize(attachment.size)}</span>
            <button
              type="button"
              onClick={() => { setAttachment(null); if (fileRef.current) fileRef.current.value = '' }}
              className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:text-navy hover:border-slate-300 transition-colors w-full"
          >
            <Paperclip className="w-4 h-4 flex-shrink-0" />
            Přidat přílohu — PDF, foto nebo jiný soubor
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-800 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
      >
        {loading ? (
          <span className="text-sm">Odesílám...</span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span className="text-sm">Odeslat {anonymous ? 'anonymně' : 'pod svým jménem'}</span>
          </>
        )}
      </button>
    </form>
  )
}
