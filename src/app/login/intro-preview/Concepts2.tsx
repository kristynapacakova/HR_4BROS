'use client'

import type { CSSProperties } from 'react'
import { CX, LOGO_CY, LINE, MUTED, LAV, GOLD, VIOLET, MINT, seeded, useTimeline, Shell, EndMark, Caption } from './Concepts'

/* Sekce portálu — to, kvůli čemu tam lidé chodí */
type SectionKey = 'smlouvy' | 'odmeny' | 'majetek' | 'smernice' | 'schranka' | 'tym'
const SECTIONS: { key: SectionKey; name: string; hint: string; color: string }[] = [
  { key: 'smlouvy', name: 'Smlouvy', hint: 'Všechno podepsané', color: VIOLET },
  { key: 'odmeny', name: 'Odměny', hint: 'Kolik a za co', color: GOLD },
  { key: 'tym', name: 'Tým', hint: 'Kdo je kdo, koníčky, narozeniny', color: MINT },
  { key: 'majetek', name: 'Majetek', hint: 'Co mám zapůjčené', color: LAV },
  { key: 'smernice', name: 'Směrnice', hint: 'Jak to u nás chodí', color: '#FFFFFF' },
  { key: 'schranka', name: 'Schránka důvěry', hint: 'Anonymně a bezpečně', color: '#a97cfc' },
]

/** Jednoduché geometrické ikony v duchu brandu (ostré hrany, čtverce). */
export function Icon({ k, size = 40, stroke = '#FFFFFF', accent }: { k: SectionKey; size?: number; stroke?: string; accent: string }) {
  const s = { stroke, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {k === 'smlouvy' && (
        <>
          <rect x="10" y="5" width="28" height="38" {...s} />
          <path d="M16 13H32M16 19H32M16 25H26" {...s} />
          <path d="M15 35 C18 29 20 39 23 34 S28 31 33 33" {...s} stroke={accent} />
        </>
      )}
      {k === 'odmeny' && (
        <>
          <rect x="8" y="20" width="32" height="21" {...s} />
          <rect x="6" y="14" width="36" height="7" {...s} />
          <rect x="21.5" y="14" width="5" height="27" fill={accent} />
          <rect x="15" y="7" width="7" height="7" fill={accent} />
          <rect x="26" y="7" width="7" height="7" fill={accent} />
        </>
      )}
      {k === 'tym' && (
        <>
          <rect x="19" y="8" width="10" height="10" fill={accent} />
          <path d="M14 40V31Q14 24 21 24H27Q34 24 34 31V40" {...s} />
          <rect x="5" y="15" width="7" height="7" {...s} />
          <path d="M3 38V33Q3 28 8 28" {...s} />
          <rect x="36" y="15" width="7" height="7" {...s} />
          <path d="M45 38V33Q45 28 40 28" {...s} />
        </>
      )}
      {k === 'majetek' && (
        <>
          <rect x="9" y="9" width="30" height="21" {...s} />
          <path d="M4 35H44L41 40H7Z" {...s} />
          <rect x="30" y="13" width="6" height="6" fill={accent} />
        </>
      )}
      {k === 'smernice' && (
        <>
          <path d="M24 12V41" {...s} />
          <path d="M24 12H6V39H24M24 12H42V39H24" {...s} />
          <path d="M10 19H19M10 25H19M29 19H38M29 25H38" {...s} stroke={accent} />
        </>
      )}
      {k === 'schranka' && (
        <>
          <rect x="4" y="11" width="34" height="24" {...s} />
          <path d="M4 11L21 25L38 11" {...s} />
          <rect x="30" y="28" width="14" height="12" fill={accent} />
          <path d="M33 28V24H41V28" {...s} stroke={accent} />
        </>
      )}
    </svg>
  )
}

/* ─────────────────────  D) Na jednom místě — rozházené papíry se srovnají  ───────────────────── */

