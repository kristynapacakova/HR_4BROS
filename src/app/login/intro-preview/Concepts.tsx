'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* ─────────────────────────────  Sdílené  ───────────────────────────── */

export const W = 900
export const H = 540
export const CX = 450
export const LOGO_CY = 230
export const LINE = '#3a5a95'
export const MUTED = '#8fa3cf'
export const LAV = '#b9cbf3'
export const GOLD = '#F0E100'
export const VIOLET = '#834DFB'
export const MINT = '#4DE791'

export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/** Časová osa: names[i] začíná v čase times[i] (ms). Poslední krok = konec. */
export function useTimeline(names: string[], times: number[], onDone: () => void) {
  const [idx, setIdx] = useState(0)
  const doneRef = useRef(false)
  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    const timers = times.map((t, i) => setTimeout(() => (i === times.length - 1 ? finish() : setIdx(i)), t))
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish() }
    window.addEventListener('keydown', onKey)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finish])

  const phase = names[idx]
  const at = (p: string) => idx >= names.indexOf(p)
  return { phase, at, finish }
}

export function Shell({ out, onSkip, children }: { out: boolean; onSkip: () => void; children: ReactNode }) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / W, (window.innerHeight - 96) / H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return (
    <div className="fixed inset-0 z-50 bg-navy overflow-hidden" style={{ opacity: out ? 0 : 1, transition: 'opacity .8s ease .1s' }}>
      <button
        onClick={onSkip}
        autoFocus
        className="absolute top-6 right-6 z-10 flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white border border-white/30 hover:bg-white hover:text-navy transition-colors"
      >
        Přeskočit intro
        <span className="px-1.5 py-0.5 text-[10px] leading-none border border-current opacity-60">Esc</span>
      </button>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex-shrink-0" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/** Závěrečná značka: 4B v rámečku + HR Portál + claim. */
export function EndMark({ out, children }: { out: boolean; children?: ReactNode }) {
  return (
    <>
      <div
        className="absolute"
        style={{
          left: CX - 100, top: LOGO_CY - 100, width: 200, height: 200,
          transform: out ? 'scale(.35)' : 'scale(1)', opacity: out ? 0 : 1,
          transition: 'transform .8s cubic-bezier(.7,0,.3,1), opacity .6s ease .2s',
        }}
      >
        <div className="absolute inset-0" style={{ border: `2px solid ${LINE}`, animation: 'intro-frame .7s cubic-bezier(.16,1,.3,1) both' }} />
        <div className="absolute" style={{ inset: 12, border: '1px solid rgba(92,123,181,0.4)', animation: 'intro-frame .7s cubic-bezier(.16,1,.3,1) .1s both' }} />
        <div className="absolute" style={{ inset: 22, border: '1px solid rgba(255,255,255,0.12)', animation: 'intro-frame .7s cubic-bezier(.16,1,.3,1) .2s both' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/symbol-white.svg" alt="4B" className="absolute"
          style={{ left: 40, top: 67, width: 120, height: 'auto', animation: 'intro-pop .6s cubic-bezier(.16,1,.3,1) .15s both' }}
        />
        {children}
      </div>
      <div className="absolute left-0 right-0 text-center" style={{ top: LOGO_CY + 130, opacity: out ? 0 : 1, transition: 'opacity .4s ease' }}>
        <p className="font-headline text-white text-[44px] leading-none mb-4" style={{ fontWeight: 600, animation: 'intro-rise .7s cubic-bezier(.16,1,.3,1) .35s both' }}>
          HR Portál
        </p>
        <p className="text-[16px]" style={{ color: MUTED, animation: 'intro-rise .7s cubic-bezier(.16,1,.3,1) .55s both' }}>
          My makáme. Portál papíruje.
        </p>
      </div>
    </>
  )
}

export function Caption({ show, top, children, style }: { show: boolean; top: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      className="absolute left-0 right-0 text-center font-headline text-white text-[34px] leading-none"
      style={{
        top, fontWeight: 600,
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(10px)',
        transition: show
          ? 'opacity .5s ease .3s, transform .6s cubic-bezier(.16,1,.3,1) .3s'
          : 'opacity .3s ease, transform .3s ease',
        ...style,
      }}
    >
      {children}
    </p>
  )
}

export function Legend({ show, top, items }: { show: boolean; top: number; items: [string, string][] }) {
  return (
    <div
      className="absolute left-0 right-0 flex justify-center gap-6 text-[12px]"
      style={{ top, color: LAV, opacity: show ? 1 : 0, transition: 'opacity .5s ease' }}
    >
      {items.map(([c, l]) => (
        <span key={l} className="flex items-center gap-2">
          <span style={{ width: 10, height: 10, background: c, display: 'inline-block' }} />
          {l}
        </span>
      ))}
    </div>
  )
}

export const burstStyle = (dx: number, dy: number, rot: number, delay: number): CSSProperties => {
  const len = Math.hypot(dx, dy) || 1
  return {
    ['--dx' as string]: `${dx}px`,
    ['--dy' as string]: `${dy}px`,
    ['--sx' as string]: `${(-dy / len) * 50}px`,
    ['--sy' as string]: `${(dx / len) * 50}px`,
    ['--rot' as string]: `${rot}deg`,
    animation: `intro-burst .95s cubic-bezier(.55,0,.25,1) ${delay}ms both`,
  }
}

/* ─────────────────────  A) Měsíc v rytmu — kalendář  ───────────────────── */

export function IntroCalendar({ onDone }: { onDone: () => void }) {
  const { phase, at, finish } = useTimeline(
    ['grid', 'work', 'off', 'collapse', 'logo', 'out', 'end'],
    [0, 900, 3200, 5200, 6100, 8100, 8900],
    onDone,
  )
  const CELL_W = 56, CELL_H = 40, GX = 6, GY = 6
  const L = CX - (7 * CELL_W + 6 * GX) / 2
  const T = 128
  const days = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
  const rnd = seeded(7)
  const cells = Array.from({ length: 35 }).map((_, i) => {
    const r = Math.floor(i / 7), c = i % 7
    const day = i + 1
    const weekend = c >= 5
    const exists = day <= 31
    const ho = !weekend && (i % 7 === 2 || (i * 3) % 11 === 1)
    const vacation = r === 3 && !weekend
    return { i, r, c, day, weekend, exists, ho, vacation, x: L + c * (CELL_W + GX), y: T + r * (CELL_H + GY), j: [(rnd() - 0.5) * 60, (rnd() - 0.5) * 60, (rnd() - 0.5) * 300, rnd() * 380] }
  })

  return (
    <Shell out={phase === 'out'} onSkip={finish}>
      {/* názvy dnů */}
      <div style={{ opacity: at('collapse') ? 0 : 1, transition: 'opacity .3s' }}>
        {days.map((d, c) => (
          <p
            key={d}
            className="absolute text-[11px] font-semibold uppercase tracking-[0.12em] text-center"
            style={{ left: L + c * (CELL_W + GX), width: CELL_W, top: T - 24, color: c >= 5 ? MUTED : LAV, animation: `intro-fade .4s ease ${c * 50}ms both` }}
          >
            {d}
          </p>
        ))}
      </div>

      {cells.map(cell => {
        const fill =
          !cell.exists || cell.weekend
            ? at('off') && cell.exists ? 'rgba(77,231,145,0.18)' : 'transparent'
            : at('off') && cell.vacation ? GOLD
            : cell.ho ? VIOLET : '#5c7bb5'
        const filled = cell.exists && (at('work') || (cell.weekend && at('off')))
        const delayIn = at('off') ? (cell.vacation ? (cell.c) * 140 : 600) : cell.i * 45
        const collapse = at('collapse')
        const dx = CX - (cell.x + CELL_W / 2) + cell.j[0]
        const dy = LOGO_CY - (cell.y + CELL_H / 2) + cell.j[1]
        return (
          <div
            key={cell.i}
            className="absolute"
            style={{
              left: cell.x, top: cell.y, width: CELL_W, height: CELL_H,
              ...(collapse ? burstStyle(dx, dy, cell.j[2], cell.j[3]) : { animation: `intro-pop .45s cubic-bezier(.16,1,.3,1) ${cell.i * 18}ms both` }),
            }}
          >
            <div className="absolute inset-0" style={{ border: `1px solid ${cell.exists ? 'rgba(92,123,181,0.45)' : 'rgba(92,123,181,0.15)'}` }} />
            <div
              className="absolute"
              style={{
                inset: 4,
                background: fill,
                transformOrigin: 'left bottom',
                transform: filled ? 'scale(1)' : 'scale(0)',
                transition: `transform .45s cubic-bezier(.16,1,.3,1) ${delayIn}ms, background-color .35s ease ${delayIn}ms`,
              }}
            />
            {cell.exists && (
              <span
                className="absolute text-[10px] leading-none"
                style={{ left: 7, top: 7, color: filled && !cell.weekend ? (fill === GOLD ? '#0d214f' : 'rgba(255,255,255,0.8)') : MUTED, transition: `color .3s ease ${delayIn}ms` }}
              >
                {cell.day}
              </span>
            )}
          </div>
        )
      })}

      <Legend
        show={at('work') && !at('collapse')}
        top={T + 5 * (CELL_H + GY) + 10}
        items={[['#5c7bb5', 'Kancelář'], [VIOLET, 'Home office'], [GOLD, 'Dovolená']]}
      />
      <Caption show={phase === 'work'} top={T + 5 * (CELL_H + GY) + 58}>Makáme naplno.</Caption>
      <Caption show={phase === 'off'} top={T + 5 * (CELL_H + GY) + 58}>
        Ale umíme i <span style={{ color: GOLD }}>vypnout.</span>
      </Caption>

      {at('logo') && <EndMark out={phase === 'out'} />}
    </Shell>
  )
}

/* ─────────────────────  B) Tým se skládá — 4×4 lidí  ───────────────────── */

export function IntroTeam({ onDone }: { onDone: () => void }) {
  const { phase, at, finish } = useTimeline(
    ['scatter', 'assemble', 'status', 'compact', 'logo', 'out', 'end'],
    [0, 150, 2200, 4400, 5200, 7200, 8000],
    onDone,
  )
  const STEP = 68, SIZE = 52
  const GL = CX - (4 * STEP - (STEP - SIZE)) / 2
  const GT = 108
  const STATUS = [MINT, VIOLET, MINT, GOLD, MINT, MINT, VIOLET, MINT, GOLD, MINT, VIOLET, MINT, MINT, GOLD, MINT, VIOLET]
  const rnd = seeded(11)
  const people = Array.from({ length: 16 }).map((_, i) => {
    const ang = rnd() * Math.PI * 2
    const dist = 380 + rnd() * 160
    return { i, row: Math.floor(i / 4), col: i % 4, sx: CX + Math.cos(ang) * dist, sy: 270 + Math.sin(ang) * dist * 0.7, rot: (rnd() - 0.5) * 120 }
  })
  const compact = at('compact')
  const CS = 14, CSTEP = 18
  const CL = CX - (4 * CSTEP - 4) / 2
  const CT = LOGO_CY - (4 * CSTEP - 4) / 2

  return (
    <Shell out={phase === 'out'} onSkip={finish}>
      {people.map(p => {
        const placed = at('assemble')
        const size = compact ? CS : SIZE
        const left = !placed ? p.sx : compact ? CL + p.col * CSTEP : GL + p.col * STEP
        const top = !placed ? p.sy : compact ? CT + p.row * CSTEP : GT + p.row * STEP
        const showBadge = at('status') && !compact
        return (
          <div
            key={p.i}
            className="absolute"
            style={{
              left, top, width: size, height: size,
              background: compact ? STATUS[p.i] : '#1d356d',
              transform: placed ? 'rotate(0deg)' : `rotate(${p.rot}deg)`,
              opacity: at('logo') ? 0 : 1,
              transition: compact
                ? `left .6s cubic-bezier(.7,0,.2,1) ${p.i * 18}ms, top .6s cubic-bezier(.7,0,.2,1) ${p.i * 18}ms, width .6s ease ${p.i * 18}ms, height .6s ease ${p.i * 18}ms, background-color .4s ease, opacity .4s ease .2s`
                : `left 1.3s cubic-bezier(.16,1,.3,1) ${p.i * 60}ms, top 1.3s cubic-bezier(.16,1,.3,1) ${p.i * 60}ms, transform 1.3s cubic-bezier(.16,1,.3,1) ${p.i * 60}ms`,
            }}
          >
            {!compact && (
              <svg className="absolute inset-0" width={SIZE} height={SIZE} viewBox="0 0 52 52" aria-hidden="true">
                <rect x="20" y="11" width="12" height="12" fill={LAV} />
                <path d="M12 44 V38 Q12 29 21 29 H31 Q40 29 40 38 V44 Z" fill={LAV} />
              </svg>
            )}
            <span
              className="absolute"
              style={{
                right: -5, top: -5, width: 14, height: 14, background: STATUS[p.i],
                border: '2px solid #0d214f',
                transform: showBadge ? 'scale(1)' : 'scale(0)',
                transition: `transform .4s cubic-bezier(.16,1,.3,1) ${p.i * 70}ms`,
              }}
            />
          </div>
        )
      })}

      <Legend show={phase === 'status'} top={GT + 4 * STEP + 6} items={[[MINT, 'V kanceláři'], [VIOLET, 'Home office'], [GOLD, 'Dovolená']]} />
      <Caption show={phase === 'assemble'} top={GT + 4 * STEP + 50}>Každý jinak. Jeden tým.</Caption>
      <Caption show={phase === 'status'} top={GT + 4 * STEP + 50}>Kdo je dnes kde? Hned vidíš.</Caption>

      {at('logo') && <EndMark out={phase === 'out'} />}
    </Shell>
  )
}

/* ─────────────────────  C) Krok za krokem — 4B schody  ───────────────────── */

const STEPS = [
  { n: '01', label: 'Nástup', note: 'Smlouva podepsaná', bg: 'transparent', fg: '#FFFFFF', border: true },
  { n: '02', label: 'Docházka', note: 'Hodiny sedí', bg: GOLD, fg: '#0d214f', border: false },
  { n: '03', label: 'Dovolená', note: 'Volno schválené', bg: VIOLET, fg: '#FFFFFF', border: false },
  { n: '04', label: 'Odměny', note: 'Benefity čerpané', bg: MINT, fg: '#0d214f', border: false },
]

export function IntroStairs({ onDone }: { onDone: () => void }) {
  const { phase, at, finish } = useTimeline(
    ['floor', 's0', 's1', 's2', 's3', 'caption', 'gather', 'logo', 'out', 'end'],
    [0, 500, 1350, 2200, 3050, 3900, 5300, 5800, 7900, 8700],
    onDone,
  )
  const SW = 150, SH = 64
  const L = 150, B = 448
  const AV = 16
  const built = (i: number) => at(`s${i}`)
  const current = [3, 2, 1, 0].find(i => built(i))
  const gather = at('gather')

  // pozice „človíčka“
  let ax = L - 50, ay = B - AV
  if (current !== undefined) {
    ax = L + current * SW + 22
    ay = B - (current + 1) * SH - AV
  }
  // rožky v pravém dolním rohu rámu 4B
  const RX = CX + 100, RY = LOGO_CY + 100
  if (gather) {
    ax = RX
    ay = RY - 22
  }

  return (
    <Shell out={phase === 'out'} onSkip={finish}>
      {/* podlaha */}
      <div
        className="absolute"
        style={{ left: L - 80, top: B, height: 1, width: 4 * SW + 160, background: LINE, transformOrigin: 'left', animation: 'intro-grow-x .7s cubic-bezier(.65,0,.35,1) both', opacity: gather ? 0 : 1, transition: 'opacity .4s' }}
      />

      {STEPS.map((s, i) => (
        <div
          key={s.n}
          className="absolute"
          style={{
            left: L + i * SW, top: B - (i + 1) * SH, width: SW, height: SH,
            opacity: gather ? 0 : 1,
            transform: gather ? 'translateY(30px)' : 'none',
            transition: `opacity .45s ease ${i * 60}ms, transform .6s cubic-bezier(.7,0,.3,1) ${i * 60}ms`,
          }}
        >
          {built(i) && (
            <div
              className="absolute inset-0 px-3 py-2.5"
              style={{
                background: s.bg, color: s.fg,
                border: s.border ? '1.5px solid rgba(255,255,255,0.85)' : 'none',
                transformOrigin: 'bottom', animation: 'intro-grow-y .5s cubic-bezier(.16,1,.3,1) both',
              }}
            >
              <p className="text-[10px] font-bold leading-none opacity-70 mb-1">{s.n}</p>
              <p className="text-[13px] font-bold uppercase tracking-[0.04em] leading-none mb-2">{s.label}</p>
              <p className="text-[11px] leading-none" style={{ animation: 'intro-fade .4s ease .45s both' }}>✓ {s.note}</p>
            </div>
          )}
        </div>
      ))}

      {/* človíček → žlutý rožek */}
      <div
        className="absolute"
        style={{
          left: ax, top: ay, width: gather ? 22 : AV, height: gather ? 22 : AV,
          background: gather ? GOLD : '#FFFFFF',
          opacity: at('out') ? 0 : 1,
          transition: gather
            ? 'left .7s cubic-bezier(.7,0,.2,1), top .7s cubic-bezier(.7,0,.2,1), width .5s ease, height .5s ease, background-color .4s ease, opacity .4s ease'
            : 'left .5s linear .35s, top .5s cubic-bezier(.25,1.9,.55,1) .35s',
          animation: 'intro-pop .4s cubic-bezier(.16,1,.3,1) .3s both',
        }}
      />
      {/* fialový rožek */}
      <div
        className="absolute bg-violet"
        style={{ left: RX - 22, top: RY, width: 22, height: 22, opacity: at('logo') && !at('out') ? 1 : 0, transform: at('logo') ? 'scale(1)' : 'scale(0)', transition: 'transform .4s cubic-bezier(.16,1,.3,1) .1s, opacity .3s ease' }}
      />

      <p
        className="absolute font-headline text-white leading-[1.05]"
        style={{ left: L, top: 96, fontSize: 40, fontWeight: 600, opacity: phase === 'caption' ? 1 : 0, transform: phase === 'caption' ? 'none' : 'translateY(10px)', transition: 'opacity .5s ease, transform .6s cubic-bezier(.16,1,.3,1)' }}
      >
        Rosteme spolu.
        <br />
        <span style={{ fontWeight: 400, color: LAV }}>Krok za krokem.</span>
      </p>

      {at('logo') && <EndMark out={phase === 'out'} />}
    </Shell>
  )
}
