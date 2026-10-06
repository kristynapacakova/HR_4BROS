const SIZE = 92
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function RingStat({ pct, value, label, tone = 'strong' }: {
  pct: number
  value: string
  label: string
  tone?: 'strong' | 'soft'
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = CIRCUMFERENCE * (1 - clamped / 100)

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#F1F0F7" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={tone === 'strong' ? '#7e17e0' : '#194669'}
            strokeOpacity={tone === 'strong' ? 1 : 0.55}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
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