export function IntroOnePlace({ onDone }: { onDone: () => void }) {
  const { phase, at, finish } = useTimeline(
    ['scatter', 'row', 'stack', 'logo', 'out', 'end'],
    [0, 2300, 4700, 5500, 7500, 8300],
    onDone,
  )
  const CW = 124, CH = 156, GAP = 12
  const RL = CX - (6 * CW + 5 * GAP) / 2
  const RT = 160
  const rnd = seeded(23)
  const scatter = [
    [70, 60], [560, 30], [330, 250], [690, 230], [150, 265], [440, 80],
  ].map(([x, y]) => ({ x: x + (rnd() - 0.5) * 40, y: y + (rnd() - 0.5) * 40, rot: (rnd() - 0.5) * 34 }))

  return (
    <Shell out={phase === 'out'} onSkip={finish}>
      {SECTIONS.map((sec, i) => {
        const st = scatter[i]
        let left = st.x, top = st.y, rot = st.rot
        if (at('row')) { left = RL + i * (CW + GAP); top = RT; rot = 0 }
        if (at('stack')) { left = CX - CW / 2 + (i - 2.5) * 3; top = LOGO_CY - CH / 2 + (i - 2.5) * -3; rot = (i - 2.5) * 2 }
        const style: CSSProperties = {
          left, top, width: CW, height: CH,
          transform: `rotate(${rot}deg) scale(${at('stack') ? 0.9 : 1})`,
          opacity: at('logo') ? 0 : 1,
          transition: at('stack')
            ? `left .6s cubic-bezier(.7,0,.2,1) ${i * 50}ms, top .6s cubic-bezier(.7,0,.2,1) ${i * 50}ms, transform .6s ease ${i * 50}ms, opacity .3s ease`
            : `left 1s cubic-bezier(.16,1,.3,1) ${i * 70}ms, top 1s cubic-bezier(.16,1,.3,1) ${i * 70}ms, transform 1s cubic-bezier(.16,1,.3,1) ${i * 70}ms`,
          animation: `intro-pop .5s cubic-bezier(.16,1,.3,1) ${i * 140}ms both`,
        }
        return (
          <div key={sec.key} className="absolute bg-white" style={style}>
            <div className="absolute left-0 right-0 top-0" style={{ height: 6, background: sec.color === '#FFFFFF' ? '#0d214f' : sec.color }} />
            <div className="absolute" style={{ left: 12, top: 18 }}>
              <Icon k={sec.key} size={40} stroke="#0d214f" accent={sec.color === '#FFFFFF' || sec.color === LAV ? '#834DFB' : sec.color} />
            </div>
            {/* „řádky textu“ */}
            <div className="absolute" style={{ left: 12, right: 12, top: 70 }}>
              {[100, 80, 90].map((w, k) => (
                <div key={k} style={{ height: 4, width: `${w}%`, background: 'rgba(13,33,79,0.12)', marginBottom: 6 }} />
              ))}
            </div>
            <div className="absolute" style={{ left: 12, right: 10, bottom: 12 }}>
              <p className="text-navy text-[13px] font-bold leading-tight">{sec.name}</p>
              <p className="text-navy/60 text-[10px] leading-snug mt-0.5">{sec.hint}</p>
            </div>
          </div>
        )
      })}

      <Caption show={phase === 'scatter'} top={478} style={{ fontSize: 26 }}>
        Smlouva v mailu, směrnice na disku, notebook v tabulce…
      </Caption>
      <Caption show={phase === 'row'} top={380}>
        Teď všechno na <span style={{ color: GOLD }}>jednom místě.</span>
      </Caption>

      {at('logo') && <EndMark out={phase === 'out'} />}
    </Shell>
  )
}

/* ─────────────────────  E) Mozaika — dlaždice 4×4 se otáčí na sekce  ───────────────────── */

