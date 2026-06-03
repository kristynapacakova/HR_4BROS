'use client'

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Cake, Briefcase, Anchor } from 'lucide-react'

interface Member {
  id: string
  name: string
  position: string
  department: string
  seniority: string | null
  employmentType: string
  birthday: string | null
  bio: string | null
  emoji: string
}

const SENIORITY_LABEL: Record<string, string> = {
  JUNIOR: 'Junior', MEDIOR: 'Medior', SENIOR: 'Senior', LEAD: 'Lead',
}

const DEPT_BADGE: Record<string, string> = {
  Creative:    'bg-violet/30 text-violet-light',
  Performance: 'bg-sky-500/25 text-sky-300',
  Account:     'bg-amber-500/25 text-amber-300',
  Sales:       'bg-emerald-500/25 text-emerald-300',
  Backoffice:  'bg-white/10 text-white/50',
  HR:          'bg-pink-500/25 text-pink-300',
}

const GRADIENTS = [
  'from-violet to-indigo-800',
  'from-sky-600 to-blue-900',
  'from-emerald-600 to-teal-900',
  'from-amber-500 to-orange-800',
  'from-pink-600 to-rose-900',
  'from-indigo-500 to-violet-800',
]

function avatarGradient(name: string) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length
  return GRADIENTS[idx]
}

function formatBirthday(raw: string | null): string {
  if (!raw) return '—'
  const [, month, day] = raw.split('-')
  const months = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']
  return `${parseInt(day)}. ${months[parseInt(month) - 1]}`
}

function daysUntilBirthday(raw: string | null): number | null {
  if (!raw) return null
  const now = new Date()
  const [, m, d] = raw.split('-').map(Number)
  const next = new Date(now.getFullYear(), m - 1, d)
  if (next < now) next.setFullYear(now.getFullYear() + 1)
  return Math.ceil((next.getTime() - now.getTime()) / 86400000)
}

// ── Rope helpers ────────────────────────────────────────────────────────────

type Pt = { x: number; y: number }

function detectCols(centers: Pt[]): number {
  if (centers.length < 2) return 1
  const firstY = centers[0].y
  const count = centers.filter(c => Math.abs(c.y - firstY) < 24).length
  return count || 1
}

function serpentinePoints(centers: Pt[], cols: number): Pt[] {
  const out: Pt[] = []
  const rows = Math.ceil(centers.length / cols)
  for (let r = 0; r < rows; r++) {
    const slice = centers.slice(r * cols, r * cols + cols)
    out.push(...(r % 2 === 0 ? slice : [...slice].reverse()))
  }
  return out
}

