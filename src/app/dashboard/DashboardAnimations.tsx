'use client'

import { useEffect, useState, type CSSProperties } from 'react'

/* Animace pro Dashboard. Respektují prefers-reduced-motion (globals.css → .dash-anim). */

/** 1 · Odpočet jako trhací kalendář — pár lístků odletí a zastaví se na počtu dní. V den termínu mint ✓. */
export function TearCountdown({ days, label }: { days: number; label: string }) {
  const start = days + 6
  const [n, setN] = useState(start)
  const [torn, setTorn] = useState<{ key: number; v: number }[]>([])
  useEffect(() => {
    if (n <= days) return
    const t = setTimeout(() => {
      setTorn(prev => [...prev, { key: Date.now() + n, v: n }])
      setN(v => v - 1)
    }, n === start ? 350 : 110)
    return () => clearTimeout(t)
  }, [n, days, start])
  useEffect(() => {
    if (!torn.length) return
    const t = setTimeout(() => setTorn(prev => prev.slice(1)), 600)
    return () => clearTimeout(t)
  }, [torn])

  const done = days === 0 && n === 0
  return (
    <span className="dash-anim relative inline-block flex-shrink-0">
      {torn.map(p => (
        <span key={p.key} className="absolute inset-0 bg-gold/90 text-navy px-3 py-2 text-center leading-none pointer-events-none" style={{ animation: 'dash-tear .55s cubic-bezier(.4,0,.7,1) forwards' }}>
          <span className="block font-headline text-[26px]" style={{ fontWeight: 600 }}>{p.v}</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5">&nbsp;</span>
        </span>
      ))}
      <span className={`relative block ${done ? 'bg-mint' : 'bg-gold'} text-navy px-3 py-2 text-center leading-none min-w-[54px]`} style={n === days ? { animation: 'dash-pop .35s ease-out' } : undefined}>
        <span className="block font-headline text-[26px]" style={{ fontWeight: 600 }}>{done ? '✓' : n}</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5">{done ? 'dnes' : label}</span>
      </span>
    </span>
  )
}

/** 2 · Schůdky 4B — vyrostou schod po schodu a na zlatý doskáče violet čtvereček. Kliknutím znovu. */
export function StairsHop({ className = '' }: { className?: string }) {
  const [run, setRun] = useState(0)
  const steps = [10, 18, 26, 34]
  return (
    <button type="button" onClick={() => setRun(r => r + 1)} className={`dash-anim relative block focus:outline-none ${className}`} style={{ width: 68, height: 48 }} aria-label="Přehrát animaci schodů" title="4B">
      <span key={run} className="absolute inset-0">
        {steps.map((h, i) => (
          <span key={h} className={`absolute bottom-0 ${i === 3 ? 'bg-gold' : 'bg-white/20'}`}
            style={{ left: i * 18, width: 14, height: h, transformOrigin: 'bottom', animation: `dash-grow .35s cubic-bezier(.16,1,.3,1) ${i * 0.12}s backwards` }} />
        ))}
        <span className="absolute bottom-0 left-0 bg-violet" style={{ width: 8, height: 8, animation: 'dash-hop 1.5s cubic-bezier(.45,0,.55,1) .65s both' }} />
      </span>
    </button>
  )
}

/** 3 · Scénka podle denní doby vedle pozdravu — ráno vychází slunce, přes den svítí, večer měsíc a hvězdy. */
export type DayPart = 'rano' | 'den' | 'vecer'
export function dayPartNow(): DayPart {
  const h = new Date().getHours()
  return h < 10 ? 'rano' : h < 18 ? 'den' : 'vecer'
}
export function DayScene({ part }: { part: DayPart }) {
  return (
    <svg viewBox="0 0 56 32" width={56} height={32} className="dash-anim block" aria-hidden="true">
      <rect x="0" y="27" width="56" height="2" fill="#FFFFFF" opacity="0.2" />
      {part === 'rano' && (
        <g style={{ animation: 'dash-sun 1.4s cubic-bezier(.16,1,.3,1) both' }}>
          <rect x="22" y="13" width="12" height="12" fill="#F0E100" />
          {[[16, 14], [38, 14], [27, 6]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="3" height="3" fill="#F0E100" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `dash-ray 2s ease-in-out ${1 + i * 0.3}s infinite` }} />
          ))}
        </g>
      )}
      {part === 'den' && (
        <g>
          <rect x="22" y="6" width="12" height="12" fill="#F0E100" style={{ animation: 'dash-sun .9s cubic-bezier(.16,1,.3,1) both' }} />
          {[[16, 10], [37, 10], [27, 0], [27, 21]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="3" height="3" fill="#F0E100" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `dash-ray 1.8s ease-in-out ${i * 0.25}s infinite` }} />
          ))}
        </g>
      )}
      {part === 'vecer' && (
        <g>
          <g style={{ animation: 'dash-sun 1.2s cubic-bezier(.16,1,.3,1) both' }}>
            <rect x="21" y="6" width="13" height="13" fill="#834DFB" />
            <rect x="29" y="6" width="5" height="5" fill="#0D214F" />
          </g>
          {[[8, 6, 0], [44, 4, 0.5], [40, 16, 1], [12, 18, 1.4]].map(([x, y, d], i) => (
            <rect key={i} x={x} y={y} width="2.5" height="2.5" fill="#FFFFFF" style={{ animation: `dash-twinkle 2.2s ease-in-out ${d}s infinite` }} />
          ))}
        </g>
      )}
    </svg>
  )
}

