'use client'

import { useEffect, useMemo, useState } from 'react'
import { WatercolorBackdrop } from '@/app/team/Medailonek'

interface Stat {
  value: string
  label: string
}

interface Props {
  name: string
  position?: string
  department?: string
  tenure: string
  startDate: string
  stats?: Stat[]
}

export function DashboardGreeting({ name, position, department, tenure, stats }: Props) {
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 10) return 'Hezké ráno'
    if (h < 13) return 'Hezké dopoledne'
    if (h < 18) return 'Hezké odpoledne'
    return 'Hezký večer'
  }, [])

  // Oslovení přezdívkou, kterou si každý nastaví v profilu
  const [nickname, setNickname] = useState<string | null>(null)
  useEffect(() => {
    try { setNickname(localStorage.getItem('fb-nickname')) } catch { /* noop */ }
  }, [])
  const displayName = nickname?.trim() || name

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
      <WatercolorBackdrop className="-right-24 -top-32 w-96 h-96 opacity-40" />

      <div className="relative z-10 px-7 py-7">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm font-light tracking-wide mb-1">{greeting}</p>
            <h1 className="text-3xl font-headline text-navy">{displayName} 👋</h1>
            {position && department && (
              <p className="text-sm mt-1.5 text-slate-500">{position} · {department}</p>
            )}
          </div>
          <div className="rounded-2xl px-5 py-3 bg-alice border border-slate-100">
            <p className="text-navy/60 text-[10px] uppercase tracking-widest mb-0.5">Jsi s námi už</p>
            <p className="text-navy font-headline text-lg leading-tight">{tenure}</p>
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-5 border-t border-slate-100">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-xl font-headline text-navy leading-tight">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
