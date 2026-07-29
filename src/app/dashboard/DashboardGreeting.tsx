'use client'

import { useEffect, useMemo, useState } from 'react'

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

      <div className="relative z-10 px-7 py-7">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-violet/60 text-sm font-light tracking-wide mb-1">{greeting}</p>
            <h1 className="text-3xl font-headline text-navy">{displayName} 👋</h1>
            {position && department && (
              <p className="text-sm mt-1.5 text-slate-500">{position} · {department}</p>
            )}
          </div>
          <div className="rounded-2xl px-5 py-3 bg-white/70 backdrop-blur-sm border border-white shadow-sm">
            <p className="text-violet/70 text-[10px] uppercase tracking-widest mb-0.5">Jsi s námi už</p>
            <p className="text-navy font-headline text-lg leading-tight">{tenure}</p>
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-5 border-t border-white/60">
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
