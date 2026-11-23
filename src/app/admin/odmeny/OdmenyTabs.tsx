'use client'

import { Fragment, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface PayslipRow {
  id: string
  personId: string
  name: string
  email: string
  employmentType: string
  grossAmount: number
  netAmount: number
  month: number
  year: number
  currency: string
  planned?: boolean
}

interface OdmenyTabsProps {
  payslips: PayslipRow[]
}

const MONTH_NAMES = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const MONTH_SHORT = ['led','úno','bře','dub','kvě','čvn','čvc','srp','zář','říj','lis','pro']

const TYPE_LABEL: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'OSVČ' }
const TYPE_ORDER = ['HPP', 'DPC', 'DPP', 'ICO']
const TYPE_BADGE: Record<string, string> = {
  HPP: 'bg-navy/10 text-navy',
  DPP: 'bg-mint-tint text-mint-dark',
  DPC: 'bg-violet/10 text-violet',
  ICO: 'bg-gold-tint text-navy',
}

// Brand paleta pro sloupcové grafy
const C_NAVY = '#0d214f'
const C_GOLD = '#F0E100'
const C_PLANNED = '#b9cbf3' // navy-200
const C_EMPTY = '#e8eaf2'   // navy-100

function formatCurrency(amount: number, currency = 'CZK') {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

interface PersonYear {
  personId: string
  name: string
  email: string
  employmentType: string
  currency: string
  /** index 0..11 = leden..prosinec */
  months: (PayslipRow | null)[]
  totalGross: number
  totalNet: number
  avgGross: number
  avgNet: number
  paidMonths: number
  plannedMonths: number
  /** Index zvýrazněného (posledního) měsíce */
  latestIdx: number
}

function buildPeople(rows: PayslipRow[]): PersonYear[] {
  const map = new Map<string, PersonYear>()
  for (const r of rows) {
    let p = map.get(r.personId)
    if (!p) {
      p = {
        personId: r.personId, name: r.name, email: r.email, employmentType: r.employmentType,
        currency: r.currency, months: Array(12).fill(null),
        totalGross: 0, totalNet: 0, avgGross: 0, avgNet: 0, paidMonths: 0, plannedMonths: 0, latestIdx: -1,
      }
      map.set(r.personId, p)
    }
    p.months[r.month - 1] = r
    p.totalGross += r.grossAmount
    p.totalNet += r.netAmount
    if (r.planned) p.plannedMonths++
    else p.paidMonths++
  }
  return Array.from(map.values()).map(p => {
    const count = p.months.filter(Boolean).length || 1
    // Nejnovější vyplacený měsíc; když je celý rok jen plán, poslední plánovaný.
    let latestIdx = -1
    for (let i = 11; i >= 0; i--) if (p.months[i] && !p.months[i]!.planned) { latestIdx = i; break }
    if (latestIdx < 0) for (let i = 11; i >= 0; i--) if (p.months[i]) { latestIdx = i; break }
    return { ...p, avgGross: p.totalGross / count, avgNet: p.totalNet / count, latestIdx }
  })
}

function MonthBars({ person, max, width = 108, height = 28 }: { person: PersonYear; max: number; width?: number; height?: number }) {
  const slot = width / 12
  const barW = Math.max(2, slot - 2)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block">
      {person.months.map((m, i) => {
        const x = i * slot + (slot - barW) / 2
        if (!m) return <rect key={i} x={x} y={height - 2} width={barW} height={2} fill={C_EMPTY} />
        const h = Math.max(2, (m.grossAmount / (max || 1)) * height)
        const fill = i === person.latestIdx ? C_GOLD : m.planned ? C_PLANNED : C_NAVY
        return <rect key={i} x={x} y={height - h} width={barW} height={h} fill={fill} shapeRendering="crispEdges" />
      })}
    </svg>
  )
}