const MOSAIC_SLOTS = [1, 4, 6, 9, 11, 14] // kde v mřížce 4×4 leží sekce
const DECOR = ['#16295a', '#1d356d', '#16295a', '#1d356d']

export function IntroMosaic({ onDone }: { onDone: () => void }) {
  const flips = SECTIONS.map((_, k) => `f${k}`)
  const { phase, at, finish } = useTimeline(
    ['grid', ...flips, 'all', 'shrink', 'logo', 'out', 'end'],
    [0, 900, 1350, 1800, 2250, 2700, 3150, 3700, 5300, 5900, 7900, 8700],
    onDone,
  )
  const T = 92, G = 8
  const GL = CX - (4 * T + 3 * G) / 2
  const GT = 46
  const flipped = SECTIONS.filter((_, k) => at(`f${k}`)).length
  const last = flipped > 0 ? SECTIONS[flipped - 1] : null
  const shrink = at('shrink')

  return (
    <Shell out={phase === 'out'} onSkip={finish}>
      <div
        className="absolute"
        style={{
          left: GL, top: GT, width: 4 * T + 3 * G, height: 4 * T + 3 * G,
          transformOrigin: 'center',
          transform: shrink ? `translate(0px, ${LOGO_CY - (GT + (4 * T + 3 * G) / 2)}px) scale(.5)` : 'none',
          opacity: at('logo') ? 0 : 1,
          transition: 'transform .7s cubic-bezier(.7,0,.2,1), opacity .35s ease',
        }}
      >
        {Array.from({ length: 16 }).map((_, i) => {
          const r = Math.floor(i / 4), c = i % 4
          const slot = MOSAIC_SLOTS.indexOf(i)
          const sec = slot >= 0 ? SECTIONS[slot] : null
          const isFlipped = sec ? at(`f${slot}`) : at('all')
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: c * (T + G), top: r * (T + G), width: T, height: T, perspective: 600, animation: `intro-pop .45s cubic-bezier(.16,1,.3,1) ${(r + c) * 70}ms both` }}
            >
              <div
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d', transform: isFlipped && sec ? 'rotateY(180deg)' : 'none', transition: 'transform .65s cubic-bezier(.3,1.3,.5,1)' }}
              >
                {/* líc */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    border: '1px solid rgba(92,123,181,0.45)',
                    background: !sec && isFlipped ? DECOR[(r + c) % 4] : 'transparent',
                    transition: `background-color .4s ease ${(r * 4 + c) * 30}ms`,
                  }}
                />
                {/* rub — sekce */}
                {sec && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: sec.color }}
                  >
                    <Icon k={sec.key} size={40} stroke="#0d214f" accent={sec.color === GOLD ? VIOLET : '#0d214f'} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-navy text-center leading-tight px-1">{sec.name}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* popisek právě otočené sekce */}
      <div
        className="absolute left-0 right-0 text-center"
        style={{ top: 462, opacity: flipped > 0 && !at('all') ? 1 : 0, transition: 'opacity .3s ease' }}
      >
        <p key={last?.key} style={{ animation: 'intro-rise .4s cubic-bezier(.16,1,.3,1) both' }}>
          <span className="font-headline text-white text-[28px]" style={{ fontWeight: 600 }}>{last?.name}</span>
          <span className="block text-[14px] mt-1" style={{ color: MUTED }}>{last?.hint}</span>
        </p>
      </div>
      <Caption show={phase === 'all'} top={468}>
        Všechno pro práci i tým. <span style={{ color: GOLD }}>Na jednom místě.</span>
      </Caption>

      {at('logo') && <EndMark out={phase === 'out'} />}
    </Shell>
  )
}

/* ─────────────────────  F) Moje složka — osobní přehled se plní  ───────────────────── */

