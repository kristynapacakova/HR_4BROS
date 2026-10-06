'use client'

import { useCallback, useEffect, useState } from 'react'
import { Cake, CalendarDays, Plus, X, PartyPopper, Settings2, RefreshCw, Link2 } from 'lucide-react'
import { loadTeamProfiles, TEAM_PROFILE_CHANGED_EVENT } from '@/lib/team-profile-client'

const CZ_MONTHS = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']

interface TeamBirthday {
  id: string
  name: string
  birthday: string | null
}

interface Birthday {
  name: string
  /** dní do narozenin (0 = dnes) */
  days: number
  dateLabel: string
}

interface CompanyEvent {
  id: string
  title: string
  date: string // ISO yyyy-mm-dd
  source: 'google' | 'local'
}

const EVENTS_KEY = 'fb-company-events'
const ICS_KEY = 'fb-events-ics'

function loadLocal(): CompanyEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? (JSON.parse(raw) as CompanyEvent[]).map(e => ({ ...e, source: 'local' as const })) : []
  } catch {
    return []
  }
}

function daysUntil(iso: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const d = new Date(iso); d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })
}

/**
 * Kalendář akcí — propisuje se z Google Kalendáře (tajná iCal adresa),
 * plus narozeniny tento týden z profilů týmu. Ruční přidání jako záloha.
 */