export function OdmenyTabs({ payslips }: OdmenyTabsProps) {
  const years = useMemo(
    () => Array.from(new Set(payslips.map(p => p.year))).sort((a, b) => b - a),
    [payslips]
  )
  const [year, setYear] = useState<number | null>(years[0] ?? null)
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  const people = useMemo(() => {
    const list = buildPeople(payslips.filter(p => p.year === year))
    return list.sort((a, b) =>
      (TYPE_ORDER.indexOf(a.employmentType) - TYPE_ORDER.indexOf(b.employmentType)) ||
      a.name.localeCompare(b.name, 'cs'))
  }, [payslips, year])

  const typesPresent = TYPE_ORDER.filter(t => people.some(p => p.employmentType === t))
  const visible = typeFilter === 'ALL' ? people : people.filter(p => p.employmentType === typeFilter)
  // Společné měřítko sparklinů, aby šly lidi mezi sebou porovnat.
  const maxMonth = Math.max(1, ...visible.flatMap(p => p.months.map(m => m?.grossAmount ?? 0)))
  const sumGross = visible.reduce((s, p) => s + p.totalGross, 0)
  const sumNet = visible.reduce((s, p) => s + p.totalNet, 0)
  const anyPlanned = visible.some(p => p.plannedMonths > 0)

  const toggle = (id: string) => setExpanded(e => (e === id ? null : id))

  return (
    <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-headline text-navy" style={{ fontWeight: 600 }}>
          Přehled výplat <span className="text-slate-400">· {visible.length} {visible.length === 1 ? 'člověk' : visible.length < 5 ? 'lidé' : 'lidí'}</span>
        </h3>
        <div className="flex gap-1 bg-slate-50 p-1">
          {years.map(y => (
            <button
              key={y}
              onClick={() => { setYear(y); setExpanded(null) }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                year === y ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="kicker">Hrubé za rok {year}</p>
            <p className="font-headline text-xl text-navy" style={{ fontWeight: 600 }}>{formatCurrency(sumGross)}</p>
          </div>
          <div>
            <p className="kicker">Čisté za rok {year}</p>
            <p className="font-headline text-xl text-navy" style={{ fontWeight: 600 }}>{formatCurrency(sumNet)}</p>
          </div>
        </div>
        {typesPresent.length > 1 && (
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filtr podle typu smlouvy">
            {['ALL', ...typesPresent].map(t => {
              const count = t === 'ALL' ? people.length : people.filter(p => p.employmentType === t).length
              const active = typeFilter === t
              return (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setExpanded(null) }}
                  aria-pressed={active}
                  className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                    active ? 'bg-navy text-white border-navy' : 'bg-white text-slate-500 border-slate-200 hover:text-navy'
                  }`}
                >
                  {t === 'ALL' ? 'Všichni' : TYPE_LABEL[t] ?? t} <span className={active ? 'text-white/60' : 'text-slate-400'}>{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy">
              <th className="text-left px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Člověk</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Typ</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Led – Pro</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Hrubá / rok</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Čistá / rok</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Průměr / měs.</th>
              <th className="w-10 px-2 py-3"><span className="sr-only">Rozbalit</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">Pro rok {year} nejsou žádné výplaty.</td></tr>
            )}
            {visible.map(p => {
              const open = expanded === p.personId
              return (
                <Fragment key={p.personId}>
                  <tr
                    onClick={() => toggle(p.personId)}
                    className={`cursor-pointer transition-colors ${open ? 'bg-alice' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggle(p.personId) }}
                        aria-expanded={open}
                        aria-controls={`odmeny-${p.personId}`}
                        className="text-left"
                      >
                        <span className="block font-medium text-navy">{p.name}</span>
                        <span className="block text-xs text-slate-400">{p.email}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[p.employmentType] ?? 'bg-slate-50 text-slate-600'}`}>
                        {TYPE_LABEL[p.employmentType] ?? p.employmentType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <MonthBars person={p} max={maxMonth} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">{formatCurrency(p.totalGross, p.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-navy whitespace-nowrap">{formatCurrency(p.totalNet, p.currency)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="block text-navy">{formatCurrency(p.avgNet, p.currency)}</span>
                      <span className="block text-xs text-slate-400">hrubá {formatCurrency(p.avgGross, p.currency)}</span>
                    </td>
                    <td className="px-2 py-3 text-slate-400">
                      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180 text-navy' : ''}`} />
                    </td>
                  </tr>
                  {open && (
                    <tr id={`odmeny-${p.personId}`} className="bg-alice">
                      <td colSpan={7} className="px-6 pb-5 pt-1">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <p className="kicker">Měsíční rozpis {year}</p>
                          <p className="text-xs text-slate-500">
                            {p.paidMonths} vyplaceno{p.plannedMonths > 0 && ` · ${p.plannedMonths} plán`}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-[rgba(13,33,79,0.10)] border border-[rgba(13,33,79,0.10)]">
                          {p.months.map((m, i) => {
                            const isLatest = i === p.latestIdx
                            return (
                              <div key={i} className={`bg-white px-3 py-2.5 ${isLatest ? 'border-t-4 border-gold' : 'border-t-4 border-transparent'}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-slate-500">{MONTH_NAMES[i]}</span>
                                  {m?.planned && <span className="text-[10px] uppercase tracking-wider text-navy-400">plán</span>}
                                </div>
                                {m ? (
                                  <>
                                    <p className="text-navy font-semibold mt-0.5">{formatCurrency(m.netAmount, m.currency)}</p>
                                    <p className="text-xs text-slate-400">hrubá {formatCurrency(m.grossAmount, m.currency)}</p>
                                  </>
                                ) : (
                                  <p className="text-slate-300 mt-0.5">—</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5" style={{ background: C_NAVY }} />vyplaceno</span>
        {anyPlanned && <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5" style={{ background: C_PLANNED }} />plán</span>}
        <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5" style={{ background: C_GOLD }} />poslední měsíc</span>
        <span className="text-slate-400">Sloupce mají společné měřítko ({formatCurrency(maxMonth)} = plná výška). Kliknutím na řádek zobrazíte měsíční rozpis.</span>
      </div>
    </div>
  )
}
