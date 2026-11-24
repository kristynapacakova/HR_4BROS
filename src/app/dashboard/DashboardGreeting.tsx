'use client'

import { useEffect, useMemo, useState } from 'react'
import { readAvatar } from '@/components/AvatarUpload'
import { TEAM_PROFILE_CHANGED_EVENT } from '@/lib/team-profile-client'
import { toVocativeCz } from '@/lib/cz-vocative'

interface Stat {
  value: string
  label: string
}

interface Props {
  name: string
  initial: string
  teamMemberId?: string
  position?: string
  department?: string
  tenure: string
  startDate: string
  stats?: Stat[]
}

export function DashboardGreeting({ name, initial, teamMemberId, position, department, tenure, startDate, stats }: Props) {
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
  const displayName = nickname?.trim() || toVocativeCz(name)

  const [photo, setPhoto] = useState<string | null>(null)
  useEffect(() => {
    const refresh = () => setPhoto(readAvatar(teamMemberId).photo)
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('fb-avatar-changed', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('fb-avatar-changed', refresh)
    }
  }, [teamMemberId])

  // Pracovní výročí — tiché, decentní připomenutí přesně v den výročí (ne každý rok od začátku).
  const isAnniversary = useMemo(() => {
    const start = new Date(startDate)
    const now = new Date()
    const years = now.getFullYear() - start.getFullYear()
    return years >= 1 && now.getMonth() === start.getMonth() && now.getDate() === start.getDate()
  }, [startDate])

  return (
    <div className="relative overflow-hidden bg-navy text-white">
      <div className="relative z-10 px-7 sm:px-9 py-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-headline text-3xl font-semibold">{initial}</span>
              )}
            </div>
            <div>
              <p className="kicker text-gold text-[11px] mb-2">{greeting}</p>
              <h1 className="font-headline text-[32px] sm:text-[38px] leading-[1.05] text-white" style={{ fontWeight: 600 }}>{displayName}</h1>
              {(position || department) && (
                <p className="text-[15px] mt-1.5 text-white/70">
                  {/* tým se nezobrazuje, když se jmenuje stejně jako pozice (Account Manager · Account manager) */}
                  {position && department && position.toLowerCase() !== department.toLowerCase() ? `${position} · ${department}` : position || department}
                </p>
              )}
            </div>
          </div>
          <div className={`px-5 py-3 ${isAnniversary ? 'bg-violet text-white' : 'bg-gold text-navy'}`}>
            <p className="kicker mb-0.5 opacity-70">
              {isAnniversary ? 'Pracovní výročí' : 'Jsi s námi už'}
            </p>
            <p className="font-headline text-lg leading-tight font-bold">{tenure}</p>
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-5 border-t border-white/15">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-xl font-headline text-white leading-tight">{s.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
        <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
        <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
      </div>
    </div>
  )
}