export function EventsCard({ teamBirthdays, isAdmin }: { teamBirthdays: TeamBirthday[]; isAdmin: boolean }) {
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [localEvents, setLocalEvents] = useState<CompanyEvent[]>([])
  const [googleEvents, setGoogleEvents] = useState<CompanyEvent[]>([])
  const [icsUrl, setIcsUrl] = useState('')
  const [icsInput, setIcsInput] = useState('')
  const [icsError, setIcsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const fetchGoogle = useCallback(async (url: string) => {
    if (!url) { setGoogleEvents([]); return }
    setLoading(true)
    setIcsError(null)
    try {
      const res = await fetch(`/api/events?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!res.ok) {
        setIcsError(data.error ?? 'Kalendář se nepodařilo načíst')
        setGoogleEvents([])
      } else {
        setGoogleEvents((data.events as { title: string; date: string }[]).map((e, i) => ({
          id: `g-${i}-${e.date}`, title: e.title, date: e.date, source: 'google' as const,
        })))
      }
    } catch {
      setIcsError('Kalendář se nepodařilo načíst')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLocalEvents(loadLocal())
    let url = ''
    try { url = localStorage.getItem(ICS_KEY) ?? '' } catch { /* noop */ }
    setIcsUrl(url)
    setIcsInput(url)
    setHydrated(true)
    if (url) fetchGoogle(url)
  }, [fetchGoogle])

  useEffect(() => {
    const refresh = () => {
      const overrides = loadTeamProfiles()
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const computed = teamBirthdays
        .map((m) => {
          const raw = overrides[m.id]?.birthday !== undefined ? overrides[m.id].birthday : m.birthday
          if (!raw) return null
          const [, bm, bd] = raw.split('-').map(Number)
          let next = new Date(today.getFullYear(), bm - 1, bd)
          if (next < today) next = new Date(today.getFullYear() + 1, bm - 1, bd)
          const days = Math.round((next.getTime() - today.getTime()) / 86400000)
          return { name: m.name, days, dateLabel: `${next.getDate()}. ${CZ_MONTHS[bm - 1]}` }
        })
        .filter((b): b is Birthday => b !== null)
        .sort((a, b) => a.days - b.days)
      setBirthdays(computed)
    }
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamBirthdays])

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(EVENTS_KEY, JSON.stringify(localEvents)) } catch { /* noop */ }
    }
  }, [localEvents, hydrated])

  const saveIcs = () => {
    const url = icsInput.trim()
    try {
      if (url) localStorage.setItem(ICS_KEY, url)
      else localStorage.removeItem(ICS_KEY)
    } catch { /* noop */ }
    setIcsUrl(url)
    setShowSettings(false)
    fetchGoogle(url)
  }

  const addEvent = () => {
    if (!title.trim() || !date) return
    setLocalEvents(prev => [...prev, { id: `${Date.now()}`, title: title.trim(), date, source: 'local' }])
    setTitle(''); setDate(''); setAdding(false)
  }

  const removeEvent = (id: string) => setLocalEvents(prev => prev.filter(e => e.id !== id))

  const upcoming = [...googleEvents, ...localEvents]
    .map(e => ({ ...e, days: daysUntil(e.date) }))
    .filter(e => e.days >= 0)
    .sort((a, b) => a.days - b.days)

  const weekBirthdays = birthdays.filter(b => b.days <= 7)
  const empty = upcoming.length === 0 && weekBirthdays.length === 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-headline text-navy">Kalendář akcí</h3>
          {icsUrl && !icsError && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <Link2 className="w-2.5 h-2.5" />
              Google Kalendář
            </span>
          )}
          {loading && <RefreshCw className="w-3 h-3 text-slate-300 animate-spin" />}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1.5">
            {!adding && (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-violet bg-violet/10 hover:bg-violet hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
                Přidat akci
              </button>
            )}
            <button
              onClick={() => setShowSettings(s => !s)}
              className="p-1.5 rounded-full text-slate-400 hover:text-navy hover:bg-slate-50 transition-colors"
              title="Napojit Google Kalendář"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Google Calendar settings (admin) */}
      {isAdmin && showSettings && (
        <div className="mb-4 p-4 rounded-2xl bg-[#F7F4FE] space-y-2">
          <p className="text-xs font-semibold text-navy">Napojení na Google Kalendář</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            V Google Kalendáři otevři <strong>Nastavení kalendáře → Integrovat kalendář</strong> a zkopíruj
            <strong> „Tajnou adresu ve formátu iCal&ldquo;</strong>. Ideálně pro samostatný kalendář „Four Bros Akce&ldquo;,
            ať se sem nepropisují pracovní meetingy.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              className="input flex-1 !bg-white min-w-[240px]"
              placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
              value={icsInput}
              onChange={e => setIcsInput(e.target.value)}
            />
            <button onClick={saveIcs} className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-violet hover:bg-violet-dark transition-colors">
              Uložit a načíst
            </button>
          </div>
          {icsError && <p className="text-[11px] text-red-500">{icsError}</p>}
        </div>
      )}

      {/* Add form (admin) */}
      {isAdmin && adding && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-2xl bg-[#F7F4FE]">
          <input
            className="input !w-52 !bg-white"
            placeholder="Název akce (grilovačka…)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <input
            type="date"
            className="input !w-40 !bg-white"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button
            onClick={addEvent}
            disabled={!title.trim() || !date}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-violet hover:bg-violet-dark transition-colors disabled:opacity-40"
          >
            Uložit
          </button>
          <button
            onClick={() => { setAdding(false); setTitle(''); setDate('') }}
            className="px-3 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-navy transition-colors"
          >
            Zrušit
          </button>
        </div>
      )}

      {empty ? (
        <p className="text-sm text-slate-500">
          {icsUrl ? 'V nejbližších 60 dnech nejsou žádné akce ani narozeniny. 🍃' : 'Zatím žádné akce. Napoj Google Kalendář přes ⚙️ vpravo nahoře.'}
        </p>
      ) : (
        <div className="space-y-2.5">
          {/* Akce (Google + ruční) */}
          {upcoming.map(e => (
            <div key={e.id} className="group flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-alice flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-4 h-4 text-navy" />
              </div>
              <p className="text-sm text-navy flex-1 min-w-0 truncate">
                {e.title} <span className="text-slate-400">· {fmtDate(e.date)}</span>
              </p>
              <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                {e.days === 0 ? 'Dnes!' : e.days === 1 ? 'Zítra' : `za ${e.days} dní`}
              </span>
              {isAdmin && e.source === 'local' && (
                <button
                  onClick={() => removeEvent(e.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-slate-300 hover:text-red-500 transition-all flex-shrink-0"
                  title="Smazat akci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Narozeniny tento týden */}
          {weekBirthdays.map(b => (
            <div key={b.name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Cake className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-sm text-navy flex-1 min-w-0 truncate">
                {b.name} <span className="text-slate-400">· narozeniny {b.dateLabel}</span>
              </p>
              <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                {b.days === 0 ? 'Dnes! 🎉' : b.days === 1 ? 'Zítra' : `za ${b.days} dní`}
              </span>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <p className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-4">
          <CalendarDays className="w-3 h-3" />
          Akce se propisují z napojeného Google Kalendáře. Narozeniny tento týden se doplňují samy z profilů týmu.
        </p>
      )}
    </div>
  )
}
