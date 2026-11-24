'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { DEMO_TEAM } from '@/lib/mock-data'
import { Avatar, personView, plural, useProfiles } from '@/app/team/teamPeople'
import { toVocativeCz } from '@/lib/cz-vocative'
import { DoneBurst, GiftBox } from './DashboardAnimations'
import { bozpStatus } from '@/lib/hr/model'
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
  hrContact?: { id: string; email: string; phone?: string }
  payNext: PayNext
  /** poslední BOZP ze zdroje dat (YYYY-MM-DD) */
  bozpCompletedAt: string | null
  /** BOZP se týká jen HPP/DPP/DPČ — OSVČ úkol nedostanou */
  bozpRequired: boolean
}

const MONTHS_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro']
/** Velikost fotky v hlavičce — stejná na Dashboardu i v Můj účet */
export const HERO_PHOTO = 112
/** kolik úkolů se vejde do hlavičky; zbytek po rozbalení */
const VISIBLE_TODOS = 2
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
    // BOZP: ze zdroje dat + co si člověk odklikl v prohlížeči (dokud není databáze); rozhoduje novější
    let local: string | null = null
    try { local = localStorage.getItem(data.meId ? `fb-bozp-last-done:${data.meId}` : 'fb-bozp-last-done') } catch { /* noop */ }
    const last = [data.bozpCompletedAt, local].filter(Boolean).sort().pop() ?? null
    const b = bozpStatus(last ? new Date(last) : null)
    if (!data.bozpRequired) { /* OSVČ — BOZP se netýká */ }
    else if (b.state === 'MISSING' || b.state === 'EXPIRED') list.push({ id: 'bozp', label: 'Projdi školení BOZP', hint: b.state === 'EXPIRED' ? 'Platnost vypršela, je potřeba každý rok' : 'Jednou ročně, zabere pár minut', href: '/profile' })
    else if (b.state === 'EXPIRING') list.push({
      id: 'bozp-soon',
      label: b.daysLeft === 0 ? 'Školení BOZP ti dnes vyprší' : `Školení BOZP ti vyprší za ${b.daysLeft} ${plural(b.daysLeft!, 'den', 'dny', 'dní')}`,
      hint: `Obnov ho do ${b.validUntil!.toLocaleDateString('cs-CZ')}`,
      href: '/profile',
    })
    setExtra(list)
  }, [data.meId, data.bozpCompletedAt, data.bozpRequired, profiles])
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