const FOLDER_ROWS: { key: SectionKey; title: string; sub: string; chip: string; chipBg: string; chipFg: string }[] = [
  { key: 'smlouvy', title: 'Rámcová smlouva o spolupráci', sub: 'Smlouvy', chip: 'Podepsáno ✓', chipBg: VIOLET, chipFg: '#FFFFFF' },
  { key: 'odmeny', title: 'Odměna za Q3', sub: 'Odměny', chip: 'Schváleno', chipBg: GOLD, chipFg: '#0d214f' },
  { key: 'majetek', title: 'MacBook Pro 14″', sub: 'Majetek · zapůjčeno od 03/2025', chip: 'U mě', chipBg: LAV, chipFg: '#0d214f' },
  { key: 'tym', title: 'Eva má zítra narozeniny', sub: 'Tým · baví ji lezení a keramika', chip: 'Popřát', chipBg: MINT, chipFg: '#0d214f' },
  { key: 'smernice', title: 'Směrnice: Home office', sub: 'Interní směrnice', chip: 'Nová verze', chipBg: 'transparent', chipFg: '#FFFFFF' },
  { key: 'schranka', title: 'Schránka důvěry', sub: 'Ozvi se anonymně', chip: 'Anonymně', chipBg: 'transparent', chipFg: '#a97cfc' },
]

