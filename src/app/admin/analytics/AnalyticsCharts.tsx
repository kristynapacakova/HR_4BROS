'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { departmentColor } from '@/lib/team-colors'

interface HeadcountPoint { month: string; count: number }
interface FluctuationPoint { month: string; nastupy: number; odchody: number }
interface DeptPoint { department: string; count: number }

// Brandová paleta (tailwind.config.ts)
const NAVY = '#0d214f'
const NAVY_400 = '#5c7bb5'
const NAVY_100 = '#e8eaf2'
const VIOLET = '#834dfb'
const GOLD = '#F0E100'

const tooltipStyle = {
  backgroundColor: '#fff',
  border: `1px solid ${NAVY}`,
  borderRadius: 0,
  fontSize: '12px',
  color: NAVY,
}

const axisTick = { fontSize: 12, fill: NAVY_400 }

/** Čtvercový marker; poslední měsíc zlatě, první a poslední s popiskem hodnoty. */
function makeSquareDot(lastIndex: number) {
  function SquareDot(props: { cx?: number; cy?: number; index?: number; value?: number | number[] }) {
    const { cx, cy, index, value } = props
    if (cx == null || cy == null) return <g />
    const isLast = index === lastIndex
    const isFirst = index === 0
    const size = isLast ? 12 : 8
    const v = Array.isArray(value) ? value[value.length - 1] : value
    return (
      <g>
        <rect
          x={cx - size / 2}
          y={cy - size / 2}
          width={size}
          height={size}
          fill={isLast ? GOLD : '#fff'}
          stroke={NAVY}
          strokeWidth={2}
        />
        {(isFirst || isLast) && v != null && (
          <text
            x={cx}
            y={cy - 12}
            textAnchor={isLast ? 'end' : 'start'}
            fontSize={13}
            fontWeight={600}
            fill={NAVY}
          >
            {v}
          </text>
        )}
      </g>
    )
  }
  return SquareDot
}

export function AnalyticsCharts({
  headcountTrend,
  fluctuation,
  departmentHeadcount,
  nastupy,
  odchody,
}: {
  headcountTrend: HeadcountPoint[]
  fluctuation: FluctuationPoint[]
  departmentHeadcount: DeptPoint[]
  nastupy: number
  odchody: number
}) {
  const lastIndex = headcountTrend.length - 1
  const first = headcountTrend[0]?.count ?? 0
  const last = headcountTrend[lastIndex]?.count ?? 0
  const delta = last - first

  const deptTotal = departmentHeadcount.reduce((s, d) => s + d.count, 0)
  const deptMax = Math.max(1, ...departmentHeadcount.map((d) => d.count))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Headcount trend — line + čtvercové markery */}
      <div className="lg:col-span-2 bg-white border border-[rgba(13,33,79,0.14)] p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="kicker mb-1">Headcount · posledních 12 měsíců</p>
            <h3 className="font-headline text-navy text-lg" style={{ fontWeight: 600 }}>Vývoj počtu zaměstnanců</h3>
          </div>
          <div className="text-right">
            <p className="font-headline text-navy text-2xl leading-none" style={{ fontWeight: 600 }}>{last}</p>
            <p className="text-xs text-navy-400 mt-1">{delta >= 0 ? '+' : ''}{delta} za 12 měsíců</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={headcountTrend} margin={{ top: 24, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={NAVY_100} vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: NAVY_100 }} tickLine={false} />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[(min: number) => Math.max(0, min - 2), (max: number) => max + 2]}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: NAVY_400, strokeDasharray: '3 3' }} />
            <Line
              type="linear"
              dataKey="count"
              name="Zaměstnanců"
              stroke={NAVY}
              strokeWidth={2}
              dot={makeSquareDot(lastIndex)}
              activeDot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Oddělení — 100% pruh + horizontální sloupce podle týmů */}
      <div className="bg-white border border-[rgba(13,33,79,0.14)] p-6">
        <p className="kicker mb-1">Týmy</p>
        <h3 className="font-headline text-navy text-lg mb-1" style={{ fontWeight: 600 }}>Oddělení</h3>
        <p className="text-xs text-navy-400 mb-4">{deptTotal} lidí v {departmentHeadcount.length} týmech</p>

        {/* 100% stacked strip */}
        <div className="flex h-3 w-full mb-5 border border-navy" role="img" aria-label="Podíl týmů na počtu lidí">
          {departmentHeadcount.map((d) => (
            <div
              key={d.department}
              title={`${d.department}: ${d.count}`}
              style={{ width: `${(d.count / Math.max(1, deptTotal)) * 100}%`, backgroundColor: departmentColor(d.department) }}
            />
          ))}
        </div>

        <div className="space-y-2">
          {departmentHeadcount.map((d) => {
            const pct = Math.round((d.count / Math.max(1, deptTotal)) * 100)
            return (
              <div key={d.department} className="text-xs">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-navy font-medium truncate">{d.department}</span>
                  <span className="text-navy tabular-nums flex-shrink-0">
                    <span className="font-semibold">{d.count}</span>
                    <span className="text-navy-400"> · {pct}%</span>
                  </span>
                </div>
                <div className="h-3 bg-navy-50">
                  <div
                    className="h-full border border-navy"
                    style={{ width: `${(d.count / deptMax) * 100}%`, backgroundColor: departmentColor(d.department) }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fluctuation bar chart - full width */}
      <div className="lg:col-span-3 bg-white border border-[rgba(13,33,79,0.14)] p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="kicker mb-1">Měsíční přehled · posledních 12 měsíců</p>
            <h3 className="font-headline text-navy text-lg" style={{ fontWeight: 600 }}>Fluktuace — nástupy a odchody</h3>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-navy inline-block" />
              <span className="text-navy">Nástupy ({nastupy})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-violet inline-block" />
              <span className="text-navy">Odchody ({odchody})</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={fluctuation} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid stroke={NAVY_100} vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: NAVY_100 }} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f3f0fd' }} />
            <Bar dataKey="nastupy" name="Nástupy" fill={NAVY} maxBarSize={28} isAnimationActive={false} />
            <Bar dataKey="odchody" name="Odchody" fill={VIOLET} maxBarSize={28} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