/** 4 · Hotovo — z ✓ vyskočí brandové čtverečky. */
export function DoneBurst({ run = 0 }: { run?: number }) {
  const bits = [
    { c: '#F0E100', dx: -38, dy: -26, r: 40, s: 8 }, { c: '#834DFB', dx: 34, dy: -30, r: -30, s: 7 },
    { c: '#4DE791', dx: 44, dy: 6, r: 60, s: 6 }, { c: '#F0E100', dx: -46, dy: 8, r: -50, s: 5 },
    { c: '#834DFB', dx: -18, dy: -40, r: 20, s: 5 }, { c: '#4DE791', dx: 14, dy: -44, r: -20, s: 8 },
    { c: '#0D214F', dx: 28, dy: 30, r: 45, s: 4 }, { c: '#834DFB', dx: -30, dy: 30, r: -45, s: 6 },
  ]
  return (
    <span key={run} className="dash-anim absolute left-1/2 top-1/2 pointer-events-none" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} className="absolute" style={{
          width: b.s, height: b.s, background: b.c, left: -b.s / 2, top: -b.s / 2,
          ['--dx' as string]: `${b.dx}px`, ['--dy' as string]: `${b.dy}px`, ['--rot' as string]: `${b.r}deg`,
          animation: `dash-burst .9s cubic-bezier(.2,.8,.3,1) ${i * 0.03}s both`,
        } as CSSProperties} />
      ))}
    </span>
  )
}

/** 5 · Dárek u narozenin — malá krabička (gold + violet stuha), víčko občas poskočí. */
export function GiftBox({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className="dash-anim block" aria-hidden="true">
      <rect x="2" y="8" width="14" height="9" fill="#F0E100" />
      <rect x="8" y="8" width="2" height="9" fill="#834DFB" />
      <g style={{ transformBox: 'fill-box', transformOrigin: 'left bottom', animation: 'dash-lid 2.6s ease-in-out infinite' }}>
        <rect x="1" y="5" width="16" height="3" fill="#F0E100" />
        <rect x="8" y="5" width="2" height="3" fill="#834DFB" />
        <rect x="5" y="2" width="3" height="3" fill="#834DFB" />
        <rect x="10" y="2" width="3" height="3" fill="#834DFB" />
      </g>
    </svg>
  )
}

/** 6 · Dlaždice s datem — přiklapne se jako trhací kalendář (rotateX), postupně po sobě. */
export function flipIn(i: number) {
  return { animation: `dash-flip .55s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.12}s backwards`, transformOrigin: 'top' }
}

/** 7 · Linka u novinky se vykreslí shora dolů; nejnovější má pulzující tečku. */
export function drawDown(i: number) {
  return { transformOrigin: 'top', animation: `dash-draw .5s cubic-bezier(.16,1,.3,1) ${0.2 + i * 0.12}s backwards` }
}
export function Ping({ className = 'bg-violet' }: { className?: string }) {
  return (
    <span className="dash-anim relative inline-flex w-2 h-2" aria-hidden="true">
      <span className={`absolute inset-0 ${className}`} style={{ animation: 'dash-ping 1.6s ease-out infinite' }} />
      <span className={`relative w-2 h-2 ${className}`} />
    </span>
  )
}

/** 8 · Checkbox úkolu — po najetí se zaplní mint a vykreslí ✓ (jako by se už odškrtával). */
export function HoverCheck() {
  return (
    <span className="relative w-5 h-5 border-2 border-navy/30 group-hover:border-navy flex-shrink-0 overflow-hidden transition-colors">
      <span className="absolute inset-0 bg-mint origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <svg viewBox="0 0 16 16" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path d="M3 8.5L6.5 12L13 4.5" fill="none" stroke="#0D214F" strokeWidth="2.4" strokeLinecap="square"
          className="[stroke-dasharray:20] [stroke-dashoffset:20] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-300 delay-150" />
      </svg>
    </span>
  )
}