export function IntroFolder({ onDone }: { onDone: () => void }) {
  const rows = FOLDER_ROWS.map((_, k) => `r${k}`)
  const { phase, at, finish } = useTimeline(
    ['folder', ...rows, 'claim', 'close', 'logo', 'out', 'end'],
    [0, 700, 1100, 1500, 1900, 2300, 2700, 3500, 5000, 5600, 7600, 8400],
    onDone,
  )
  const FW = 580, FH = 318
  const FL = CX - FW / 2, FT = 118
  const close = at('close')
  const RH = 44

  return (
    <Shell out={phase === 'out'} onSkip={finish}>
      <Caption show={!at('claim') && at('r0')} top={34} style={{ fontSize: 28 }}>
        Tvoje smlouvy, odměny, majetek i tým.
      </Caption>
      <Caption show={phase === 'claim'} top={34} style={{ fontSize: 28 }}>
        Všechno pod <span style={{ color: GOLD }}>jedním přihlášením.</span>
      </Caption>

      {/* složka — při zavření se smrskne do rámečku 4B */}
      <div
        className="absolute"
        style={{
          left: close ? CX - 100 : FL,
          top: close ? LOGO_CY - 100 : FT,
          width: close ? 200 : FW,
          height: close ? 200 : FH,
          background: close ? 'transparent' : '#16295a',
          border: `2px solid ${LINE}`,
          opacity: at('logo') ? 0 : 1,
          transition: 'left .65s cubic-bezier(.7,0,.2,1), top .65s cubic-bezier(.7,0,.2,1), width .65s cubic-bezier(.7,0,.2,1), height .65s cubic-bezier(.7,0,.2,1), background-color .4s ease, opacity .25s ease',
          animation: 'intro-pop .55s cubic-bezier(.16,1,.3,1) both',
        }}
      >
        {/* ouško složky */}
        <div
          className="absolute flex items-center gap-2 px-3"
          style={{ left: -2, top: -30, height: 28, background: LINE, opacity: close ? 0 : 1, transition: 'opacity .25s ease' }}
        >
          <span style={{ width: 8, height: 8, background: GOLD, display: 'inline-block' }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">Moje složka</span>
        </div>

        <div className="absolute" style={{ left: 18, right: 18, top: 14, opacity: close ? 0 : 1, transition: 'opacity .2s ease' }}>
          {FOLDER_ROWS.map((row, k) => {
            const sec = SECTIONS.find(s => s.key === row.key)!
            const shown = at(`r${k}`)
            return (
              <div
                key={row.key}
                className="flex items-center gap-3"
                style={{
                  height: RH, marginBottom: 4,
                  borderBottom: k < FOLDER_ROWS.length - 1 ? '1px solid rgba(92,123,181,0.25)' : 'none',
                  opacity: shown ? 1 : 0,
                  transform: shown ? 'none' : 'translateX(40px)',
                  transition: 'opacity .4s ease, transform .55s cubic-bezier(.16,1,.3,1)',
                }}
              >
                <Icon k={row.key} size={30} accent={sec.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[14px] font-semibold leading-tight truncate">{row.title}</p>
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: MUTED }}>{row.sub}</p>
                </div>
                <span
                  className="btn-pill text-[10px] font-bold uppercase tracking-[0.06em] px-3 py-1.5 whitespace-nowrap"
                  style={{
                    background: row.chipBg, color: row.chipFg,
                    border: row.chipBg === 'transparent' ? `1px solid ${row.chipFg}` : 'none',
                    transform: shown ? 'scale(1)' : 'scale(.4)',
                    transition: 'transform .4s cubic-bezier(.3,1.6,.5,1) .3s',
                  }}
                >
                  {row.chip}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {at('logo') && <EndMark out={phase === 'out'} />}
    </Shell>
  )
}

/* ─────────────────────  G) Dvě strany — pro každého × pro HR  ───────────────────── */

const TEAMS: { name: string; people: ('hpp' | 'osvc' | 'dpp')[] }[] = [
  { name: 'Performance', people: ['hpp', 'hpp', 'hpp', 'hpp', 'osvc', 'osvc', 'hpp', 'dpp'] },
  { name: 'Kreativa', people: ['hpp', 'osvc', 'osvc', 'hpp', 'osvc', 'dpp'] },
  { name: 'Data', people: ['hpp', 'hpp', 'osvc', 'hpp', 'hpp'] },
  { name: 'Obchod', people: ['hpp', 'hpp', 'osvc', 'dpp'] },
  { name: 'Back office', people: ['hpp', 'hpp', 'dpp'] },
]
const CONTRACT: Record<'hpp' | 'osvc' | 'dpp', string> = { hpp: LAV, osvc: VIOLET, dpp: GOLD }
const FLUCT = [9, 8.6, 8.8, 7.9, 7.2, 7.4, 6.5, 6.1, 5.6, 5.2, 4.6, 4.2]

export function IntroTwoSides({ onDone }: { onDone: () => void }) {
  const { phase, at, finish } = useTimeline(
    ['split', 'left', 'right', 'claim', 'merge', 'logo', 'out', 'end'],
    [0, 500, 1900, 3900, 5300, 5900, 7900, 8700],
    onDone,
  )
  const merge = at('merge')
  const panel = (side: -1 | 1): CSSProperties => ({
    transform: merge ? `translateX(${side * -200}px) scale(.3)` : 'none',
    opacity: merge ? 0 : 1,
    transition: 'transform .6s cubic-bezier(.7,0,.2,1), opacity .5s ease .1s',
  })
  const fade = (on: boolean, d = 0): CSSProperties => ({ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(8px)', transition: `opacity .45s ease ${d}ms, transform .55s cubic-bezier(.16,1,.3,1) ${d}ms` })

  return (
    <Shell out={phase === 'out'} onSkip={finish}>
      {/* dělicí čára */}
      <div className="absolute" style={{ left: CX, top: 60, width: 1, height: 400, background: LINE, transformOrigin: 'top', animation: 'intro-grow-y .7s cubic-bezier(.65,0,.35,1) both', opacity: merge ? 0 : 1, transition: 'opacity .3s' }} />

      {/* LEVÁ — pro každého */}
      <div className="absolute" style={{ left: 50, top: 60, width: 370, height: 400, ...panel(-1) }}>
        <div style={fade(at('left'))}>
          <p className="kicker text-gold text-[11px] mb-2">Pro každého</p>
          <p className="font-headline text-white text-[24px] leading-tight mb-6" style={{ fontWeight: 600 }}>Moje věci na jednom místě</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SECTIONS.map((sec, k) => (
            <div
              key={sec.key}
              className="flex flex-col items-start justify-between p-3"
              style={{ height: 104, border: '1px solid rgba(92,123,181,0.45)', background: '#16295a', ...fade(at('left'), 250 + k * 140) }}
            >
              <Icon k={sec.key} size={34} accent={sec.color} />
              <p className="text-white text-[12px] font-semibold leading-tight">{sec.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRAVÁ — pro HR */}
      <div className="absolute" style={{ left: 480, top: 60, width: 380, height: 400, ...panel(1) }}>
        <div style={fade(at('right'))}>
          <p className="kicker text-[11px] mb-2" style={{ color: MINT }}>Pro HR</p>
          <p className="font-headline text-white text-[24px] leading-tight mb-5" style={{ fontWeight: 600 }}>Jak si firma vede</p>
        </div>

        <div style={fade(at('right'), 150)}>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-white text-[12px] font-semibold">Lidé v týmech</p>
            <p className="flex gap-3 text-[10px]" style={{ color: LAV }}>
              {(['hpp', 'osvc', 'dpp'] as const).map(c => (
                <span key={c} className="flex items-center gap-1">
                  <span style={{ width: 8, height: 8, background: CONTRACT[c], display: 'inline-block' }} />
                  {c === 'hpp' ? 'HPP' : c === 'osvc' ? 'OSVČ' : 'DPP'}
                </span>
              ))}
            </p>
          </div>
          {TEAMS.map((t, r) => (
            <div key={t.name} className="flex items-center gap-3" style={{ height: 22 }}>
              <p className="text-[11px] w-[84px] flex-shrink-0" style={{ color: MUTED }}>{t.name}</p>
              <div className="flex gap-[3px]">
                {t.people.map((p, k) => (
                  <span
                    key={k}
                    style={{ width: 13, height: 13, background: CONTRACT[p], display: 'inline-block', animation: at('right') ? `intro-pop .35s cubic-bezier(.16,1,.3,1) ${400 + r * 120 + k * 45}ms both` : undefined, opacity: at('right') ? undefined : 0 }}
                  />
                ))}
              </div>
              <p className="text-white text-[11px] font-semibold ml-auto" style={{ opacity: at('right') ? 1 : 0, transition: `opacity .3s ease ${900 + r * 120}ms` }}>{t.people.length}</p>
            </div>
          ))}
        </div>

        <div className="mt-5" style={fade(at('right'), 900)}>
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-white text-[12px] font-semibold">Fluktuace · 12 měsíců</p>
            <p className="font-headline text-[22px] leading-none" style={{ color: MINT, fontWeight: 600 }}>↓ 4,2 %</p>
          </div>
          <svg width="380" height="70" aria-hidden="true">
            <polyline
              points={FLUCT.map((v, i) => `${10 + i * 32},${8 + (9.5 - v) * 10}`).join(' ')}
              fill="none" stroke={MINT} strokeOpacity=".6" strokeWidth="2" pathLength={1}
              style={{ strokeDasharray: 1, animation: at('right') ? 'intro-draw 1.2s ease 1.1s both' : undefined, opacity: at('right') ? 1 : 0 }}
            />
            {FLUCT.map((v, i) => (
              <rect
                key={i} x={10 + i * 32 - 4} y={8 + (9.5 - v) * 10 - 4} width="8" height="8" fill={i === FLUCT.length - 1 ? GOLD : MINT}
                style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: at('right') ? `intro-pop .3s ease ${1100 + i * 90}ms both` : undefined, opacity: at('right') ? undefined : 0 }}
              />
            ))}
          </svg>
        </div>
      </div>

      <Caption show={phase === 'claim'} top={478} style={{ fontSize: 28 }}>
        Jeden portál. <span style={{ color: GOLD }}>Pro lidi i pro HR.</span>
      </Caption>

      {at('logo') && <EndMark out={phase === 'out'} />}
    </Shell>
  )
}
