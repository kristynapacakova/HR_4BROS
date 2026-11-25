'use client'

import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import { ProfileTabs } from '../ProfileTabs'
import { AvatarUpload } from '@/components/AvatarUpload'
import { IconUser, IconLaptop, IconBanknote, IconContract } from '@/components/BrandIcons'
import { departmentColor, departmentInk } from '@/lib/team-colors'
import { tintOf } from '@/app/team/teamPeople'

type TabsProps = ComponentProps<typeof ProfileTabs>

export interface AccountInfo {
  name: string
  position: string
  department: string
  email: string
  employmentType: string
  startDate: string | null
  teamMemberId?: string
  assetCount: number
}

const SECTIONS = [
  { id: 'udaje', label: 'Osobní údaje', hint: 'Kontakt, adresa, účet', icon: IconUser },
  { id: 'majetek', label: 'Majetek', hint: 'Co máš zapůjčené', icon: IconLaptop },
  { id: 'vyplata', label: 'Moje odměna', hint: 'Výplaty a odměny', icon: IconBanknote },
  { id: 'dokumenty', label: 'Dokumenty', hint: 'Smlouvy a potvrzení', icon: IconContract },
] as const

const STAIR = ['#FFFFFF', '#F0E100', '#834DFB', '#4DE791']
const EMPLOYMENT: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'OSVČ' }

function since(raw: string | null) {
  if (!raw) return null
  const d = new Date(raw)
  const now = new Date()
  const m = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
  const y = Math.floor(m / 12), r = m % 12
  const yl = y === 0 ? '' : y === 1 ? '1 rok' : y < 5 ? `${y} roky` : `${y} let`
  const ml = r === 0 ? '' : r === 1 ? '1 měsíc' : r < 5 ? `${r} měsíce` : `${r} měsíců`
  return { date: d.toLocaleDateString('cs-CZ'), len: [yl, ml].filter(Boolean).join(' ') || 'pár dní' }
}

/* ───────────── A) Průkaz — navy hlavička + záložky se žlutým podtržením ───────────── */

export function AccountCard({ info, tabs }: { info: AccountInfo; tabs: TabsProps }) {
  const [tab, setTab] = useState('udaje')
  const s = since(info.startDate)
  return (
    <div className="max-w-4xl mx-auto">
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 grid-4x4 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row gap-7 p-7 sm:p-9">
          <AvatarUpload initial={info.name[0]} teamMemberId={info.teamMemberId} size={136} />
          <div className="flex flex-col justify-end min-w-0">
            <h1 className="font-headline text-[36px] sm:text-[44px] leading-[1.02]" style={{ fontWeight: 600 }}>{info.name}</h1>
            <p className="text-white/70 text-lg mt-1">{info.position}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="text-xs font-bold uppercase tracking-[0.06em] px-2.5 py-1" style={{ background: departmentColor(info.department), color: departmentInk(info.department) }}>{info.department}</span>
              <span className="text-xs font-semibold px-2.5 py-1 border border-white/25">{EMPLOYMENT[info.employmentType] ?? info.employmentType}</span>
              {s && <span className="text-xs font-semibold px-2.5 py-1 border border-white/25">Ve 4B {s.len} · od {s.date}</span>}
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
          <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
          <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
        </div>
      </section>

      <nav className="flex gap-7 border-b border-[rgba(13,33,79,0.14)] bg-white px-7 sm:px-9 mb-6 overflow-x-auto scrollbar-none">
        {SECTIONS.map(sec => (
          <button
            key={sec.id}
            onClick={() => setTab(sec.id)}
            className={`py-4 text-sm font-semibold whitespace-nowrap border-b-[3px] -mb-px transition-colors ${tab === sec.id ? 'border-gold text-navy' : 'border-transparent text-navy/50 hover:text-navy'}`}
          >
            {sec.label}
            {sec.id === 'majetek' && info.assetCount > 0 && <span className="ml-1.5 text-[11px] text-navy/40">{info.assetCount}</span>}
          </button>
        ))}
      </nav>

      <ProfileTabs {...tabs} activeTab={tab} onTabChange={setTab} hideNav />
    </div>
  )
}

/* ───────────── B) Rozcestník — sekce vlevo jako menu s popisky, obsah vpravo ───────────── */

