'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { plural, PhotoFill, tintOf, useReducedMotion, type PersonView } from './teamPeople'

/**
 * Týmy v řadách: každý tým je jedna řada — vlevo název týmu, vpravo svislé portréty
 * (fotka, jinak silueta) s jménem a pozicí. Řady se objeví při scrollu, najetí ukáže záliby.
 */
export function TeamRows({ people, teams }: { people: PersonView[]; teams: string[] }) {
  const rows = teams
    .map(d => ({ dept: d, people: people.filter(p => p.department === d).sort((a, b) => a.name.localeCompare(b.name, 'cs')) }))
    .filter(t => t.people.length)

  return (
    <div className="bg-white border border-[rgba(13,33,79,0.14)] px-6 lg:px-10 pt-2 pb-4">
      {rows.map((t, i) => <TeamRow key={t.dept} dept={t.dept} people={t.people} index={i} first={i === 0} />)}
    </div>
  )
}

function TeamRow({ dept, people, index, first }: { dept: string; people: PersonView[]; index: number; first: boolean }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const color = people[0].color.toUpperCase() === '#FFFFFF' ? '#0d214f' : people[0].color

  return (
    <section ref={ref} className={`grid lg:grid-cols-[170px_1fr] gap-5 pt-6 pb-6 ${first ? '' : 'border-t border-[rgba(13,33,79,0.14)]'}`}>
      <div style={{ opacity: seen || reduced ? 1 : 0, transform: seen || reduced ? 'none' : 'translateY(10px)', transition: 'opacity .5s ease, transform .6s cubic-bezier(.16,1,.3,1)' }}>
        <span className="block w-4 h-4 mb-3" style={{ background: color }} aria-hidden="true" />
        <h2 className="font-headline text-navy text-[26px] leading-none" style={{ fontWeight: 600 }}>{dept}</h2>
        <p className="text-sm text-navy/55 mt-2">{people.length} {plural(people.length, 'člověk', 'lidé', 'lidí')}</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
        {people.map((p, k) => (
          <Link
            key={p.id}
            href={`/team/${p.id}`}
            className="group block min-w-0"
            style={{
              opacity: seen || reduced ? 1 : 0,
              transform: seen || reduced ? 'none' : 'translateY(16px)',
              transition: `opacity .5s ease ${index * 0 + k * 70}ms, transform .6s cubic-bezier(.16,1,.3,1) ${k * 70}ms`,
            }}
          >
            <div className="relative aspect-[3/4] overflow-hidden" style={{ background: tintOf(p.color, 0.22) }}>
              <PhotoFill p={p} />
              <div className="absolute inset-x-0 bottom-0 bg-white/95 border-t border-[rgba(13,33,79,0.12)] px-2 py-1.5 text-[10px] leading-snug text-navy translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-transform duration-300">
                <span className="kicker text-navy/50 text-[9px] block mb-0.5">Baví mě</span>
                {p.interests.join(', ')}
              </div>
            </div>
            <p className="mt-2 text-center text-[13px] font-semibold text-navy leading-tight truncate group-hover:text-violet transition-colors" title={p.name}>{p.name}</p>
            <p className="mt-1 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-navy/55 leading-tight truncate" title={p.position}>{p.position}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
