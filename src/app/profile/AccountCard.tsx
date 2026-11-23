'use client'

import { useState, type ComponentProps } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProfileTabs } from './ProfileTabs'
import { AvatarUpload } from '@/components/AvatarUpload'
import { departmentColor } from '@/lib/team-colors'
import { tintOf } from '@/app/team/teamPeople'

/**
 * Můj účet — „průkaz“: navy hlavička s fotkou (nebo siluetou na odstínu barvy týmu),
 * jménem, pozicí a krátkým přehledem; záložky jsou součástí hlavičky.
 * Formulář: vlevo to, co si člověk vyplňuje sám, vpravo karta s údaji spravovanými HR.
 */

export interface AccountInfo {
  name: string
  position: string
  department: string
  employmentType: string
  startDate: string | null
  teamMemberId?: string
  assetCount: number
}

const SECTIONS = [
  { id: 'udaje', label: 'Osobní údaje' },
  { id: 'majetek', label: 'Majetek' },
  { id: 'vyplata', label: 'Moje odměna' },
  { id: 'dokumenty', label: 'Dokumenty' },
] as const

const EMPLOYMENT: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'OSVČ' }

function tenure(raw: string | null) {
  if (!raw) return null
  const d = new Date(raw)
  const now = new Date()
  const m = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
  const y = Math.floor(m / 12), r = m % 12
  const yl = y === 0 ? '' : y === 1 ? '1 rok' : y < 5 ? `${y} roky` : `${y} let`
  const ml = r === 0 ? '' : r === 1 ? '1 měsíc' : r < 5 ? `${r} měsíce` : `${r} měsíců`
  return [yl, ml].filter(Boolean).join(' ') || 'pár dní'
}

function Silhouette({ department }: { department: string }) {
  const c = departmentColor(department)
  const sil = c.toUpperCase() === '#FFFFFF' || c === '#F0E100' || c === '#b9cbf3' ? '#0d214f' : c
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: tintOf(c, 0.3) }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 mx-auto h-[80%]" aria-hidden="true">
        <circle cx="50" cy="40" r="19" fill={sil} opacity="0.28" />
        <path d="M14 100 V92 Q14 66 40 64 H60 Q86 66 86 92 V100 Z" fill={sil} opacity="0.28" />
      </svg>
      <span className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-navy/70">+ Nahrát fotku</span>
    </div>
  )
}

export function AccountCard({ info, tabs }: { info: AccountInfo; tabs: ComponentProps<typeof ProfileTabs> }) {
  const requested = useSearchParams().get('tab')
  const [tab, setTab] = useState<string>(SECTIONS.some(s => s.id === requested) ? requested! : 'udaje')
  const len = tenure(info.startDate)

  return (
    <div className="max-w-5xl mx-auto">
      <section className="relative bg-navy text-white overflow-hidden mb-6">
        <div className="relative flex flex-col sm:flex-row gap-6 px-7 sm:px-9 pt-8 sm:pt-9 pb-7">
          <AvatarUpload initial={info.name[0] ?? '?'} teamMemberId={info.teamMemberId} size={144} hideGlow fallback={<Silhouette department={info.department} />} />
          <div className="flex flex-col justify-end min-w-0 flex-1">
            <p className="kicker text-gold text-[11px] mb-2">Můj účet</p>
            <h1 className="font-headline text-[36px] sm:text-[46px] leading-[1.0]" style={{ fontWeight: 600 }}>{info.name}</h1>
            <p className="text-white/70 text-lg mt-1.5">{info.position}</p>
          </div>
          <dl className="sm:self-end grid grid-cols-[auto_auto] gap-x-5 gap-y-1.5 text-sm">
            <dt className="text-white/50">Tým</dt>
            <dd className="font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5" style={{ background: departmentColor(info.department) }} />{info.department}
            </dd>
            <dt className="text-white/50">Spolupráce</dt>
            <dd className="font-semibold">{EMPLOYMENT[info.employmentType] ?? info.employmentType}</dd>
            {len && <><dt className="text-white/50">Ve 4B</dt><dd className="font-semibold">{len}</dd></>}
          </dl>
        </div>

        <nav className="relative flex gap-8 px-7 sm:px-9 border-t border-white/15 overflow-x-auto scrollbar-none">
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setTab(sec.id)}
              className={`py-4 text-sm font-semibold whitespace-nowrap border-b-[3px] transition-colors ${tab === sec.id ? 'border-gold text-white' : 'border-transparent text-white/55 hover:text-white'}`}
            >
              {sec.label}
              {sec.id === 'majetek' && info.assetCount > 0 && <span className="ml-1.5 text-[11px] text-white/40">{info.assetCount}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
          <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
          <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
        </div>
      </section>

      <ProfileTabs {...tabs} activeTab={tab} onTabChange={setTab} hideNav formLayout="split" />
    </div>
  )
}
