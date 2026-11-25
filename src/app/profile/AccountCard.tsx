'use client'

import { useState, type ComponentProps } from 'react'
import { useSearchParams } from 'next/navigation'
import { HERO_PHOTO } from '@/app/dashboard/EmployeeDashboard'
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
  /** smlouva na dobu určitou / neurčitou a případný konec */
  contractTermType?: 'URCITA' | 'NEURCITA' | null
  contractEndDate?: string | null
  teamMemberId?: string
  assetCount: number
}

const SECTIONS = [
  { id: 'udaje', label: 'Osobní údaje' },
  { id: 'majetek', label: 'Majetek' },
  { id: 'vyplata', label: 'Moje odměna' },
  { id: 'dokumenty', label: 'Dokumenty' },
] as const



const EMPLOYMENT_LABEL: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'IČO', STAZ: 'Stáž' }
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ')


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

  return (
    <div className="w-full">
      <section className="relative bg-navy text-white overflow-hidden mb-6 min-h-[256px] flex flex-col">
        <div className="relative flex-1 flex flex-col sm:flex-row sm:items-start gap-6 px-7 sm:px-9 pt-6 pb-4">
          {/* fotka + jméno — stejná pozice a velikost jako na Dashboardu, ať přechod neposkočí */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <div className="flex items-end gap-6 min-w-0">
              <AvatarUpload initial={info.name[0] ?? '?'} teamMemberId={info.teamMemberId} size={HERO_PHOTO} hideGlow fallback={<Silhouette department={info.department} />} />
              <div className="min-w-0">
                <p className="kicker text-gold text-[11px] mb-2">Můj účet</p>
                <h1 className="font-headline text-[34px] sm:text-[38px] leading-[1.05]" style={{ fontWeight: 600 }}>{info.name}</h1>
                <p className="text-white/65 text-[15px] mt-1.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 flex-shrink-0" style={{ background: departmentColor(info.department) }} aria-hidden="true" />
                  {/* pozice a tým jen jednou, když se jmenují stejně (Account Manager · Account manager) */}
                  {info.position && info.department && info.position.toLowerCase() !== info.department.toLowerCase()
                    ? `${info.position} · ${info.department}`
                    : info.position || info.department}
                </p>
              </div>
            </div>
            {/* typ spolupráce, nástup a smlouva — místo bočního panelu */}
            <div className="flex flex-wrap gap-2">
              {[
                { k: 'Spolupráce', v: EMPLOYMENT_LABEL[info.employmentType] ?? info.employmentType },
                info.startDate ? { k: 'Nástup', v: fmtDate(info.startDate) } : null,
                info.contractTermType === 'URCITA' && info.contractEndDate
                  ? { k: 'Smlouva', v: `do ${fmtDate(info.contractEndDate)}` }
                  : info.contractTermType ? { k: 'Smlouva', v: 'na dobu neurčitou' } : null,
              ].filter(Boolean).map((c, i) => (
                <span key={c!.k} className={`px-3 py-1.5 text-sm ${i === 0 ? 'bg-gold text-navy font-semibold' : 'bg-white/10 text-white'}`}>
                  {i > 0 && <span className="text-white/55 mr-1.5">{c!.k}</span>}
                  <span className={i > 0 ? 'font-semibold' : ''}>{c!.v}</span>
                </span>
              ))}
            </div>
          </div>
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
