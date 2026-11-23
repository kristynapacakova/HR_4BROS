'use client'

import { useEffect, useRef, useState } from 'react'

const SIZE = 92
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const TONE_COLOR: Record<string, string> = {
  strong: '#4DE791',
  soft: '#834DFB',
  gold: '#F0E100',
}

export function RingStat({ pct, value, label, tone = 'strong' }: {
  pct: number
  value: string
  label: string
  tone?: 'strong' | 'soft' | 'gold'
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const [animatedPct, setAnimatedPct] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => setAnimatedPct(clamped))
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [clamped])

  const offset = CIRCUMFERENCE * (1 - animatedPct / 100)
  const color = TONE_COLOR[tone] ?? TONE_COLOR.strong

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#F1F0F7" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-headline font-semibold text-navy">{value}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2 max-w-[8.5rem] leading-snug">{label}</p>
    </div>
  )
}
