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
    <div className="relative bg-navy rounded-2xl overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white opacity-[0.03]" />
        <div className="absolute -right-4 bottom-0 w-40 h-40 rounded-full bg-violet opacity-[0.15]" />
        <div className="absolute right-32 -bottom-8 w-24 h-24 rounded-full bg-white opacity-[0.04]" />
        {/* Subtle wave line */}
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.06]" viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M0,30 C80,60 160,0 240,30 C320,60 360,20 400,30 L400,60 L0,60 Z" fill="white" />
        </svg>
      </div>

      <div className="relative z-10 px-7 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-navy-300 text-sm font-light tracking-wide mb-1 opacity-70">{greeting}</p>
          <h1 className="text-3xl font-headline text-white">{name} 👋</h1>
          {position && department && (
            <p className="text-sm mt-1.5 text-white/50">{position} · {department}</p>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">Ve firmě</p>
          <p className="text-white font-headline text-lg leading-tight">{tenure}</p>
        </div>
      </div>
    </div>
  )
}
