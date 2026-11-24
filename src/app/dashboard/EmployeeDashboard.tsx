'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { DEMO_TEAM } from '@/lib/mock-data'
import { Avatar, personView, plural, useProfiles } from '@/app/team/teamPeople'
import { toVocativeCz } from '@/lib/cz-vocative'
import { DoneBurst, GiftBox } from './DashboardAnimations'
import { computePayNext, loadPaySchedule, PAY_SCHEDULE_CHANGED_EVENT, type PayNext } from '@/lib/pay-schedule'

/**
 * Dashboard pro zaměstnance a OSVČ: navy hlavička s úkoly a odpočtem do faktury/výplaty,
 * pod ní Lidé · Kalendář akcí · Novinky od HR. Bez částek — dá se otevřít před kýmkoli.
 */
export interface EmployeeDashData {
  meId?: string
  isIco: boolean
  firstName: string
  initial: string
  subtitle: string
  tenure: string
  todos: { id: string; label: string; hint: string; href: string }[]
  birthdays: { id: string; inDays: number; date: string }[]
  anniversaries: { id: string; years: number; inDays: number; date: string }[]
  newcomers: { id: string; since: string }[]
  news: { id: string; title: string; category: string; date: string; mine: boolean }[]
  hrContact?: { id: string; email: string }
  payNext: PayNext
}

const MONTHS_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro']
const rise = (i: number) => ({ animation: `fb-rise .5s cubic-bezier(.16,1,.3,1) ${i * 70}ms backwards` })

function usePeople() {
  const profiles = useProfiles()
  return (id: string) => {
    const m = DEMO_TEAM.find(x => x.id === id)!
    return personView(m, profiles[m.id])
  }
}

/** Úkoly ze serveru + fotka a BOZP, které se poznají až v prohlížeči */
function useTodos(data: EmployeeDashData) {
  const profiles = useProfiles()
  const [extra, setExtra] = useState<EmployeeDashData['todos']>([])
  useEffect(() => {
    const list: EmployeeDashData['todos'] = []
    if (data.meId && !profiles[data.meId]?.photo) list.push({ id: 'photo', label: 'Nahraj svou fotku', hint: 'Ať tě kolegové poznají v Týmu', href: '/profile' })
    let bozp: string | null = null
    try { bozp = localStorage.getItem('fb-bozp-last-done') } catch { /* noop */ }
    if (!bozp || new Date(bozp).getTime() + 365 * 86400000 < Date.now()) list.push({ id: 'bozp', label: 'Projdi školení BOZP', hint: 'Jednou ročně, zabere pár minut', href: '/profile' })
    setExtra(list)
  }, [data.meId, profiles])
  return [...data.todos, ...extra]
}

function useGreeting() {
  const [g, setG] = useState('Ahoj')
  useEffect(() => {
    const h = new Date().getHours()
    setG(h < 10 ? 'Hezké ráno' : h < 13 ? 'Hezké dopoledne' : h < 18 ? 'Hezké odpoledne' : 'Hezký večer')
  }, [])
  return g
}

function useNick(firstName: string) {
  const [nick, setNick] = useState<string | null>(null)
  useEffect(() => { try { setNick(localStorage.getItem('fb-nickname')) } catch { /* noop */ } }, [])
  return nick?.trim() || toVocativeCz(firstName)
}

/* Nejbližší akce — stejné zdroje jako Kalendář akcí (ruční akce + Google iCal). Bez nich ukázka. */
type UpEvent = { id: string; title: string; date: string; demo?: boolean }
const DEMO_EVENTS = (): UpEvent[] => {
  const y = new Date().getFullYear()
  return [
    { id: 'd1', title: 'Snídaně s celou firmou', date: `${y}-12-03`, demo: true },
    { id: 'd2', title: 'Vánoční večírek 4Bros', date: `${y}-12-18`, demo: true },
    { id: 'd3', title: 'Kancelář zavřená — svátky', date: `${y}-12-23`, demo: true },
  ]
}
function useUpcomingEvents(): UpEvent[] {
  const [list, setList] = useState<UpEvent[]>([])
  useEffect(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const keep = (e: UpEvent) => new Date(e.date).getTime() >= today.getTime()
    let local: UpEvent[] = []
    try { local = JSON.parse(localStorage.getItem('fb-company-events') ?? '[]') } catch { /* noop */ }
    let ics = ''
    try { ics = localStorage.getItem('fb-events-ics') ?? '' } catch { /* noop */ }
    const finish = (g: UpEvent[]) => {
      const all = [...g, ...local].filter(keep).sort((a, b) => a.date.localeCompare(b.date))
      setList(all.length ? all : DEMO_EVENTS().filter(keep))
    }
    if (!ics) { finish([]); return }
    fetch(`/api/events?url=${encodeURIComponent(ics)}`).then(r => r.json())
      .then(d => finish(((d.events ?? []) as { title: string; date: string }[]).map((e, i) => ({ id: `g${i}`, title: e.title, date: e.date }))))
      .catch(() => finish([]))
  }, [])
  return list
}

