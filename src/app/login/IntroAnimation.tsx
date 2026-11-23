'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Úvodní animace před loginem — stejná dramaturgie jako Report Hub:
 * 1) kruh se středem, 2) šest HR oblastí na obvodu s pulzujícími paprsky,
 * 3) uzly se rozletí do mřížky mini-karet s pixelovými grafy,
 * 4) grafy se rozpadnou na pixely, které se slétnou do značky 4B,
 * 5) 4B + „HR Portál“, pak plynulý odchod na login.
 */

type Phase = 'ring' | 'nodes' | 'cards' | 'burst' | 'logo' | 'out'

const STAGE_W = 900
const STAGE_H = 540
const CX = 450
const CY = 270
const R = 190
const LOGO_CY = 230

const NAVY_LINE = '#3a5a95'
const MUTED = '#8fa3cf'
const LAVENDER = '#b9cbf3'

const CARD_W = 272
const CARD_H = 184
const GAP = 16
const GRID_LEFT = (STAGE_W - (CARD_W * 3 + GAP * 2)) / 2
const GRID_TOP = (STAGE_H - (CARD_H * 2 + GAP)) / 2

type Area = {
  key: string
  label: string
  metric: string
  sub: string
  color: string
  angle: number
}

// Pořadí = pořadí karet v mřížce (řádek po řádku)
const AREAS: Area[] = [
  { key: 'dochazka', label: 'Docházka', metric: 'Hodiny', sub: 'Kancelář · Home office · OFF', color: '#F0E100', angle: -150 },
  { key: 'dovolene', label: 'Dovolené', metric: 'Čerpání', sub: 'Dovolená · Sick days · Volno', color: '#834DFB', angle: -90 },
  { key: 'smlouvy', label: 'Smlouvy', metric: 'Podpisy', sub: 'HPP · DPP · OSVČ', color: '#4DE791', angle: -30 },
  { key: 'tym', label: 'Tým', metric: 'Lidé', sub: 'Kdo je kde · Medailonky', color: LAVENDER, angle: 150 },
  { key: 'pasky', label: 'Výplatní pásky', metric: 'Mzdy', sub: 'Pásky · Potvrzení · Daně', color: '#FFFFFF', angle: 90 },
  { key: 'odmeny', label: 'Odměny', metric: 'Benefity', sub: 'Benefity · Vzdělávání · Bonusy', color: '#F0E100', angle: 30 },
]

const nodePos = (angle: number) => {
  const a = (angle * Math.PI) / 180
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }
}
const cardPos = (i: number) => ({
  left: GRID_LEFT + (i % 3) * (CARD_W + GAP),
  top: GRID_TOP + Math.floor(i / 3) * (CARD_H + GAP),
})

// deterministický „náhodný“ generátor, ať je render stabilní
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

type Px = { x: number; y: number; w: number; h: number; c: string; d: number }

/** Pixely grafu v lokálních souřadnicích karty (oblast grafu ~ y 64–164). */
function chartPixels(key: string): Px[] {
  const px: Px[] = []
  const rnd = seeded(key.length * 97 + 13)
  switch (key) {
    case 'dochazka': {
      const heights = [3, 5, 4, 6, 5, 7, 8]
      heights.forEach((h, col) => {
        for (let row = 0; row < h; row++) {
          px.push({ x: 24 + col * 33, y: 158 - row * 11, w: 24, h: 7, c: col === 6 ? '#834DFB' : '#F0E100', d: col * 70 + row * 45 })
        }
      })
      break
    }
    case 'dovolene': {
      LINE_POINTS.forEach(([x, y], i) => px.push({ x: x - 4, y: y - 4, w: 8, h: 8, c: '#834DFB', d: i * 80 }))
      break
    }
    case 'smlouvy': {
      const counts = [6, 4, 5, 3]
      counts.forEach((n, row) => {
        px.push({ x: 20, y: 80 + row * 22, w: 56, h: 9, c: NAVY_LINE, d: row * 90 })
        for (let k = 0; k < n; k++) px.push({ x: 88 + k * 20, y: 80 + row * 22, w: 15, h: 9, c: '#4DE791', d: row * 90 + 120 + k * 60 })
      })
      break
    }
    case 'tym': {
      const shades = ['#5c7bb5', '#8fa3cf', LAVENDER, '#3a5a95', '#b9cbf3', '#6f8cc4']
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          px.push({ x: 24 + col * 28, y: 76 + row * 21, w: 22, h: 16, c: shades[Math.floor(rnd() * shades.length)], d: (row + col) * 40 })
        }
      }
      break
    }
    case 'pasky': {
      const n = 20
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 - Math.PI / 2
        px.push({ x: 74 + 36 * Math.cos(a) - 5, y: 118 + 36 * Math.sin(a) - 5, w: 10, h: 10, c: k < 3 ? '#1e7e46' : '#4DE791', d: k * 45 })
      }
      break
    }
    case 'odmeny': {
      const hs = [8, 12, 10, 18, 16, 24, 22, 30, 28, 36]
      hs.forEach((h, k) => px.push({ x: 20 + k * 23, y: 164 - h, w: 14, h, c: k === 9 ? '#F0E100' : '#5b3fb0', d: k * 60 }))
      break
    }
  }
  return px
}

