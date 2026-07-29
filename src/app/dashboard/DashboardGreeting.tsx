'use client'

import { useMemo } from 'react'

interface Props {
  name: string
  position?: string
  department?: string
  tenure: string
  startDate: string
}

export function DashboardGreeting({ name, position, department, tenure }: Props) {
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 10) return 'Dobré ráno'
    if (h < 13) return 'Dobrý den'
    if (h < 18) return 'Dobré odpoledne'
    return 'Dobrý večer'
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
      {/* Subtle violet glow blob */}
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.10), transparent 70%)', filter: 'blur(48px)' }}
      />

      <div className="relative z-10 px-7 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-slate-400 text-sm font-light tracking-wide mb-1">{greeting}</p>
          <h1 className="text-3xl font-headline text-navy">{name} 👋</h1>
          {position && department && (
            <p className="text-sm mt-1.5 text-slate-400">{position} · {department}</p>
          )}
        </div>
        <div className="rounded-2xl px-5 py-3 border border-violet/15 bg-violet/5">
          <p className="text-violet/70 text-[10px] uppercase tracking-widest mb-0.5">Ve firmě</p>
          <p className="text-violet font-headline text-lg leading-tight">{tenure}</p>
        </div>
      </div>
    </div>
  )
}
