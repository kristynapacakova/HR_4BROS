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
    <div
      className="relative rounded-2xl overflow-hidden border border-violet/10 shadow-sm"
      style={{ background: 'linear-gradient(120deg, #F3EAFD 0%, #F7F4FE 45%, #EEF3FC 100%)' }}
    >
      {/* Soft glow blobs */}
      <div
        className="absolute -right-16 -top-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.16), transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute -left-16 -bottom-24 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(25,70,105,0.08), transparent 70%)', filter: 'blur(36px)' }}
      />

      <div className="relative z-10 px-7 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-violet/60 text-sm font-light tracking-wide mb-1">{greeting}</p>
          <h1 className="text-3xl font-headline text-navy">{name} 👋</h1>
          {position && department && (
            <p className="text-sm mt-1.5 text-slate-500">{position} · {department}</p>
          )}
        </div>
        <div className="rounded-2xl px-5 py-3 bg-white/70 backdrop-blur-sm border border-white shadow-sm">
          <p className="text-violet/70 text-[10px] uppercase tracking-widest mb-0.5">Ve firmě</p>
          <p className="text-navy font-headline text-lg leading-tight">{tenure}</p>
        </div>
      </div>
    </div>
  )
}
