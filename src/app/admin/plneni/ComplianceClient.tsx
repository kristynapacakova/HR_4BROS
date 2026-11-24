'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { DEMO_TEAM } from '@/lib/mock-data'
import { Avatar, personView, plural, useProfiles } from '@/app/team/teamPeople'
import type { BozpState, ContractState, Issue } from '@/lib/hr/model'

export interface ComplianceRow {
  id: string
  contract: { state: ContractState; endsAt: string | null; daysLeft: number | null; template: string | null }
  directives: { required: number; acknowledged: number; missing: string[] }
  bozp: { state: BozpState; validUntil: string | null; daysLeft: number | null }
  issues: Issue[]
}

type Filter = 'all' | 'issues' | 'contracts' | 'directives' | 'bozp' | 'photo'

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('cs-CZ') : '')
const days = (n: number) => `${n} ${plural(n, 'den', 'dny', 'dní')}`

/** Barevný stav buňky: hotovo (mint) · brzy (gold) · chybí (navy) */
function Chip({ tone, children, title }: { tone: 'ok' | 'soon' | 'bad' | 'muted'; children: ReactNode; title?: string }) {
  const cls = tone === 'ok' ? 'bg-mint text-navy' : tone === 'soon' ? 'bg-gold text-navy' : tone === 'bad' ? 'bg-navy text-white' : 'bg-alice text-navy/60'
  return <span title={title} className={`inline-block text-[11px] font-bold uppercase tracking-[0.04em] px-2 py-1 whitespace-nowrap ${cls}`}>{children}</span>
}

function ContractCell({ c }: { c: ComplianceRow['contract'] }) {
  switch (c.state) {
    case 'TO_SIGN_PERSON': return <Chip tone="bad">Čeká na jeho podpis</Chip>
    case 'TO_SIGN_COMPANY': return <Chip tone="bad">Čeká na podpis vedení</Chip>
    case 'DRAFT': return <Chip tone="muted">Rozpracovaná</Chip>
    case 'NONE': return <Chip tone="bad">Bez smlouvy</Chip>
    case 'ENDED': return <Chip tone="bad">Skončila {fmt(c.endsAt)}</Chip>
    case 'ENDING': return <Chip tone="soon" title={`Končí ${fmt(c.endsAt)}`}>Končí za {days(c.daysLeft!)}</Chip>
    default: return c.endsAt ? <span className="text-[12px] text-navy/60">✓ do {fmt(c.endsAt)}</span> : <span className="text-[12px] text-navy/60">✓ na dobu neurčitou</span>
  }
}

function BozpCell({ b }: { b: ComplianceRow['bozp'] }) {
  switch (b.state) {
    case 'MISSING': return <Chip tone="bad">Neabsolvováno</Chip>
    case 'EXPIRED': return <Chip tone="bad">Propadlé {fmt(b.validUntil)}</Chip>
    case 'EXPIRING': return <Chip tone="soon" title={`Platí do ${fmt(b.validUntil)}`}>Vyprší za {days(b.daysLeft!)}</Chip>
    default: return <span className="text-[12px] text-navy/60">✓ do {fmt(b.validUntil)}</span>
  }
}

