'use client'

/**
 * Concept mockup — "Premium B2B Minimalist" visual direction.
 * Deep navy + single electric-cyan accent, large geometric type, organic wave
 * dividers between navy/white sections, rounded cards, portrait-style avatars.
 * Standalone exploration page — not wired into the live navigation.
 */

const CYAN = '#00C2FF'
const NAVY = '#0B1F33'

const TEAM = [
  { name: 'Tereza Holá',    role: 'Head of People',         dept: 'HR',        initials: 'TH', tone: ['#1F3A56', '#0B1F33'] },
  { name: 'Marek Dvořák',   role: 'Senior Frontend Engineer', dept: 'Product', initials: 'MD', tone: ['#0E3A4A', '#0B1F33'] },
  { name: 'Eliška Nováková',role: 'Product Designer',       dept: 'Design',    initials: 'EN', tone: ['#27293F', '#0B1F33'] },
  { name: 'Jakub Procházka',role: 'Backend Engineer',       dept: 'Product',   initials: 'JP', tone: ['#1A3447', '#0B1F33'] },
  { name: 'Anna Svobodová', role: 'Talent Partner',         dept: 'HR',        initials: 'AS', tone: ['#21384A', '#0B1F33'] },
  { name: 'Tomáš Beneš',    role: 'Engineering Lead',       dept: 'Product',   initials: 'TB', tone: ['#15303F', '#0B1F33'] },
]

const STATS = [
  { label: 'Členů týmu', value: '38' },
  { label: 'Otevřených pozic', value: '4' },
  { label: 'Průměrná délka spolupráce', value: '2,7 roku' },
  { label: 'Interních povýšení (rok)', value: '11' },
]

function WaveDivider({ flip = false, fill = '#fff' }: { flip?: boolean; fill?: string }) {
  return (
    <div className={flip ? 'rotate-180' : ''} style={{ lineHeight: 0 }}>
      <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: 72 }}>
        <path
          d="M0,32 C240,90 480,0 720,28 C960,56 1200,84 1440,40 L1440,90 L0,90 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}

function Avatar({ initials, tone }: { initials: string; tone: string[] }) {
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})` }}
    >
      {initials}
    </div>
  )
}

export default function TeamOverviewConcept() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ══════════ NAVY HERO ══════════ */}
      <section style={{ background: NAVY }} className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-8 pt-16 pb-28">

          {/* Top nav */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: CYAN, color: NAVY }}>4B</div>
              <span className="text-white font-semibold tracking-tight">Four Bros</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <span className="text-white/50 hover:text-white transition-colors cursor-pointer">Nástěnka</span>
              <span className="text-white font-medium border-b-2 pb-1" style={{ borderColor: CYAN }}>Tým</span>
              <span className="text-white/50 hover:text-white transition-colors cursor-pointer">Dokumenty</span>
              <span className="text-white/50 hover:text-white transition-colors cursor-pointer">Volno</span>
            </nav>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: CYAN, color: NAVY }}
            >
              + Pozvat člena
            </button>
          </div>

          {/* Headline block */}
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: CYAN }}>
              Přehled týmu · Q3 2026
            </p>
            <h1 className="text-white font-bold tracking-tight leading-[1.05] mb-6" style={{ fontSize: 56 }}>
              Lidé, kteří<br />pohánějí Four&nbsp;Bros.
            </h1>
            <p className="text-white/55 text-base leading-relaxed max-w-md mb-9">
              38 lidí ve čtyřech odděleních. Jasný přehled rolí, obsazenosti
              a růstu týmu — na jednom místě.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-5 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: CYAN, color: NAVY }}>
                Zobrazit organizační strukturu
              </button>
              <button className="px-5 py-3 rounded-xl text-sm font-semibold text-white border border-white/15 hover:border-white/30 transition-colors">
                Exportovat přehled
              </button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-20 rounded-2xl overflow-hidden border border-white/10">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/[0.03] px-6 py-5">
                <p className="text-white font-bold text-2xl tracking-tight mb-1">{s.value}</p>
                <p className="text-white/45 text-xs leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Organic wave transition into white section */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-px">
          <WaveDivider fill="#fff" />
        </div>
      </section>

      {/* ══════════ WHITE CONTENT ══════════ */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-8 pt-6 pb-24">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="font-bold tracking-tight" style={{ color: NAVY, fontSize: 32 }}>Členové týmu</h2>
              <p className="text-slate-400 text-sm mt-1.5">Filtrováno podle oddělení · seřazeno abecedně</p>
            </div>
            <div className="flex items-center gap-2">
              {['Vše', 'HR', 'Product', 'Design'].map((f, i) => (
                <button
                  key={f}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  style={i === 0
                    ? { background: NAVY, color: '#fff' }
                    : { background: '#F4F4F4', color: '#64748b' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map(m => (
              <div
                key={m.name}
                className="group rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 transition-all hover:shadow-[0_12px_40px_rgba(11,31,51,0.08)] hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar initials={m.initials} tone={m.tone} />
                  <div className="min-w-0">
                    <p className="font-semibold tracking-tight truncate" style={{ color: NAVY }}>{m.name}</p>
                    <p className="text-sm text-slate-400 truncate">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: '#F4F4F4', color: NAVY }}>
                    {m.dept}
                  </span>
                  <span
                    className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: CYAN }}
                  >
                    Zobrazit profil →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave back into navy footer band */}
        <div className="translate-y-px">
          <WaveDivider flip fill={NAVY} />
        </div>
      </section>

      {/* ══════════ NAVY FOOTER BAND ══════════ */}
      <section style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-8 py-14 flex items-center justify-between flex-wrap gap-6">
          <div>
            <p className="text-white font-bold tracking-tight" style={{ fontSize: 22 }}>Chybí vám někdo v přehledu?</p>
            <p className="text-white/50 text-sm mt-1.5">Pozvěte nového člena týmu během několika sekund.</p>
          </div>
          <button className="px-5 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: CYAN, color: NAVY }}>
            + Pozvat nového člena
          </button>
        </div>
      </section>
    </div>
  )
}