export function AccountSidebar({ info, tabs }: { info: AccountInfo; tabs: TabsProps }) {
  const [tab, setTab] = useState('udaje')
  const s = since(info.startDate)
  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
      <aside className="lg:sticky lg:top-20 bg-white border border-[rgba(13,33,79,0.14)]">
        <div className="p-6 flex flex-col items-center text-center border-b border-[rgba(13,33,79,0.14)]">
          <AvatarUpload initial={info.name[0]} teamMemberId={info.teamMemberId} size={96} />
          <p className="font-headline text-navy text-[20px] mt-4 leading-tight" style={{ fontWeight: 600 }}>{info.name}</p>
          <p className="text-sm text-navy/60">{info.position}</p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-0.5" style={{ background: departmentColor(info.department), color: departmentInk(info.department) }}>{info.department}</p>
          {s && <p className="text-xs text-navy/50 mt-3">Ve 4B {s.len}</p>}
        </div>
        <nav className="p-2">
          {SECTIONS.map(sec => {
            const Icon = sec.icon
            const active = tab === sec.id
            return (
              <button
                key={sec.id}
                onClick={() => setTab(sec.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${active ? 'bg-navy text-white' : 'text-navy hover:bg-alice'}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-navy'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{sec.label}</span>
                  <span className={`block text-[11px] ${active ? 'text-white/60' : 'text-navy/50'}`}>
                    {sec.id === 'majetek' ? `${info.assetCount} ${info.assetCount === 1 ? 'věc' : info.assetCount < 5 && info.assetCount > 0 ? 'věci' : 'věcí'} zapůjčeno` : sec.hint}
                  </span>
                </span>
                {active && <span className="w-2 h-2 bg-gold flex-shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <div className="mb-5">
          <p className="kicker text-navy/50 mb-1">Můj účet</p>
          <h1 className="font-headline text-navy text-[30px] leading-none" style={{ fontWeight: 600 }}>
            {SECTIONS.find(x => x.id === tab)?.label}
          </h1>
        </div>
        <ProfileTabs {...tabs} activeTab={tab} onTabChange={setTab} hideNav />
      </main>
    </div>
  )
}

/* ───────────── C) Jedna stránka — sekce pod sebou, lepivá navigace 01–04 ───────────── */

export function AccountScroll({ info, tabs }: { info: AccountInfo; tabs: TabsProps }) {
  const [active, setActive] = useState('udaje')
  const s = since(info.startDate)

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id.replace('sekce-', '')) }),
      { rootMargin: '-30% 0px -60% 0px' },
    )
    SECTIONS.forEach(sec => { const el = document.getElementById(`sekce-${sec.id}`); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  const header = (id: string, label: string, i: number): ReactNode => (
    <div id={`sekce-${id}`} className="scroll-mt-36 flex items-end gap-4 mb-5">
      <span
        className="w-12 h-12 flex items-center justify-center font-headline text-[15px] flex-shrink-0"
        style={{ background: STAIR[i], color: i === 2 ? '#fff' : '#0d214f', border: i === 0 ? '1.5px solid #0d214f' : 'none', fontWeight: 600 }}
      >
        0{i + 1}
      </span>
      <h2 className="font-headline text-navy text-[28px] leading-none" style={{ fontWeight: 600 }}>{label}</h2>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* hlavička jako hlavičkový papír */}
      <section
        className="relative bg-white border border-[rgba(13,33,79,0.14)] p-8 sm:p-10 overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(to right, #ebe7f8 1px, transparent 1px)', backgroundSize: '25% 100%' }}
      >
        <div className="relative flex flex-col sm:flex-row sm:items-end gap-7">
          <AvatarUpload initial={info.name[0]} teamMemberId={info.teamMemberId} size={112} />
          <div className="flex-1 min-w-0">
            <p className="kicker text-navy/50 mb-2">Můj účet</p>
            <h1 className="font-headline text-navy text-[40px] leading-[1]" style={{ fontWeight: 600 }}>{info.name}</h1>
            <p className="text-navy/60 mt-2">{info.position} · {info.department}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-navy">
            <dt className="text-navy/50">Spolupráce</dt><dd className="font-semibold">{EMPLOYMENT[info.employmentType] ?? info.employmentType}</dd>
            {s && <><dt className="text-navy/50">Ve 4B od</dt><dd className="font-semibold">{s.date}</dd></>}
            <dt className="text-navy/50">E-mail</dt><dd className="font-semibold truncate max-w-[180px]">{info.email}</dd>
          </dl>
        </div>
      </section>

      {/* lepivá navigace */}
      <nav className="sticky top-14 z-20 bg-alice/95 backdrop-blur border-b border-[rgba(13,33,79,0.14)] flex gap-6 px-2 py-3 mb-10 overflow-x-auto scrollbar-none">
        {SECTIONS.map((sec, i) => (
          <a
            key={sec.id}
            href={`#sekce-${sec.id}`}
            className={`flex items-center gap-2 text-sm font-semibold whitespace-nowrap transition-colors ${active === sec.id ? 'text-navy' : 'text-navy/45 hover:text-navy'}`}
          >
            <span className="w-2.5 h-2.5" style={{ background: active === sec.id ? (i === 0 ? '#0d214f' : STAIR[i]) : 'rgba(13,33,79,0.15)' }} />
            0{i + 1} {sec.label}
          </a>
        ))}
      </nav>

      <ProfileTabs {...tabs} stacked sectionHeader={header} />
    </div>
  )
}

/* ───────────── A+) Průkaz vyladěný — záložky v hlavičce, silueta, výzva k fotce ───────────── */

function Silhouette({ department, small }: { department: string; small?: boolean }) {
  const c = departmentColor(department)
  const sil = c.toUpperCase() === '#FFFFFF' || c === '#F0E100' || c === '#b9cbf3' ? '#0d214f' : c
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: tintOf(c, 0.3) }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 mx-auto h-[80%]" aria-hidden="true">
        <circle cx="50" cy="40" r="19" fill={sil} opacity="0.28" />
        <path d="M14 100 V92 Q14 66 40 64 H60 Q86 66 86 92 V100 Z" fill={sil} opacity="0.28" />
      </svg>
      <span className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-navy/70">{small ? '+ Fotka' : '+ Nahrát fotku'}</span>
    </div>
  )
}

export type HeaderStyle = 'card' | 'compact' | 'light'
export type FormLayout = 'cards' | 'facts' | 'split'

export function AccountCardPlus({ info, tabs, header = 'card', form = 'cards' }: { info: AccountInfo; tabs: TabsProps; header?: HeaderStyle; form?: FormLayout }) {
  const [tab, setTab] = useState('udaje')
  const s = since(info.startDate)
  const light = header === 'light'
  const compact = header === 'compact'
  const avatarSize = compact ? 84 : light ? 120 : 144

  const stats = (
    <dl className="sm:self-end grid grid-cols-[auto_auto] gap-x-5 gap-y-1.5 text-sm">
      <dt className={light ? 'text-navy/50' : 'text-white/50'}>Tým</dt>
      <dd className="font-semibold flex items-center gap-2">
        <span className="w-2.5 h-2.5" style={{ background: departmentColor(info.department), outline: light ? '1px solid rgba(13,33,79,0.2)' : undefined }} />{info.department}
      </dd>
      <dt className={light ? 'text-navy/50' : 'text-white/50'}>Spolupráce</dt><dd className="font-semibold">{EMPLOYMENT[info.employmentType] ?? info.employmentType}</dd>
      {s && <><dt className={light ? 'text-navy/50' : 'text-white/50'}>Ve 4B</dt><dd className="font-semibold">{s.len}</dd></>}
    </dl>
  )

  return (
    <div className={form === 'split' ? 'max-w-5xl mx-auto' : 'max-w-4xl mx-auto'}>
      <section
        className={`relative overflow-hidden mb-6 ${light ? 'bg-white text-navy border border-[rgba(13,33,79,0.14)]' : 'bg-navy text-white'}`}
      >
        <div className={`relative flex flex-col sm:flex-row gap-6 px-7 sm:px-9 ${compact ? 'pt-6 pb-5 sm:items-center' : 'pt-8 sm:pt-9 pb-7'}`}>
          <AvatarUpload initial={info.name[0]} teamMemberId={info.teamMemberId} size={avatarSize} hideGlow fallback={<Silhouette department={info.department} small={compact} />} />
          <div className={`flex flex-col min-w-0 flex-1 ${compact ? 'justify-center' : 'justify-end'}`}>
            {!compact && <p className={`kicker text-[11px] mb-2 ${light ? 'text-navy/50' : 'text-gold'}`}>Můj účet</p>}
            <h1 className={`font-headline leading-[1.0] ${compact ? 'text-[30px]' : 'text-[36px] sm:text-[46px]'}`} style={{ fontWeight: 600 }}>{info.name}</h1>
            <p className={`${light ? 'text-navy/60' : 'text-white/70'} ${compact ? 'text-base mt-1' : 'text-lg mt-1.5'}`}>{info.position}</p>
          </div>
          {stats}
        </div>

        <nav className={`relative flex gap-8 px-7 sm:px-9 border-t overflow-x-auto scrollbar-none ${light ? 'border-[rgba(13,33,79,0.12)] bg-white' : 'border-white/15'}`}>
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setTab(sec.id)}
              className={`py-4 text-sm font-semibold whitespace-nowrap border-b-[3px] transition-colors ${
                tab === sec.id
                  ? (light ? 'border-gold text-navy' : 'border-gold text-white')
                  : (light ? 'border-transparent text-navy/50 hover:text-navy' : 'border-transparent text-white/55 hover:text-white')
              }`}
            >
              {sec.label}
              {sec.id === 'majetek' && info.assetCount > 0 && <span className={`ml-1.5 text-[11px] ${light ? 'text-navy/40' : 'text-white/40'}`}>{info.assetCount}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
          <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
          <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
        </div>
      </section>

      <ProfileTabs {...tabs} activeTab={tab} onTabChange={setTab} hideNav formLayout={form} />
    </div>
  )
}