export function ComplianceClient({ rows }: { rows: ComplianceRow[] }) {
  const profiles = useProfiles()
  const [filter, setFilter] = useState<Filter>('issues')
  const person = (id: string) => { const m = DEMO_TEAM.find(x => x.id === id)!; return personView(m, profiles[m.id]) }

  const hasPhoto = (id: string) => !!profiles[id]?.photo
  const is = {
    contracts: (r: ComplianceRow) => r.issues.some(i => i.kind.startsWith('CONTRACT')),
    directives: (r: ComplianceRow) => r.directives.missing.length > 0,
    bozp: (r: ComplianceRow) => r.bozp.state !== 'OK',
    photo: (r: ComplianceRow) => !hasPhoto(r.id),
  }
  // fotka je jen doporučení — do „nesplněného“ se nepočítá
  const anyIssue = (r: ComplianceRow) => r.issues.length > 0

  const counts = useMemo(() => ({
    contracts: rows.filter(is.contracts).length,
    directives: rows.filter(is.directives).length,
    bozp: rows.filter(is.bozp).length,
    photo: rows.filter(is.photo).length,
    issues: rows.filter(anyIssue).length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [rows, profiles])

  const visible = rows.filter(r =>
    filter === 'all' ? true : filter === 'issues' ? anyIssue(r) : is[filter](r),
  ).sort((a, b) => b.issues.length - a.issues.length)

  const tiles: { k: Filter; label: string; n: number; hint: string }[] = [
    { k: 'contracts', label: 'Smlouvy', n: counts.contracts, hint: 'k podpisu nebo končí' },
    { k: 'directives', label: 'Směrnice', n: counts.directives, hint: 'někdo nepotvrdil' },
    { k: 'bozp', label: 'BOZP', n: counts.bozp, hint: 'chybí, propadlé, brzy' },
    { k: 'photo', label: 'Fotka', n: counts.photo, hint: 'bez fotky v Týmu' },
  ]

  return (
    <div className="space-y-5">
      {/* souhrn — kliknutím filtruje */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map(t => (
          <button key={t.k} type="button" onClick={() => setFilter(f => (f === t.k ? 'issues' : t.k))}
            className={`text-left p-5 border transition-colors ${filter === t.k ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-[rgba(13,33,79,0.14)] hover:border-navy'}`}>
            <p className={`kicker ${filter === t.k ? 'text-gold' : 'text-navy/55'}`}>{t.label}</p>
            <p className="font-headline text-[32px] leading-none mt-2" style={{ fontWeight: 600 }}>{t.n}</p>
            <p className={`text-xs mt-1 ${filter === t.k ? 'text-white/60' : 'text-navy/55'}`}>{plural(t.n, 'člověk', 'lidé', 'lidí')} · {t.hint}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1 text-sm">
        {([['issues', `S něčím nesplněným (${counts.issues})`], ['all', `Všichni (${rows.length})`]] as [Filter, string][]).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`px-3 py-1.5 font-semibold border ${filter === k ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-[rgba(13,33,79,0.14)] hover:border-navy'}`}>{l}</button>
        ))}
        {!['issues', 'all'].includes(filter) && <span className="ml-2 text-navy/55">Filtr: {tiles.find(t => t.k === filter)?.label} · <button className="underline" onClick={() => setFilter('issues')}>zrušit</button></span>}
      </div>

      <section className="bg-white border border-[rgba(13,33,79,0.14)] overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="bg-navy text-white text-left">
              {['Člověk', 'Smlouva', 'Směrnice', 'BOZP', 'Fotka'].map(h => <th key={h} className="px-4 py-3 kicker text-white/70 font-bold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-navy/60">Všechno splněno ✓</td></tr>
            )}
            {visible.map(r => {
              const p = person(r.id)
              return (
                <tr key={r.id} className="border-t border-[rgba(13,33,79,0.08)] hover:bg-alice/40">
                  <td className="px-4 py-3">
                    <Link href={`/team/${r.id}`} className="flex items-center gap-3 group">
                      <Avatar p={p} size={36} fontSize={12} />
                      <span className="min-w-0">
                        <span className="block font-semibold text-navy group-hover:text-violet truncate">{p.name}</span>
                        <span className="block text-[11px] text-navy/55 truncate">{p.position} · {p.department}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><ContractCell c={r.contract} /></td>
                  <td className="px-4 py-3">
                    {r.directives.missing.length === 0
                      ? <span className="text-[12px] text-navy/60">✓ {r.directives.acknowledged}/{r.directives.required}</span>
                      : <Chip tone="bad" title={`Chybí: ${r.directives.missing.join(', ')}`}>{r.directives.acknowledged}/{r.directives.required} potvrzeno</Chip>}
                  </td>
                  <td className="px-4 py-3"><BozpCell b={r.bozp} /></td>
                  <td className="px-4 py-3">{hasPhoto(r.id) ? <span className="text-[12px] text-navy/60">✓</span> : <Chip tone="muted">Chybí</Chip>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-navy/50">
        Pravidla: BOZP platí 12 měsíců a upozorňujeme 30 dní předem · konec smlouvy na dobu určitou hlídáme 90 dní předem · povinné směrnice musí potvrdit každý.
        Nastavují se v <code>src/lib/hr/model.ts</code>.
      </p>
    </div>
  )
}