function Corner() {
  return (
    <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
      <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
      <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
    </div>
  )
}

const Tag = ({ cls, children }: { cls: string; children: ReactNode }) => (
  <span className={`text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 flex-shrink-0 ${cls}`}>{children}</span>
)

export function EmployeeDashboard({ data }: { data: EmployeeDashData }) {
  const todos = useTodos(data)
  const greeting = useGreeting()
  const name = useNick(data.firstName)
  const person = usePeople()
  const upcoming = useUpcomingEvents()
  const meP = data.meId ? person(data.meId) : null
  const hr = data.hrContact ? person(data.hrContact.id) : null

  // termíny podle nastavení HR (Přehled odměn → Termíny); server posílá výchozí
  const [pn, setPn] = useState<PayNext>(data.payNext)
  useEffect(() => {
    const refresh = () => setPn(computePayNext(data.isIco, loadPaySchedule()))
    refresh()
    window.addEventListener(PAY_SCHEDULE_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(PAY_SCHEDULE_CHANGED_EVENT, refresh)
  }, [data.isIco])

  return (
    <div className="w-full space-y-5">
      {/* ── hlavička ── */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 px-7 sm:px-9 pt-8 pb-7">
          <div className="flex flex-col">
            <div className="flex items-end gap-5">
              {meP ? <Avatar p={meP} size={88} fontSize={30} /> : <span className="w-[88px] h-[88px] bg-white/10 flex items-center justify-center font-headline text-3xl">{data.initial}</span>}
              <div className="min-w-0">
                <p className="kicker text-gold text-[11px] mb-2">{greeting}</p>
                <h1 className="font-headline text-[34px] sm:text-[38px] leading-[1.05]" style={{ fontWeight: 600 }}>{name}</h1>
                {data.subtitle && <p className="text-white/65 text-[15px] mt-1">{data.subtitle}</p>}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="bg-gold text-navy px-3 py-1.5 text-sm font-semibold">Jsi s námi {data.tenure}</span>
              {todos.length === 0 && <span className="bg-mint text-navy px-3 py-1.5 text-sm font-semibold">Všechno vyřízeno ✓</span>}
            </div>
            {/* schody 4B — dekorace */}
            <div className="hidden lg:flex items-end gap-1 mt-auto pt-8" aria-hidden="true">
              {[10, 18, 26, 34].map((h, i) => <span key={h} className={i === 3 ? 'bg-gold' : 'bg-white/15'} style={{ width: 14, height: h }} />)}
            </div>
          </div>

          {/* úkoly — bílý papír na navy */}
          <div className="bg-white text-navy p-5 self-start">
            <div className="flex items-baseline justify-between mb-2">
              <p className="font-headline text-[17px]" style={{ fontWeight: 600 }}>Čeká na tebe</p>
              <span className="text-xs text-navy/50">{todos.length ? `${todos.length} ${plural(todos.length, 'úkol', 'úkoly', 'úkolů')}` : ''}</span>
            </div>
            {todos.length === 0 ? (
              <p className="flex items-center gap-3 py-2 font-semibold"><span className="relative w-7 h-7 bg-mint flex items-center justify-center" style={{ animation: 'dash-pop .4s ease-out' }}>✓<DoneBurst /></span>Máš hotovo, díky!</p>
            ) : (
              <ul className="divide-y divide-[rgba(13,33,79,0.08)]">
                {todos.map((td, i) => (
                  <li key={td.id}>
                    <Link href={td.href} className="group flex items-center gap-3 py-2.5" style={rise(i)}>
                      <span className="w-5 h-5 border-2 border-navy/30 flex-shrink-0 transition-colors group-hover:border-violet" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold group-hover:text-violet">{td.label}</span>
                        <span className="block text-[11px] text-navy/50">{td.hint}</span>
                      </span>
                      <span className="text-navy/30 group-hover:text-violet">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* odpočet do faktury / výplaty */}
        <div className="border-t border-white/15 px-7 sm:px-9 py-4 pr-16">
          <Link href="/payslips" className="group flex items-center gap-x-6 gap-y-2">
            <span className="bg-gold text-navy px-3 py-2 text-center leading-none flex-shrink-0">
              <span className="block font-headline text-[26px]" style={{ fontWeight: 600 }}>{pn.inDays}</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5">{plural(pn.inDays, 'den', 'dny', 'dní')}</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-[15px] group-hover:text-gold">{pn.title}</span>
              <span className="block text-[12px] text-white/55">{pn.sub}</span>
            </span>
            <span className="text-white/40 group-hover:text-gold">→</span>
          </Link>
        </div>
        <Corner />
      </section>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Lidé */}
        <section className="bg-white border border-[rgba(13,33,79,0.14)] p-6" style={rise(0)}>
          <div className="flex items-baseline justify-between mb-4">
            <p className="kicker text-navy/55">Lidé</p>
            <Link href="/team" className="text-sm font-semibold text-navy/60 hover:text-violet">Tým →</Link>
          </div>
          <ul className="space-y-3">
            {data.birthdays.slice(0, 2).map(b => { const p = person(b.id); return (
              <li key={'b' + b.id}><Link href={`/team/${b.id}`} className="flex items-center gap-3 group">
                <Avatar p={p} size={40} fontSize={13} />
                <span className="flex-1 min-w-0"><span className="block text-sm font-semibold text-navy group-hover:text-violet truncate">{p.name}</span><span className="block text-[11px] text-navy/55">narozeniny {b.date}</span></span>
                <GiftBox size={20} />
                <Tag cls="bg-violet text-white">{b.inDays === 0 ? 'dnes!' : b.inDays === 1 ? 'zítra' : `za ${b.inDays} ${plural(b.inDays, 'den', 'dny', 'dní')}`}</Tag>
              </Link></li>
            ) })}
            {data.anniversaries.slice(0, 2).map(a => { const p = person(a.id); return (
              <li key={'a' + a.id}><Link href={`/team/${a.id}`} className="flex items-center gap-3 group">
                <Avatar p={p} size={40} fontSize={13} />
                <span className="flex-1 min-w-0"><span className="block text-sm font-semibold text-navy group-hover:text-violet truncate">{p.name}</span><span className="block text-[11px] text-navy/55">pracovní výročí {a.date}</span></span>
                <Tag cls="bg-gold text-navy">{a.years} {plural(a.years, 'rok', 'roky', 'let')} u nás</Tag>
              </Link></li>
            ) })}
            {data.newcomers.slice(0, 2).map(n => { const p = person(n.id); return (
              <li key={'n' + n.id}><Link href={`/team/${n.id}`} className="flex items-center gap-3 group">
                <Avatar p={p} size={40} fontSize={13} />
                <span className="flex-1 min-w-0"><span className="block text-sm font-semibold text-navy group-hover:text-violet truncate">{p.name}</span><span className="block text-[11px] text-navy/55 truncate">{p.position}</span></span>
                <Tag cls="bg-mint text-navy">nově</Tag>
              </Link></li>
            ) })}
          </ul>
        </section>

        {/* Kalendář akcí */}
        <section className="bg-white border border-[rgba(13,33,79,0.14)] p-6" style={rise(1)}>
          <div className="flex items-baseline justify-between mb-4">
            <p className="kicker text-navy/55">Kalendář akcí</p>
            {upcoming[0]?.demo && <span className="text-[10px] text-navy/35">ukázka</span>}
          </div>
          {upcoming.length === 0 ? <p className="text-sm text-navy/55">Zatím nic v kalendáři.</p> : (
            <ul className="space-y-3">
              {upcoming.slice(0, 4).map((e, i) => {
                const d = new Date(e.date); d.setHours(0, 0, 0, 0)
                const t0 = new Date(); t0.setHours(0, 0, 0, 0)
                const days = Math.round((d.getTime() - t0.getTime()) / 86400000)
                return (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className={`${i === 0 ? 'bg-gold' : 'bg-alice'} text-navy w-12 py-1.5 text-center leading-none flex-shrink-0`}>
                      <span className="block font-headline text-[20px]" style={{ fontWeight: 600 }}>{d.getDate()}</span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5">{MONTHS_SHORT[d.getMonth()]}</span>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-navy">{e.title}</span>
                      <span className="block text-[11px] text-navy/50">{days === 0 ? 'dnes' : days === 1 ? 'zítra' : `za ${days} ${plural(days, 'den', 'dny', 'dní')}`}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Novinky od HR */}
        <section className="bg-white border border-[rgba(13,33,79,0.14)] flex flex-col" style={rise(2)}>
          <div className="p-6 pb-2">
            <p className="kicker text-navy/55 mb-3">Novinky od HR</p>
            <ul className="space-y-3">
              {data.news.map(n => (
                <li key={n.id}>
                  <Link href="/smernice" className="group flex items-start gap-3">
                    <span className="w-1 self-stretch bg-violet flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[11px] text-navy/50">{n.category} · {n.date}</span>
                      <span className="block text-sm font-semibold text-navy group-hover:text-violet">{n.title}</span>
                    </span>
                    {n.mine && <Tag cls="bg-gold text-navy">potvrdit</Tag>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {hr && data.hrContact && (
            <div className="mt-auto m-4 bg-alice p-4 flex items-center gap-3">
              <Avatar p={hr} size={44} fontSize={14} />
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] text-navy/55">Potřebuješ něco? Obrať se na</span>
                <span className="block text-sm font-semibold text-navy truncate">{hr.name}</span>
                <span className="block text-[11px] text-navy/55 truncate">{hr.position}</span>
              </span>
              <a href={`mailto:${data.hrContact.email}`} className="text-sm font-semibold text-violet hover:underline flex-shrink-0">Napsat →</a>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
