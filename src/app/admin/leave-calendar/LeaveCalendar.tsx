'use client'

import { useState, useMemo } from 'react'

interface Leave {
  id: string
  userName: string
  department: string
  type: string
  startDate: string
  endDate: string
  status: string
}

const TYPE_COLORS: Record<string, { dot: string; cell: string; label: string }> = {
  ANNUAL:         { dot: 'bg-green-400',  cell: 'bg-green-100 text-green-700',   label: 'Dovolená' },
  PLACENE_VOLNO:  { dot: 'bg-blue-400',   cell: 'bg-blue-100 text-blue-700',     label: 'Placené volno' },
  PERSONAL:       { dot: 'bg-blue-400',   cell: 'bg-blue-100 text-blue-700',     label: 'Placené volno' },
  NEPLACENE_VOLNO:{ dot: 'bg-slate-400',  cell: 'bg-slate-200 text-slate-600',   label: 'Neplacené volno' },
  SICK:           { dot: 'bg-red-400',    cell: 'bg-red-100 text-red-700',       label: 'Nemoc' },
  LEKAR:          { dot: 'bg-amber-400',  cell: 'bg-amber-100 text-amber-700',   label: 'Lékař' },
  HOMEOFFICE:     { dot: 'bg-violet',     cell: 'bg-violet/15 text-violet',      label: 'Homeoffice' },
}
const LEGEND_ORDER = ['ANNUAL', 'PLACENE_VOLNO', 'NEPLACENE_VOLNO', 'SICK', 'LEKAR', 'HOMEOFFICE']

const CZ_MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const CZ_DAYS_SHORT = ['Po','Út','St','Čt','Pá','So','Ne']

// All demo people (combine employees + admin for display)
const ALL_PEOPLE = [
  { id: 'p1',  name: 'Jan Novák',           department: 'Vývoj' },
  { id: 'p2',  name: 'Ondřej Pospíšil',     department: 'Vývoj' },
  { id: 'p3',  name: 'Karolína Horáčková',  department: 'Vývoj' },
  { id: 'p4',  name: 'Marek Blažek',        department: 'Vývoj' },
  { id: 'p5',  name: 'Simona Veselá',       department: 'Vývoj' },
  { id: 'p6',  name: 'Marie Svobodová',     department: 'Marketing' },
  { id: 'p7',  name: 'Radek Šimánek',      department: 'Marketing' },
  { id: 'p8',  name: 'Veronika Procházková',department: 'Marketing' },
  { id: 'p9',  name: 'Tomáš Dvořák',       department: 'Obchod' },
  { id: 'p10', name: 'Lenka Marková',       department: 'Obchod' },
  { id: 'p11', name: 'Pavel Černý',         department: 'Obchod' },
  { id: 'p12', name: 'Lucie Kratochvílová', department: 'Finance' },
  { id: 'p13', name: 'Petra Nováková',      department: 'HR' },
]

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function dayOfWeek(y: number, m: number, d: number) { return (new Date(y, m, d).getDay() + 6) % 7 } // Mon=0

function leaveOnDay(leave: Leave, year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day)
  const s = new Date(leave.startDate); s.setHours(0, 0, 0, 0)
  const e = new Date(leave.endDate);   e.setHours(23, 59, 59, 999)
  return d >= s && d <= e
}

export function LeaveCalendar({ leaves }: { leaves: Leave[] }) {
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today.getDate() : null

  const getLeavesForPerson = (name: string) => leaves.filter(l => l.userName === name)

  const leaveForDay = useMemo(() => {
    return (name: string, day: number) => {
      const personLeaves = getLeavesForPerson(name)
      return personLeaves.find(l => leaveOnDay(l, viewYear, viewMonth, day))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaves, viewYear, viewMonth])

  return (
    <div className="max-w-full space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-headline font-semibold text-navy">Absence</h1>
        <p className="text-sm text-slate-400 mt-1">Kdo je kdy pryč. Žádost schvaluje tvůj nadřízený.</p>
      </div>

      {/* Month row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-medium text-slate-500">Přehled za {CZ_MONTHS[viewMonth]} {viewYear}</h2>
        <div className="flex gap-1.5">
          <button onClick={prevMonth} className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:text-navy hover:border-slate-300 transition-colors">
            ‹ měsíc
          </button>
          <button onClick={nextMonth} className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:text-navy hover:border-slate-300 transition-colors">
            měsíc ›
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white text-left px-4 py-2 text-xs font-medium text-slate-400 min-w-[180px]" />
                {days.map(day => {
                  const dow = dayOfWeek(viewYear, viewMonth, day)
                  const weekend = dow === 5 || dow === 6
                  return (
                    <th key={day} className="px-0.5 py-1 text-center" style={{ width: 34, minWidth: 34 }}>
                      <div className={`text-[9px] font-medium mb-0.5 ${weekend ? 'text-slate-300' : 'text-slate-400'}`}>
                        {CZ_DAYS_SHORT[dow]}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {ALL_PEOPLE.map(person => (
                <tr key={person.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="sticky left-0 bg-white px-4 py-1.5 text-sm text-navy whitespace-nowrap">
                    {person.name}
                  </td>
                  {days.map(day => {
                    const leave = leaveForDay(person.name, day)
                    const isToday = todayDay === day
                    const colors = leave ? (TYPE_COLORS[leave.type] ?? TYPE_COLORS.ANNUAL) : null
                    const pending = leave?.status === 'PENDING'
                    return (
                      <td key={day} className="text-center py-1">
                        <span
                          title={leave ? `${colors!.label}${pending ? ' · čeká na schválení' : ''}` : undefined}
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium ${
                            colors
                              ? `${colors.cell} ${pending ? 'opacity-50 border border-dashed border-current' : ''}`
                              : 'text-slate-300'
                          } ${isToday ? 'ring-2 ring-violet ring-offset-1' : ''}`}
                        >
                          {day}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {LEGEND_ORDER.map(key => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[key].dot} inline-block`} />
            {TYPE_COLORS[key].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-slate-300 inline-block" />
          Čeká na schválení
        </span>
      </div>
    </div>
  )
}