function useNick(firstName: string, meId?: string) {
  const [nick, setNick] = useState<string | null>(null)
  useEffect(() => { try { setNick(localStorage.getItem(meId ? `fb-nickname:${meId}` : 'fb-nickname')) } catch { /* noop */ } }, [meId])
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

export function EmployeeDashboard({ data, footer }: { data: EmployeeDashData; footer?: ReactNode }) {
  const todos = useTodos(data)
  const greeting = useGreeting()
  const name = useNick(data.firstName, data.meId)
  const person = usePeople()
  const upcoming = useUpcomingEvents()
  const meP = data.meId ? person(data.meId) : null
  const [showAll, setShowAll] = useState(false)
  // HR sama sobě kontakt neukazuje
  const hr = data.hrContact && data.hrContact.id !== data.meId ? person(data.hrContact.id) : null

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
      <section className="relative bg-navy text-white overflow-hidden min-h-[256px] flex flex-col">
        <div className="flex-1 grid lg:grid-cols-[1fr_420px] gap-8 px-7 sm:px-9 pt-6 pb-[19px]">
          <div className="flex flex-col gap-6 min-w-0">
            <div className="flex items-end gap-6">
              {meP ? <Avatar p={meP} size={HERO_PHOTO} fontSize={34} /> : <span className="flex-shrink-0 bg-white/10 flex items-center justify-center font-headline text-4xl" style={{ width: HERO_PHOTO, height: HERO_PHOTO }}>{data.initial}</span>}
              <div className="min-w-0">
                <p className="kicker text-gold text-[11px] mb-2">{greeting}</p>
                <h1 className="font-headline text-[34px] sm:text-[38px] leading-[1.05]" style={{ fontWeight: 600 }}>{name}</h1>
                {data.subtitle && <p className="text-white/65 text-[15px] mt-1.5 flex items-center gap-2">{meP && <span className="w-2.5 h-2.5 flex-shrink-0" style={{ background: meP.color }} aria-hidden="true" />}{data.subtitle}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gold text-navy px-3 py-1.5 text-sm font-semibold">Jsi s námi {data.tenure}</span>
              {todos.length === 0 && <span className="relative bg-mint text-navy px-3 py-1.5 text-sm font-semibold" style={{ animation: 'dash-pop .4s ease-out' }}>Všechno vyřízeno ✓<DoneBurst /></span>}
            </div>
          </div>

          {/* úkoly — bílý papír na navy; ukáže, kolik se vejde do výšky hlavičky, zbytek po rozbalení */}
          {todos.length > 0 && (
          <div className={`bg-white text-navy px-5 pt-3 pb-2 flex flex-col self-start ${showAll ? '' : 'max-h-[168px] overflow-hidden'}`}>
            <div className="flex items-baseline justify-between mb-0.5">
              <p className="font-headline text-[17px]" style={{ fontWeight: 600 }}>Čeká na tebe</p>
              {todos.length > VISIBLE_TODOS ? (
                <button type="button" onClick={() => setShowAll(v => !v)} className="text-xs font-semibold text-violet hover:underline">
                  {showAll ? 'Sbalit' : `Všech ${todos.length} →`}
                </button>
              ) : (
                <span className="text-xs text-navy/50">{todos.length ? `${todos.length} ${plural(todos.length, 'úkol', 'úkoly', 'úkolů')}` : ''}</span>
              )}
            </div>
              <ul className="divide-y divide-[rgba(13,33,79,0.08)]">
                {(showAll ? todos : todos.slice(0, VISIBLE_TODOS)).map((td, i) => (
                  <li key={td.id}>
                    <Link href={td.href} className="group flex items-center gap-3 py-2" style={rise(i)}>
                      <span className="w-5 h-5 border-2 border-navy/30 flex-shrink-0 transition-colors group-hover:border-violet" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold truncate group-hover:text-violet">{td.label}</span>
                        <span className="block text-[11px] text-navy/50 truncate">{td.hint}</span>
                      </span>
                      <span className="text-navy/30 group-hover:text-violet">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
          </div>
          )}
        </div>

        {/* odpočet do faktury / výplaty */}
        <div className="border-t border-white/15 px-7 sm:px-9 py-4 pr-16">
          <Link href="/payslips" className="group flex items-center gap-x-6 gap-y-2">
            <span className="bg-gold text-navy px-3 py-2 text-center leading-none flex-shrink-0">
              <span className="block font-headline text-[26px]" style={{ fontWeight: 600 }}>{pn.inDays}</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5">{plural(pn.inDays, 'den', 'dny', 'dní')}</span>
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-[15px] group-hover:text-gold">{pn.title} <span className="text-white/50 group-hover:text-gold">→</span></span>
              <span className="block text-[12px] text-white/55">{pn.sub}</span>
            </span>
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
            <div className="mt-auto m-4 bg-alice p-4">
              <p className="kicker text-navy/55 mb-3">Potřebuješ pomoct nebo poradit?</p>
              <div className="flex items-center gap-3">
                <Avatar p={hr} size={44} fontSize={14} bg="#FFFFFF" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-navy truncate">{hr.name}</span>
                  <span className="block text-[12px] text-navy/55 truncate">{hr.position}</span>
                </span>
              </div>
              <div className={`grid gap-2 mt-3 ${data.hrContact.phone ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <a href={`mailto:${data.hrContact.email}`} title={data.hrContact.email} className="flex items-center justify-center gap-2 bg-white hover:bg-navy hover:text-white text-navy text-[13px] font-semibold py-2 transition-colors">
                  <Mail className="w-4 h-4" /> Napsat e-mail
                </a>
                {data.hrContact.phone && (
                  <a href={`tel:${data.hrContact.phone.replace(/\s/g, '')}`} title={data.hrContact.phone} className="flex items-center justify-center gap-2 bg-white hover:bg-navy hover:text-white text-navy text-[13px] font-semibold py-2 transition-colors">
                    <Phone className="w-4 h-4" /> Zavolat
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {footer}
    </div>
  )
}
