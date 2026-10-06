'use client'

import type { CSSProperties } from 'react'

/**
 * Concept mockup — corrected "Premium B2B Minimalist" direction.
 * Matches the real Four Bros brand language seen on discovery.fourbros.cz:
 * mostly light/white backgrounds, violet as the single accent, navy used
 * sparingly for headlines and one bold section block, watercolor wave
 * dividers, soft gradient blobs, pill-shaped buttons/badges, circular
 * portrait avatars with a violet glow ring.
 * Standalone exploration page — not wired into the live navigation.
 */

const NAVY = '#194669'
const VIOLET = '#7e17e0'
const ALICE = '#F7F8FE'
const GREY = '#F4F4F4'

const TEAM = [
  { name: 'Tereza Holá',     role: 'Head of People',           dept: 'HR',      initials: 'TH', tone: ['#7e17e0', '#9b45e8'] },
  { name: 'Marek Dvořák',    role: 'Senior Frontend Engineer', dept: 'Product', initials: 'MD', tone: ['#194669', '#3D6687'] },
  { name: 'Eliška Nováková', role: 'Product Designer',         dept: 'Design',  initials: 'EN', tone: ['#9b45e8', '#7e17e0'] },
  { name: 'Jakub Procházka', role: 'Backend Engineer',         dept: 'Product', initials: 'JP', tone: ['#3D6687', '#194669'] },
  { name: 'Anna Svobodová',  role: 'Talent Partner',           dept: 'HR',      initials: 'AS', tone: ['#7e17e0', '#6010b8'] },
  { name: 'Tomáš Beneš',     role: 'Engineering Lead',         dept: 'Product', initials: 'TB', tone: ['#194669', '#2E5070'] },
]

const STATS = [
  { label: 'Členů týmu', value: '38' },
  { label: 'Otevřených pozic', value: '4' },
  { label: 'Průměrná délka spolupráce', value: '2,7 roku' },
  { label: 'Interních povýšení (rok)', value: '11' },
]

function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className={flip ? 'rotate-180' : ''}
      style={{
        height: 96,
        backgroundImage: "url('/brand/watercolor.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.5,
      }}
    />
  )
}

function Blob({ style }: { style: CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${VIOLET}22, transparent 70%)`,
        filter: 'blur(40px)',
        ...style,
      }}
    />
  )
}

function Avatar({ initials, tone }: { initials: string; tone: string[] }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className="absolute -inset-1 rounded-full opacity-30"
        style={{ background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})`, filter: 'blur(6px)' }}
      />
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-base"
        style={{ background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})` }}
      >
        {initials}
      </div>
    </div>
  )
}

export default function TeamOverviewConcept() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" }} className="bg-white">

      {/* ══════════ LIGHT HERO ══════════ */}
      <section className="relative overflow-hidden" style={{ background: ALICE }}>
        <Blob style={{ width: 420, height: 420, top: -160, right: -120 }} />
        <Blob style={{ width: 280, height: 280, bottom: -120, left: -80 }} />

        <div className="relative max-w-6xl mx-auto px-8 pt-16 pb-24">

          {/* Top nav */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: VIOLET }}>4B</div>
              <span className="font-semibold tracking-tight" style={{ color: NAVY }}>Four Bros</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <span className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">Nástěnka</span>
              <span className="font-semibold border-b-2 pb-1" style={{ color: NAVY, borderColor: VIOLET }}>Tým</span>
              <span className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">Dokumenty</span>
              <span className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">Volno</span>
            </nav>
            <button
              className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: VIOLET }}
            >
              + Pozvat člena
            </button>
          </div>

          {/* Headline block */}
          <div className="max-w-2xl">
            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.15em] mb-6" style={{ background: '#7e17e014', color: VIOLET }}>
              Přehled týmu · Q3 2026
            </p>
            <h1 className="font-bold tracking-tight leading-[1.08] mb-6" style={{ fontSize: 52, color: NAVY }}>
              Lidé, kteří<br />pohánějí Four&nbsp;Bros.
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-md mb-9">
              38 lidí ve čtyřech odděleních. Jasný přehled rolí, obsazenosti
              a růstu týmu — na jednom místě.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-5 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: VIOLET }}>
                Zobrazit organizační strukturu
              </button>
              <button className="px-5 py-3 rounded-full text-sm font-semibold border transition-colors hover:bg-white" style={{ color: NAVY, borderColor: '#19466922' }}>
                Exportovat přehled
              </button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
            {STATS.map(s => (
              <div key={s.label} className="bg-white rounded-2xl px-6 py-5 shadow-[0_2px_16px_rgba(25,70,105,0.06)]">
                <p className="font-bold text-2xl tracking-tight mb-1" style={{ color: NAVY }}>{s.value}</p>
                <p className="text-slate-400 text-xs leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <WaveDivider />
      </section>

      {/* ══════════ TEAM GRID ══════════ */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-8 pt-2 pb-20">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="font-bold tracking-tight" style={{ color: NAVY, fontSize: 30 }}>Členové týmu</h2>
              <p className="text-slate-400 text-sm mt-1.5">Filtrováno podle oddělení · seřazeno abecedně</p>
            </div>
            <div className="flex items-center gap-2">
              {['Vše', 'HR', 'Product', 'Design'].map((f, i) => (
                <button
                  key={f}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  style={i === 0
                    ? { background: VIOLET, color: '#fff' }
                    : { background: GREY, color: '#64748b' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map((m, i) => (
              <div
                key={m.name}
                className="group rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 transition-all hover:shadow-[0_12px_40px_rgba(25,70,105,0.08)] hover:-translate-y-0.5"
                style={{ background: ALICE }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider" style={{ color: VIOLET }}>0{i + 1} / 06</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white" style={{ color: NAVY }}>
                    {m.dept}
                  </span>
                </div>
                <div className="flex items-center gap-3.5">
                  <Avatar initials={m.initials} tone={m.tone} />
                  <div className="min-w-0">
                    <p className="font-semibold tracking-tight truncate" style={{ color: NAVY }}>{m.name}</p>
                    <p className="text-sm text-slate-400 truncate">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white">
                  <span className="text-[11px] text-slate-400">Aktivní · Praha</span>
                  <span
                    className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: VIOLET }}
                  >
                    Zobrazit profil →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ NAVY CALLOUT BAND ══════════ */}
      <section className="relative overflow-hidden" style={{ background: NAVY }}>
        <Blob style={{ width: 360, height: 360, top: -140, right: -100, background: `radial-gradient(circle, ${VIOLET}33, transparent 70%)` }} />
        <div className="relative max-w-6xl mx-auto px-8 py-16 flex items-center justify-between flex-wrap gap-8">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#9b45e8' }}>
              Chybí vám někdo v přehledu?
            </p>
            <p className="text-white font-bold tracking-tight leading-snug" style={{ fontSize: 26 }}>
              Pozvěte nového člena týmu<br />během několika sekund.
            </p>
          </div>
          <button className="px-5 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: VIOLET }}>
            + Pozvat nového člena
          </button>
        </div>
      </section>
    </div>
  )
}