const LINE_POINTS: [number, number][] = [
  [24, 150], [44, 140], [64, 144], [84, 128], [104, 132], [124, 120], [144, 122], [164, 108], [184, 112], [204, 98], [224, 102], [246, 84],
]

function CardChrome({ area, visible }: { area: Area; visible: boolean }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(92,123,181,0.35)',
        opacity: visible ? 1 : 0,
        transition: 'opacity .45s ease',
      }}
    >
      <p className="absolute text-white text-[14px] font-semibold leading-none" style={{ left: 34, top: 18 }}>{area.label}</p>
      <p className="absolute text-[12px] leading-none" style={{ right: 16, top: 19, color: LAVENDER }}>{area.metric}</p>
      <p className="absolute text-[11px] leading-none" style={{ left: 16, top: 40, color: MUTED }}>{area.sub}</p>

      {area.key === 'dovolene' && (
        <svg className="absolute inset-0" width={CARD_W} height={CARD_H} aria-hidden="true">
          <polyline
            points={LINE_POINTS.map(p => p.join(',')).join(' ')}
            fill="none"
            stroke="#834DFB"
            strokeOpacity="0.7"
            strokeWidth="2"
            pathLength={1}
            style={{ strokeDasharray: 1, animation: 'intro-draw 1.1s ease .3s both' }}
          />
        </svg>
      )}
      {area.key === 'pasky' && (
        <div className="absolute" style={{ left: 132, top: 96 }}>
          <p className="text-[11px] uppercase tracking-[0.12em] leading-none mb-2" style={{ color: LAVENDER }}>Vyplaceno</p>
          <p className="font-headline text-white text-[32px] leading-none" style={{ fontWeight: 600 }}>12/12</p>
        </div>
      )}
      {area.key === 'odmeny' && (
        <div className="absolute" style={{ left: 16, top: 60 }}>
          <p className="text-[12px] leading-none mb-2" style={{ color: LAVENDER }}>Čerpání benefitů m/m</p>
          <p className="font-headline text-[30px] leading-none" style={{ color: '#4DE791', fontWeight: 600 }}>+12 %</p>
        </div>
      )}
    </div>
  )
}

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('ring')
  const [scale, setScale] = useState(1)
  const stageRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      finish()
      return
    }
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / STAGE_W, (window.innerHeight - 96) / STAGE_H))
    fit()
    window.addEventListener('resize', fit)
    const timers = [
      setTimeout(() => setPhase('nodes'), 1000),
      setTimeout(() => setPhase('cards'), 3300),
      setTimeout(() => setPhase('burst'), 5900),
      setTimeout(() => setPhase('logo'), 6900),
      setTimeout(() => setPhase('out'), 8900),
      setTimeout(finish, 9700),
    ]
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', fit)
    }
  }, [finish])

  // Rozpad grafů na pixely, které se ve spirále slétnou do místa značky 4B
  useEffect(() => {
    if (phase !== 'burst' || !stageRef.current) return
    const stage = stageRef.current.getBoundingClientRect()
    const tx = stage.left + CX * scale
    const ty = stage.top + LOGO_CY * scale
    const rnd = seeded(42)
    stageRef.current.querySelectorAll<HTMLElement>('[data-px]').forEach(el => {
      const r = el.getBoundingClientRect()
      const dx = (tx - (r.left + r.width / 2)) / scale + (rnd() - 0.5) * 70
      const dy = (ty - (r.top + r.height / 2)) / scale + (rnd() - 0.5) * 70
      // kolmý odklon = mírná spirála
      const len = Math.hypot(dx, dy) || 1
      el.style.setProperty('--dx', `${dx}px`)
      el.style.setProperty('--dy', `${dy}px`)
      el.style.setProperty('--sx', `${(-dy / len) * 60}px`)
      el.style.setProperty('--sy', `${(dx / len) * 60}px`)
      el.style.setProperty('--rot', `${(rnd() - 0.5) * 360}deg`)
      el.style.animation = `intro-burst 1s cubic-bezier(.55,0,.25,1) ${Math.round(rnd() * 380)}ms both`
    })
  }, [phase, scale])

  const atLeast = (p: Phase) => {
    const order: Phase[] = ['ring', 'nodes', 'cards', 'burst', 'logo', 'out']
    return order.indexOf(phase) >= order.indexOf(p)
  }
  const inHub = phase === 'ring' || phase === 'nodes'
  const showCards = phase === 'cards' || phase === 'burst'

  return (
    <div
      className="fixed inset-0 z-50 bg-navy overflow-hidden"
      style={{ opacity: phase === 'out' ? 0 : 1, transition: 'opacity .8s ease .1s' }}
    >
      <button
        onClick={finish}
        className="absolute top-6 right-6 z-10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white border border-white/30 hover:bg-white hover:text-navy transition-colors"
      >
        Přeskočit intro
      </button>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={stageRef}
          className="relative flex-shrink-0"
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
        >
          {/* 1–2) Kruh, paprsky a putující pixely */}
          <svg
            className="absolute inset-0"
            width={STAGE_W}
            height={STAGE_H}
            style={{ opacity: inHub ? 1 : 0, transition: 'opacity .5s ease' }}
            aria-hidden="true"
          >
            <circle
              cx={CX} cy={CY} r={R}
              fill="none" stroke={NAVY_LINE} strokeWidth="1.5"
              pathLength={1}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ strokeDasharray: 1, animation: 'intro-draw 1.2s cubic-bezier(.65,0,.35,1) both' }}
            />
            {Array.from({ length: 48 }).map((_, k) => {
              const a = (k / 48) * Math.PI * 2
              return (
                <line
                  key={k}
                  x1={CX + (R - 8) * Math.cos(a)} y1={CY + (R - 8) * Math.sin(a)}
                  x2={CX + (R - 3) * Math.cos(a)} y2={CY + (R - 3) * Math.sin(a)}
                  stroke={NAVY_LINE} strokeOpacity="0.6"
                  style={{ opacity: 0, animation: `intro-fade .4s ease ${600 + k * 12}ms forwards` }}
                />
              )
            })}
            {phase === 'nodes' && AREAS.map((a, i) => {
              const p = nodePos(a.angle)
              const path = `M${p.x},${p.y} L${CX},${CY}`
              return (
                <g key={a.key} style={{ animation: `intro-fade .5s ease ${i * 110}ms both` }}>
                  <path d={path} stroke={a.color} strokeOpacity="0.55" strokeDasharray="3 5" fill="none" />
                  {[0, 0.33, 0.66].map(off => (
                    <rect key={off} x={-3.5} y={-3.5} width={7} height={7} fill={a.color} opacity={0.85}>
                      <animateMotion dur="1.4s" repeatCount="indefinite" path={path} begin={`${(off * 1.4 + i * 0.12).toFixed(2)}s`} />
                    </rect>
                  ))}
                </g>
              )
            })}
          </svg>

          {/* Střed s žlutou září */}
          <div
            className="absolute"
            style={{
              left: CX - 60, top: CY - 60, width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(240,225,0,0.22), transparent 65%)',
              opacity: inHub ? 1 : 0, transition: 'opacity .5s ease',
            }}
          />
          <div
            className="absolute"
            style={{ left: CX - 13, top: CY - 13, width: 26, height: 26, animation: 'intro-pop .5s cubic-bezier(.16,1,.3,1) .35s both' }}
          >
            <div
              className="absolute inset-0 bg-gold"
              style={{ transform: inHub ? 'scale(1)' : 'scale(0)', transition: 'transform .4s cubic-bezier(.5,0,.75,0)' }}
            />
          </div>

          {/* 3) Rámy karet */}
          {atLeast('cards') && AREAS.map((a, i) => {
            const c = cardPos(i)
            return (
              <div
                key={a.key}
                className="absolute"
                style={{ left: c.left, top: c.top, width: CARD_W, height: CARD_H, animation: `intro-fade .45s ease ${120 + i * 60}ms both` }}
              >
                <CardChrome area={a} visible={phase === 'cards'} />
              </div>
            )
          })}

          {/* 3–4) Pixely grafů */}
          {showCards && AREAS.map((a, i) => {
            const c = cardPos(i)
            return chartPixels(a.key).map((p, k) => (
              <div
                key={`${a.key}-${k}`}
                data-px
                className="absolute"
                style={{
                  left: c.left + p.x, top: c.top + p.y, width: p.w, height: p.h, background: p.c,
                  transformOrigin: 'bottom',
                  animation: `intro-pop .45s cubic-bezier(.16,1,.3,1) ${450 + p.d}ms both`,
                }}
              />
            ))
          })}

          {/* Uzly: na kruhu → barevný čtvereček v hlavičce karty */}
          {AREAS.map((a, i) => {
            const p = nodePos(a.angle)
            const c = cardPos(i)
            const onCard = !inHub
            const size = onCard ? 10 : 22
            const x = onCard ? c.left + 16 + size / 2 : p.x
            const y = onCard ? c.top + 18 + size / 2 : p.y
            const side = Math.cos((a.angle * Math.PI) / 180)
            const labelStyle: React.CSSProperties =
              Math.abs(side) < 0.1
                ? { left: '50%', transform: 'translateX(-50%)', ...(a.angle < 0 ? { bottom: 30 } : { top: 30 }) }
                : side < 0
                  ? { right: 32, top: '50%', transform: 'translateY(-50%)' }
                  : { left: 32, top: '50%', transform: 'translateY(-50%)' }
            return (
              <div
                key={a.key}
                className="absolute"
                style={{
                  left: x - size / 2, top: y - size / 2, width: size, height: size,
                  transition: `left .8s cubic-bezier(.7,0,.2,1) ${i * 50}ms, top .8s cubic-bezier(.7,0,.2,1) ${i * 50}ms, width .8s ease ${i * 50}ms, height .8s ease ${i * 50}ms`,
                  opacity: atLeast('nodes') ? 1 : 0,
                }}
              >
                {/* tmavé „pouzdro“ kolem uzlu */}
                <div
                  className="absolute"
                  style={{ inset: -6, background: '#16295a', opacity: inHub ? 1 : 0, transition: 'opacity .3s ease' }}
                />
                <div
                  data-px
                  className="absolute inset-0"
                  style={{ background: a.color, animation: atLeast('nodes') ? `intro-pop .45s cubic-bezier(.16,1,.3,1) ${i * 110}ms both` : undefined }}
                />
                <p
                  className="absolute whitespace-nowrap text-white text-[15px] font-semibold leading-none"
                  style={{ ...labelStyle, opacity: phase === 'nodes' ? 1 : 0, transition: 'opacity .35s ease' }}
                >
                  {a.label}
                </p>
              </div>
            )
          })}

          {/* 5) Značka 4B v rámečku + název */}
          {atLeast('logo') && (
            <>
              <div
                className="absolute"
                style={{
                  left: CX - 100, top: LOGO_CY - 100, width: 200, height: 200,
                  transform: phase === 'out' ? 'scale(.35)' : 'scale(1)',
                  opacity: phase === 'out' ? 0 : 1,
                  transition: 'transform .8s cubic-bezier(.7,0,.3,1), opacity .6s ease .2s',
                }}
              >
                <div className="absolute inset-0" style={{ border: `2px solid ${NAVY_LINE}`, animation: 'intro-frame .7s cubic-bezier(.16,1,.3,1) both' }} />
                <div className="absolute" style={{ inset: 12, border: '1px solid rgba(92,123,181,0.4)', animation: 'intro-frame .7s cubic-bezier(.16,1,.3,1) .1s both' }} />
                <div className="absolute" style={{ inset: 22, border: '1px solid rgba(255,255,255,0.12)', animation: 'intro-frame .7s cubic-bezier(.16,1,.3,1) .2s both' }} />
                {[[100, 6], [100, 194], [6, 100], [194, 100]].map(([x, y]) => (
                  <span key={`${x}-${y}`} className="absolute bg-navy-400" style={{ left: x - 1.5, top: y - 1.5, width: 3, height: 3, animation: 'intro-fade .4s ease .4s both' }} />
                ))}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/symbol-white.svg"
                  alt="4B"
                  className="absolute"
                  style={{ left: 40, top: 67, width: 120, height: 'auto', animation: 'intro-pop .6s cubic-bezier(.16,1,.3,1) .15s both' }}
                />
              </div>
              <div
                className="absolute left-0 right-0 text-center"
                style={{ top: LOGO_CY + 130, opacity: phase === 'out' ? 0 : 1, transition: 'opacity .4s ease' }}
              >
                <p
                  className="font-headline text-white text-[44px] leading-none mb-4"
                  style={{ fontWeight: 600, animation: 'intro-rise .7s cubic-bezier(.16,1,.3,1) .35s both' }}
                >
                  HR Portál
                </p>
                <p className="text-[16px]" style={{ color: MUTED, animation: 'intro-rise .7s cubic-bezier(.16,1,.3,1) .55s both' }}>
                  Makáme naplno. Ale umíme i vypnout.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
