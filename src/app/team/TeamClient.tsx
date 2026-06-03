'use client'

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Cake, Briefcase } from 'lucide-react'

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

const DEPT_COLORS: Record<string, string> = {
  Creative:    'bg-violet/10 text-violet',
  Performance: 'bg-sky-100 text-sky-700',
  Account:     'bg-amber-100 text-amber-700',
  Sales:       'bg-emerald-100 text-emerald-700',
  Backoffice:  'bg-slate-100 text-slate-600',
  HR:          'bg-pink-100 text-pink-700',
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

type Pt = { x: number; y: number }

function detectCols(centers: Pt[]): number {
  if (centers.length < 2) return 1
  const firstY = centers[0].y
  return Math.max(1, centers.filter(c => Math.abs(c.y - firstY) < 24).length)
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
    if (da !== null && da <= 30 && !(db !== null && db <= 30)) return -1
    if (db !== null && db <= 30 && !(da !== null && da <= 30)) return 1
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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
              dept === d
                ? 'bg-violet text-white border-violet shadow-sm'
                : 'bg-white text-navy/60 border-slate-200 hover:border-violet/40 hover:text-navy'
            }`}
          >
            {d}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          {sorted.length} {sorted.length === 1 ? 'člen' : sorted.length < 5 ? 'členové' : 'členů'}
        </span>
      </div>

      {/* Crew grid — white card, thin border, rope */}
      <div
        ref={sectionRef}
        className="relative bg-white rounded-2xl border border-slate-200/80 p-8 overflow-hidden"
      >
        {/* Decorative watercolour blob — matches fourbros.cz style */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-violet/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-sky-200/20 blur-2xl pointer-events-none" />

        {/* Rope SVG — thin elegant cord like fourbros.cz reference section */}
        {ropePath && (
          <svg
            className="absolute pointer-events-none"
            style={{ top: 0, left: 0, zIndex: 0 }}
            width={svgSize.w}
            height={svgSize.h}
          >
            {/* Soft shadow */}
            <path d={ropePath} stroke="rgba(160,120,60,0.12)" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Rope base — warm manila */}
            <path d={ropePath} stroke="#C8A96E" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Twist dashes */}
            <path d={ropePath} stroke="#8B6830" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="7 6" />
          </svg>
        )}

        {/* Circles grid */}
        <div
          className="relative grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8"
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
                className={`flex flex-col items-center gap-2.5 transition-all duration-200 focus:outline-none group ${
                  isDimmed ? 'opacity-30' : ''
                }`}
              >
                {/* Circle */}
                <div
                  ref={el => { circleRefs.current[i] = el }}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl
                    bg-violet/[0.06] transition-all duration-200
                    ${isSelected
                      ? 'border-2 border-violet shadow-[0_0_0_4px_rgba(126,23,224,0.12)] scale-110'
                      : 'border-2 border-violet/15 group-hover:border-violet/40 group-hover:scale-105 group-hover:bg-violet/[0.09]'
                    }`}
                >
                  <span className="select-none">{m.emoji}</span>
                  {birthdaySoon && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] border-2 border-white">
                      🎂
                    </span>
                  )}
                </div>
                {/* Name */}
                <span className={`text-[11px] font-medium text-center leading-tight transition-colors ${
                  isSelected ? 'text-violet font-semibold' : 'text-navy/50 group-hover:text-navy/70'
                }`}>
                  {m.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail card — appears below, like fourbros.cz reference cards */}
      {member !== null && selected !== null && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_16px_rgba(126,23,224,0.08)]">
          {/* Header — navy gradient bar */}
          <div className="flex items-center gap-5 px-6 py-5 bg-gradient-to-r from-navy to-[#1a2d4a] relative">
            {/* Rope knot watermark */}
            <div className="absolute right-20 top-0 bottom-0 flex items-center opacity-[0.06]">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="28" stroke="white" strokeWidth="1.5"/>
                <path d="M20 30 Q30 15 40 30 Q30 45 20 30" stroke="white" strokeWidth="1.5" fill="none"/>
                <path d="M15 22 Q30 30 45 22" stroke="white" strokeWidth="1" fill="none"/>
                <path d="M15 38 Q30 30 45 38" stroke="white" strokeWidth="1" fill="none"/>
              </svg>
            </div>

            {/* Avatar circle */}
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-4xl flex-shrink-0">
              {member.emoji}
            </div>

            {/* Name & info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-headline font-semibold text-white text-lg leading-tight">{member.name}</h2>
              <p className="text-white/50 text-sm mt-0.5">{member.position}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet text-white">
                  {member.department}
                </span>
                {member.seniority && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/60">
                    {SENIORITY_LABEL[member.seniority]}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => selected > 0 && setSelected(selected - 1)}
                disabled={selected <= 0}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => selected < sorted.length - 1 && setSelected(selected + 1)}
                disabled={selected >= sorted.length - 1}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-20 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="flex gap-6 flex-wrap">
              {/* Bio */}
              {member.bio && (
                <p className="text-navy/60 text-sm leading-relaxed flex-1 min-w-[200px]">
                  {member.bio}
                </p>
              )}

              {/* Stats tiles */}
              <div className="flex gap-3 flex-shrink-0">
                <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-center min-w-[100px]">
                  <Cake className="w-4 h-4 text-violet mx-auto mb-1.5" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Narozeniny</p>
                  <p className="text-sm font-medium text-navy">{formatBirthday(member.birthday)}</p>
                  {(() => {
                    const d = daysUntilBirthday(member.birthday)
                    return d !== null && d <= 30
                      ? <p className="text-violet text-[10px] mt-0.5 font-semibold">{d === 0 ? '🎂 Dnes!' : `za ${d} dní`}</p>
                      : null
                  })()}
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-center min-w-[100px]">
                  <Briefcase className="w-4 h-4 text-violet mx-auto mb-1.5" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Spolupráce</p>
                  <p className="text-sm font-medium text-navy">{member.employmentType}</p>
                </div>
              </div>
            </div>

            {/* Dot navigator */}
            <div className="flex justify-center gap-1.5 mt-5">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`rounded-full transition-all duration-150 ${
                    i === selected ? 'w-5 h-1.5 bg-violet' : 'w-1.5 h-1.5 bg-slate-200 hover:bg-violet/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
