'use client'

import { useEffect, useState } from 'react'
import { departmentColor } from '@/lib/team-colors'

/**
 * Hlavička stránky Tým: každý člověk je jeden barevný pixel. Při načtení se
 * pixely z rozházených pozic seběhnou do sloupců podle týmů (4B „schody“).
 * Přehraje se při každém příchodu na stránku (~1,5 s). Kliknutím na sloupec se vyfiltruje tým.
 */

export type HeroMember = { id: string; name: string; department: string; birthdayInDays: number | null }

const SQ = 22
const SQ_GAP = 4
const COL_W = 118
const COL_GAP = 10
const CHART_H = 160

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function plural(n: number, one: string, few: string, many: string) {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many
}

export function TeamHero({ members, departments, active = 'Všichni', onPick }: {
  members: HeroMember[]
  departments: string[]
  /** Volitelný filtr — bez onPick je hlavička čistě dekorativní (jen animace). */
  active?: string
  onPick?: (dept: string) => void
}) {
  const [placed, setPlaced] = useState(false)
  const [instant, setInstant] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setInstant(true)
      setPlaced(true)
      return
    }
    const t = setTimeout(() => setPlaced(true), 80)
    const t2 = setTimeout(() => setInstant(true), 2600) // po doběhnutí už jen rychlé přechody při filtrování
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  const cols = departments
    .map(d => ({ dept: d, color: departmentColor(d), people: members.filter(m => m.department === d) }))
    .filter(c => c.people.length > 0)
  const chartW = cols.length * COL_W + (cols.length - 1) * COL_GAP
  const rnd = seeded(7)

  const next = members
    .filter(m => m.birthdayInDays !== null)
    .sort((a, b) => (a.birthdayInDays! - b.birthdayInDays!))[0]

  let k = 0
  return (
    <div className="relative bg-navy text-white overflow-hidden">
      <div className="absolute inset-0 grid-4x4 pointer-events-none" />
      <div className="relative flex flex-col xl:flex-row xl:items-end justify-between gap-6 xl:gap-8 p-6 lg:p-8">
        <div className="min-w-[260px] max-w-md">
          <p className="kicker text-gold text-[11px] mb-3">Tým Four Bros</p>
          <h2 className="font-headline text-[30px] leading-[1.1] mb-3" style={{ fontWeight: 600 }}>
            {members.length} {plural(members.length, 'člověk', 'lidé', 'lidí')}. {cols.length} {plural(cols.length, 'tým', 'týmy', 'týmů')}.
            <br />
            <span style={{ fontWeight: 400 }}>Jedna parta.</span>
          </h2>
          {next && (
            <p className="text-sm text-white/70">
              Nejbližší narozeniny: <span className="text-white font-semibold">{next.name.split(' ')[0]}</span>{' '}
              {next.birthdayInDays === 0 ? <span className="text-gold font-semibold">— dnes!</span> : <>za {next.birthdayInDays} {plural(next.birthdayInDays!, 'den', 'dny', 'dní')}</>}
            </p>
          )}
        </div>

        {/* pixelové sloupce týmů */}
        <div className="max-w-full overflow-x-auto scrollbar-none self-start xl:self-auto">
        <div className="relative flex-shrink-0" style={{ width: chartW, height: CHART_H + 30 }}>
          {cols.map((c, ci) => {
            const x0 = ci * (COL_W + COL_GAP)
            const isActive = active === c.dept
            const dim = active !== 'Všichni' && !isActive
            return (
              <div
                key={c.dept}
                role={onPick ? 'button' : undefined}
                tabIndex={onPick ? 0 : undefined}
                onClick={onPick ? () => onPick(isActive ? 'Všichni' : c.dept) : undefined}
                className={`absolute group ${onPick ? 'cursor-pointer' : ''}`}
                style={{ left: x0, top: 0, width: COL_W, height: CHART_H + 30 }}
                aria-label={onPick ? `Zobrazit tým ${c.dept}` : undefined}
              >
                <span
                  className="absolute left-0 right-0 text-[10px] font-bold uppercase tracking-[0.02em] text-center whitespace-nowrap transition-colors"
                  style={{ bottom: 0, color: isActive ? '#F0E100' : dim ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)', opacity: placed ? 1 : 0, transition: instant ? 'color .2s' : `opacity .4s ease ${900 + ci * 60}ms, color .2s` }}
                >
                  {c.dept}
                </span>
                <span
                  className="absolute left-0 right-0 transition-opacity"
                  style={{ bottom: 22, height: 2, background: '#F0E100', opacity: isActive ? 1 : 0 }}
                />
              </div>
            )
          })}

          {cols.flatMap((c, ci) => {
            const x0 = ci * (COL_W + COL_GAP)
            const perRow = 1
            const dim = active !== 'Všichni' && active !== c.dept
            return c.people.map((p, pi) => {
              const idx = k++
              const row = Math.floor(pi / perRow)
              const col = pi % perRow
              const fx = x0 + col * (SQ + SQ_GAP) + (COL_W - perRow * (SQ + SQ_GAP) + SQ_GAP) / 2
              const fy = CHART_H - (row + 1) * (SQ + SQ_GAP)
              const sx = rnd() * (chartW - SQ)
              const sy = rnd() * (CHART_H - SQ) - 40
              const rot = (rnd() - 0.5) * 180
              const soon = p.birthdayInDays !== null && p.birthdayInDays <= 7
              return (
                <span
                  key={p.id}
                  title={p.name}
                  className={`absolute pointer-events-none ${soon ? 'animate-pulse' : ''}`}
                  style={{
                    width: SQ, height: SQ,
                    background: c.color,
                    left: placed ? fx : sx,
                    top: placed ? fy : sy,
                    transform: placed ? 'rotate(0deg) scale(1)' : `rotate(${rot}deg) scale(.4)`,
                    opacity: placed ? (dim ? 0.25 : 1) : 0,
                    outline: soon ? '2px solid #F0E100' : 'none',
                    outlineOffset: 2,
                    transition: instant
                      ? 'opacity .2s ease'
                      : `left .9s cubic-bezier(.16,1,.3,1) ${idx * 45}ms, top .9s cubic-bezier(.16,1,.3,1) ${idx * 45}ms, transform .9s cubic-bezier(.16,1,.3,1) ${idx * 45}ms, opacity .35s ease ${idx * 45}ms`,
                  }}
                />
              )
            })
          })}
        </div>
        </div>
      </div>
      {/* rožky */}
      <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
        <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
        <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
      </div>
    </div>
  )
}
