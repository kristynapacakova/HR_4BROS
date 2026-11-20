'use client'

import { useEffect, useRef, useState } from 'react'

const SIZE = 92
const TICKS = 24
const TICK_W = 4
const TICK_H = 9
const RADIUS = SIZE / 2 - TICK_H / 2 - 2

export function RingStat({ pct, value, label, tone = 'strong' }: {
  pct: number
  value: string
  label: string
  tone?: 'strong' | 'soft'
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const [animatedLit, setAnimatedLit] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const litTarget = Math.round((clamped / 100) * TICKS)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => setAnimatedLit(litTarget))
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [litTarget])

  const color = tone === 'strong' ? '#4DE791' : '#834DFB'

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {Array.from({ length: TICKS }).map((_, i) => {
          const deg = (360 / TICKS) * i
          const lit = i < animatedLit
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: SIZE / 2 - TICK_W / 2,
                top: SIZE / 2 - RADIUS - TICK_H,
                width: TICK_W,
                height: TICK_H,
                background: lit ? color : '#F1F0F7',
                transform: `rotate(${deg}deg)`,
                transformOrigin: `50% ${RADIUS + TICK_H}px`,
                transition: 'background 0.25s ease',
                transitionDelay: `${i * 18}ms`,
              }}
            />
          )
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-headline font-semibold text-navy">{value}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2 max-w-[8.5rem] leading-snug">{label}</p>
    </div>
  )
}