function catmullRomPath(pts: Pt[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

// ── Main component ──────────────────────────────────────────────────────────

export function TeamClient({ members, departments, isAdmin: _isAdmin }: {
  members: Member[]
  departments: string[]
  isAdmin: boolean
}) {
  const [dept, setDept] = useState('Všichni')
  const [selected, setSelected] = useState<number | null>(null)

  const sectionRef = useRef<HTMLDivElement>(null)
  const circleRefs = useRef<(HTMLDivElement | null)[]>([])
  const [ropePath, setRopePath] = useState('')
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })

  const allDepts = ['Všichni', ...departments]
  const filtered = dept === 'Všichni' ? members : members.filter(m => m.department === dept)
  const sorted = [...filtered].sort((a, b) => {
    const da = daysUntilBirthday(a.birthday)
    const db = daysUntilBirthday(b.birthday)
    const aSoon = da !== null && da <= 30
    const bSoon = db !== null && db <= 30
    if (aSoon && !bSoon) return -1
    if (!aSoon && bSoon) return 1
    return a.name.localeCompare(b.name, 'cs')
  })

  const updateRope = useCallback(() => {
    const section = sectionRef.current
    if (!section) return
    setSvgSize({ w: section.offsetWidth, h: section.offsetHeight })
    const rect = section.getBoundingClientRect()
    const centers: Pt[] = circleRefs.current
      .slice(0, sorted.length)
      .map(el => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: r.left - rect.left + r.width / 2, y: r.top - rect.top + r.height / 2 }
      })
      .filter((c): c is Pt => c !== null)
    if (centers.length < 2) { setRopePath(''); return }
    const cols = detectCols(centers)
    setRopePath(catmullRomPath(serpentinePoints(centers, cols)))
  }, [sorted.length])

  useLayoutEffect(() => { updateRope() }, [updateRope, dept])

  useEffect(() => {
    const obs = new ResizeObserver(updateRope)
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [updateRope])

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const member = selected !== null ? sorted[selected] : null

  return (
    <div className="space-y-4">
      {/* Dept filter */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {allDepts.map(d => (
          <button
            key={d}
            onClick={() => { setDept(d); setSelected(null) }}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              dept === d
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white/80 text-slate-500 hover:text-navy hover:bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
            }`}
          >
            {d}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          {sorted.length} {sorted.length === 1 ? 'člen' : sorted.length < 5 ? 'členové' : 'členů'}
        </span>
      </div>

      {/* Navy crew wall */}
      <div
        ref={sectionRef}
        className="relative bg-gradient-to-b from-[#0E2337] to-[#071525] rounded-3xl overflow-hidden"
        style={{ minHeight: 320 }}
      >
        {/* Decorative wave at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Rope SVG — behind grid */}
        {ropePath && (
          <svg
            className="absolute pointer-events-none"
            style={{ top: 0, left: 0, zIndex: 0 }}
            width={svgSize.w}
            height={svgSize.h}
          >
            {/* Shadow */}
            <path d={ropePath} stroke="rgba(0,0,0,0.5)" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Rope base — manila/gold */}
            <path d={ropePath} stroke="#C4A96A" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Rope twist — darker dashes */}
            <path d={ropePath} stroke="#7A5C1E" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="9 7" />
            {/* Rope highlight — thin light line */}
            <path d={ropePath} stroke="rgba(255,220,140,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        {/* Circles grid */}
        <div
          className="relative grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 p-8"
          style={{ zIndex: 1 }}
        >
          {sorted.map((m, i) => {
            const days = daysUntilBirthday(m.birthday)
            const birthdaySoon = days !== null && days <= 7
            const isSelected = selected === i
            const isDimmed = selected !== null && !isSelected
            return (
              <button
                key={m.id}
                onClick={() => setSelected(isSelected ? null : i)}
                className={`flex flex-col items-center gap-2.5 transition-all duration-300 focus:outline-none ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
              >
                {/* Circle */}
                <div
                  ref={el => { circleRefs.current[i] = el }}
                  className={`
                    relative w-16 h-16 sm:w-20 sm:h-20 rounded-full
                    bg-gradient-to-br ${avatarGradient(m.name)}
                    flex items-center justify-center
                    shadow-[0_4px_20px_rgba(0,0,0,0.4)]
                    transition-all duration-200
                    ${isSelected
                      ? 'ring-[3px] ring-amber-400 ring-offset-2 ring-offset-[#0E2337] scale-110 shadow-[0_0_24px_rgba(251,191,36,0.4)]'
                      : 'hover:scale-105 hover:ring-2 hover:ring-violet-light/50 hover:ring-offset-1 hover:ring-offset-[#0E2337]'}
                  `}
                >
                  <span className="text-3xl sm:text-4xl select-none drop-shadow">{m.emoji}</span>
                  {birthdaySoon && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] shadow-md">
                      🎂
                    </span>
                  )}
                </div>
                {/* First name */}
                <span className={`text-[11px] font-medium text-center leading-tight transition-colors ${isSelected ? 'text-amber-300' : 'text-white/60'}`}>
                  {m.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Anchor decoration bottom-right */}
        <div className="absolute bottom-4 right-5 opacity-[0.06]">
          <Anchor className="w-10 h-10 text-white" />
        </div>

        {/* Detail overlay */}
        {member !== null && selected !== null && (
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8" style={{ zIndex: 20 }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#071525]/70 backdrop-blur-[2px]" onClick={() => setSelected(null)} />

            {/* Detail card */}
            <div className="relative w-full max-w-xs bg-[#0E2337]/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${avatarGradient(member.name)} px-6 pt-8 pb-6 flex flex-col items-center gap-3 relative`}>
                {/* Nav arrows */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                  <button
                    className={`pointer-events-auto w-8 h-8 rounded-full bg-navy/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors ${selected <= 0 ? 'opacity-0' : ''}`}
                    onClick={e => { e.stopPropagation(); setSelected(selected - 1) }}
                    disabled={selected <= 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className={`pointer-events-auto w-8 h-8 rounded-full bg-navy/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors ${selected >= sorted.length - 1 ? 'opacity-0' : ''}`}
                    onClick={e => { e.stopPropagation(); setSelected(selected + 1) }}
                    disabled={selected >= sorted.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-6xl drop-shadow-xl select-none">{member.emoji}</span>
                <div className="text-center">
                  <h2 className="font-headline font-semibold text-white text-lg leading-tight">{member.name}</h2>
                  <p className="text-white/60 text-sm mt-0.5">{member.position}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${DEPT_BADGE[member.department] ?? 'bg-white/10 text-white/60'}`}>
                    {member.department}
                  </span>
                  {member.seniority && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-navy/40 text-white/60">
                      {SENIORITY_LABEL[member.seniority]}
                    </span>
                  )}
                </div>

                {/* Close */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-navy/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-3 border-t border-white/[0.07]">
                {member.bio && (
                  <p className="text-white/60 text-sm leading-relaxed">{member.bio}</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.05] rounded-2xl px-3 py-2.5">
                    <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest mb-1">Narozeniny</p>
                    <div className="flex items-center gap-1.5">
                      <Cake className={`w-3 h-3 flex-shrink-0 ${daysUntilBirthday(member.birthday) !== null && daysUntilBirthday(member.birthday)! <= 30 ? 'text-amber-400' : 'text-white/30'}`} />
                      <p className="text-white/70 text-xs font-medium">{formatBirthday(member.birthday)}</p>
                    </div>
                    {(() => {
                      const d = daysUntilBirthday(member.birthday)
                      return d !== null && d <= 30 ? (
                        <p className="text-amber-400 text-[10px] mt-0.5 font-semibold">{d === 0 ? '🎂 Dnes!' : `za ${d} dní`}</p>
                      ) : null
                    })()}
                  </div>
                  <div className="bg-white/[0.05] rounded-2xl px-3 py-2.5">
                    <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest mb-1">Spolupráce</p>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-white/30 flex-shrink-0" />
                      <p className="text-white/70 text-xs font-medium">{member.employmentType}</p>
                    </div>
                  </div>
                </div>

                {/* Position indicator */}
                <div className="flex justify-center gap-1 pt-1">
                  {sorted.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={`rounded-full transition-all duration-150 ${i === selected ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
