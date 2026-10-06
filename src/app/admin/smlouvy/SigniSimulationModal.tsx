'use client'

import { useEffect, useState } from 'react'
import { X, Send, Mail, Eye, PenTool, CheckCircle2, ShieldCheck, Clock, Loader2 } from 'lucide-react'
import type { Contract } from '@/lib/mock-data'

interface Props {
  contract: Contract
  onClose: () => void
}

type SimStep = 'compose' | 'sending' | 'tracking' | 'done'

interface TrackEvent {
  key: 'sent' | 'opened' | 'signed'
  label: string
  icon: typeof Send
  done: boolean
  at: string | null
}

const SIGNI_TEAL = '#0EA5A4'

export function SigniSimulationModal({ contract, onClose }: Props) {
  const [step, setStep] = useState<SimStep>('compose')
  const [events, setEvents] = useState<TrackEvent[]>([
    { key: 'sent',   label: 'Dokument odeslán k podpisu', icon: Send,        done: false, at: null },
    { key: 'opened', label: 'Zaměstnanec dokument otevřel', icon: Eye,       done: false, at: null },
    { key: 'signed', label: 'Dokument elektronicky podepsán', icon: PenTool, done: false, at: null },
  ])

  const now = () => new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const handleSend = () => {
    setStep('sending')
    setTimeout(() => {
      setStep('tracking')
      setEvents(prev => prev.map(e => e.key === 'sent' ? { ...e, done: true, at: now() } : e))
    }, 1400)
  }

  // Simulate the recipient opening, then signing the document
  useEffect(() => {
    if (step !== 'tracking') return
    const t1 = setTimeout(() => {
      setEvents(prev => prev.map(e => e.key === 'opened' ? { ...e, done: true, at: now() } : e))
    }, 2200)
    const t2 = setTimeout(() => {
      setEvents(prev => prev.map(e => e.key === 'signed' ? { ...e, done: true, at: now() } : e))
      setStep('done')
    }, 4600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [step])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: SIGNI_TEAL }}>
              S
            </div>
            <div>
              <p className="text-sm font-semibold text-navy leading-tight">Elektronický podpis</p>
              <p className="text-[10px] text-slate-400 leading-tight">Simulace integrace · Signi-style e-signing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo notice */}
        <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-2">
          <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Náhled</span>
          <span className="text-[11px] text-amber-700/80">Toto je vizuální simulace — žádný e-mail se neodesílá ani podpis se neukládá.</span>
        </div>

        <div className="px-6 py-5">

          {/* ── Step 1: Compose ── */}
          {step === 'compose' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{contract.templateName}</p>
                  <p className="text-xs text-slate-400 truncate">K podpisu: {contract.employeeName}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Příjemce e-mailu</label>
                <input className="input" readOnly value={`${contract.employeeName.toLowerCase().replace(/\s+/g, '.')}@fourbros.cz`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Zpráva pro podepisující osobu</label>
                <textarea className="input resize-none" rows={3} readOnly
                  value={`Dobrý den ${contract.employeeName.split(' ')[0]},\n\nposíláme Vám k elektronickému podpisu dokument „${contract.templateName}". Podpis trvá méně než minutu.\n\nS pozdravem, Four Bros s.r.o.`} />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: SIGNI_TEAL }} />
                Dokument bude opatřen kvalifikovanou elektronickou pečetí a časovým razítkem
              </div>

              <button onClick={handleSend}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: SIGNI_TEAL }}>
                <Send className="w-4 h-4" />
                Odeslat k elektronickému podpisu
              </button>
            </div>
          )}

          {/* ── Step 2: Sending animation ── */}
          {step === 'sending' && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: SIGNI_TEAL }} />
              <p className="text-sm font-medium text-navy">Odesíláme dokument k podpisu…</p>
              <p className="text-xs text-slate-400">Generujeme zabezpečený podpisový odkaz</p>
            </div>
          )}

          {/* ── Step 3 & 4: Tracking ── */}
          {(step === 'tracking' || step === 'done') && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy truncate">{contract.templateName}</p>
                  <p className="text-xs text-slate-400 truncate">{contract.employeeName} · {contract.employeeName.toLowerCase().replace(/\s+/g, '.')}@fourbros.cz</p>
                </div>
                {step === 'done'
                  ? <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Podepsáno</span>
                  : <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Čeká na podpis</span>
                }
              </div>

              {/* Live status timeline */}
              <div className="space-y-0">
                {events.map((ev, i) => {
                  const Icon = ev.icon
                  const isLast = i === events.length - 1
                  return (
                    <div key={ev.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${ev.done ? 'text-white' : 'bg-slate-100 text-slate-300'}`}
                          style={ev.done ? { background: SIGNI_TEAL } : undefined}>
                          {ev.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                        </div>
                        {!isLast && <div className={`w-px flex-1 my-1 transition-colors duration-500 ${ev.done ? '' : 'bg-slate-150'}`} style={{ minHeight: 28, background: ev.done ? SIGNI_TEAL : '#e2e8f0' }} />}
                      </div>
                      <div className="pb-7">
                        <p className={`text-sm font-medium transition-colors ${ev.done ? 'text-navy' : 'text-slate-400'}`}>{ev.label}</p>
                        {ev.at
                          ? <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Dnes, {ev.at}</p>
                          : <p className="text-[11px] text-slate-300 mt-0.5">Čeká se…</p>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Signed certificate card */}
              {step === 'done' && (
                <div className="rounded-xl p-4 space-y-2" style={{ background: '#F7F8FE' }}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" style={{ color: SIGNI_TEAL }} />
                    <p className="text-xs font-semibold text-navy">Dokument elektronicky podepsán a zapečetěn</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-500 pl-6">
                    <span>ID podpisu</span><span className="font-mono text-navy">SGN-{contract.id.slice(0, 6).toUpperCase()}-2026</span>
                    <span>Metoda ověření</span><span className="text-navy">SMS kód + e-mail</span>
                    <span>Časové razítko</span><span className="text-navy">{new Date().toLocaleDateString('cs-CZ')}, {events.find(e => e.key === 'signed')?.at}</span>
                    <span>Platnost pečetě</span><span className="text-emerald-600 font-medium">Ověřeno ✓</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">
          {step === 'done' ? (
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: SIGNI_TEAL }}>
              Hotovo
            </button>
          ) : (
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Zavřít náhled
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
