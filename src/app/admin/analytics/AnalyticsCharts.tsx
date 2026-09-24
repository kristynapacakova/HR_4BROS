'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface HeadcountPoint { month: string; count: number }
interface FluctuationPoint { month: string; nastupy: number; odchody: number }
interface DeptPoint { department: string; count: number }

const DEPT_COLORS = ['#0E2337', '#7e17e0', '#3D6687', '#9b45e8', '#5A7D9A', '#6010b8']

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#0E2337',
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Headcount trend - spans 2 cols */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-headline font-semibold text-navy mb-1">Vývoj počtu zaměstnanců</h3>
        <p className="text-xs text-slate-400 mb-5">Celkový počet zaměstnanců v průběhu roku 2024</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={headcountTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0E2337" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0E2337" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="count"
              name="Zaměstnanců"
              stroke="#0E2337"
              strokeWidth={2}
              fill="url(#navyGrad)"
              dot={{ fill: '#0E2337', r: 3 }}
              activeDot={{ r: 5, fill: '#7e17e0' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Department pie */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-headline font-semibold text-navy mb-1">Oddělení</h3>
        <p className="text-xs text-slate-400 mb-4">Rozložení zaměstnanců</p>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={departmentHeadcount}
              dataKey="count"
              nameKey="department"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
            >
              {departmentHeadcount.map((_, i) => (
                <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5 mt-3">
          {departmentHeadcount.map((d, i) => (
            <div key={d.department} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                <span className="text-slate-600">{d.department}</span>
              </div>
              <span className="font-medium text-navy">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fluctuation bar chart - full width */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-headline font-semibold text-navy mb-1">Fluktuace — nástupy a odchody</h3>
            <p className="text-xs text-slate-400">Měsíční přehled za rok 2024</p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-navy inline-block" />
              <span className="text-slate-500">Nástupy ({nastupy})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-violet inline-block" />
              <span className="text-slate-500">Odchody ({odchody})</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={fluctuation} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="nastupy" name="Nástupy" fill="#0E2337" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="odchody" name="Odchody" fill="#7e17e0" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
