'use client'

import { useEffect, useState } from 'react'

const CHIPS = [
  { label: 'Docházka', x: '18%', y: '22%', color: '#F0E100' },
  { label: 'Dovolené', x: '78%', y: '20%', color: '#834DFB' },
  { label: 'Rozpočty', x: '15%', y: '72%', color: '#4DE791' },
  { label: 'Tým', x: '80%', y: '74%', color: '#FFFFFF' },
]

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'scatter' | 'collapse' | 'reveal'>('scatter')

  useEffect(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      onDone()
      return
    }
    const t1 = setTimeout(() => setPhase('collapse'), 2400)
    const t2 = setTimeout(() => setPhase('reveal'), 3800)
    const t3 = setTimeout(() => onDone(), 6800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div className="fixed inset-0 z-50 bg-navy overflow-hidden" style={{ animation: phase === 'reveal' ? 'intro-fade-out 1s ease 2s forwards' : undefined }}>
      <div className="absolute inset-0 grid-4x4" />

      <button
        onClick={onDone}
        className="absolute top-6 right-6 z-10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white border border-white/30 hover:bg-white hover:text-navy transition-colors"
      >
        Přeskočit intro
      </button>

      {/* Pixelové mikro-karty, které se sbíhají do středu */}
      {CHIPS.map((c, i) => (
        <div
          key={c.label}
          className="absolute flex items-center gap-2 px-3 py-2 text-xs font-semibold text-navy"
          style={{
            left: c.x,
            top: c.y,
            background: c.color,
            transition: 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: `${i * 150}ms`,
            transform: phase === 'scatter' ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.2)',
            opacity: phase === 'scatter' ? 1 : 0,
          }}
        >
          <span className="w-2.5 h-2.5 bg-navy/20 flex-shrink-0" />
          {c.label}
        </div>
      ))}

      {/* Čtvercový rámeček s logem, odkrývá se po sbíhání karet */}
      <div
        className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center border-2 border-white text-center px-8"
        style={{
          width: 220,
          height: 220,
          transform: 'translate(-50%, -50%)',
          opacity: phase === 'scatter' ? 0 : 1,
          transition: 'opacity 0.8s ease',
          transitionDelay: phase === 'collapse' ? '0.9s' : '0s',
        }}
      >
        <span className="font-headline text-5xl font-bold text-white leading-none">4B</span>
        <p className="kicker text-violet-light mt-3 mb-1">HR Portál</p>
        <p className="text-white/50 text-[11px] leading-snug">Férový systém. Čistá data.</p>
      </div>
    </div>
  )
}
