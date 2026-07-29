'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Leave {
  id: string
  userName: string
  department: string
  type: string
  startDate: string
  endDate: string
  status: string
}

const TYPE_COLORS: Record<string, { bar: string; label: string }> = {
  ANNUAL:   { bar: 'bg-blue-400',   label: 'Dovolená' },
  SICK:     { bar: 'bg-red-400',    label: 'Nemoc' },
  PERSONAL: { bar: 'bg-amber-400',  label: 'Osobní volno' },
  UNPAID:   { bar: 'bg-slate-400',  label: 'Neplacené' },
}

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
function isWeekend(y: number, m: number, d: number) { const dow = dayOfWeek(y, m, d); return dow === 5 || dow === 6 }

function leaveSpansDay(leave: Leave, year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day)
  const s = new Date(leave.startDate); s.setHours(0,0,0,0)
  const e = new Date(leave.endDate);   e.setHours(23,59,59,999)
  return d >= s && d <= e
}

export function LeaveCalendar({ leaves }: { leaves: Leave[] }) {
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [filterDept, setFilterDept] = useState('Všechna oddělení')
  const [hoveredLeave, setHoveredLeave] = useState<Leave | null>(null)

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }
  const goToday   = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()) }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const departments = ['Všechna oddělení', ...Array.from(new Set(ALL_PEOPLE.map(p => p.department)))]
  const people = filterDept === 'Všechna oddělení' ? ALL_PEOPLE : ALL_PEOPLE.filter(p => p.department === filterDept)

  // group by department for display
  const grouped = useMemo(() => {
    const map: Record<string, typeof ALL_PEOPLE> = {}
    people.forEach(p => { if (!map[p.department]) map[p.department] = []; map[p.department].push(p) })
    return map
  }, [people])

  const getLeavesForPerson = (name: string) =>
    leaves.filter(l => l.userName === name)

  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today.getDate() : null

  // stats for this month
  const monthLeaves = leaves.filter(l => {
    const s = new Date(l.startDate), e = new Date(l.endDate)
    return s <= new Date(viewYear, viewMonth, daysInMonth) && e >= new Date(viewYear, viewMonth, 1)
  })
  const approvedCount = monthLeaves.filter(l => l.status === 'APPROVED').length
  const pendingCount  = monthLeaves.filter(l => l.status === 'PENDING').length

  const ROW_H = 36   // px height of each person row
  const NAME_W = 160 // px width of name column

  return (
    <div className="max-w-full space-y-4">

      {/* Top bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-navy" />
          </button>
          <h2 className="font-headline text-navy text-lg min-w-[170px] text-center">
            {CZ_MONTHS[viewMonth]} {viewYear}
          </h2>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-navy" />
          </button>
          <button onClick={goToday} className="text-xs font-medium text-violet border border-violet/30 px-3 py-1.5 rounded-lg hover:bg-violet/5 transition-colors">
            Dnes
          </button>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-navy focus:outline-none focus:ring-2 focus:ring-violet bg-white"
          >
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />{approvedCount} schváleno</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />{pendingCount} čeká</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {Object.entries(TYPE_COLORS).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-3 h-3 rounded-sm ${val.bar}`} />{val.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-sm border-2 border-dashed border-amber-400 inline-block" />čeká na schválení
        </span>
      </div>

      {/* Gantt grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${NAME_W + daysInMonth * 32}px` }}>

            {/* Day headers */}
            <div className="flex border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <div style={{ width: NAME_W, minWidth: NAME_W }} className="flex-shrink-0 px-4 py-2.5 text-xs font-medium text-slate-500 border-r border-slate-100">
                Zaměstnanec
              </div>
              {days.map(day => {
                const dow = dayOfWeek(viewYear, viewMonth, day)
                const weekend = isWeekend(viewYear, viewMonth, day)
                const isToday = todayDay === day
                return (
                  <div
                    key={day}
                    style={{ width: 32, minWidth: 32 }}
                    className={`flex-shrink-0 flex flex-col items-center justify-center py-1.5 border-r border-slate-50 ${weekend ? 'bg-slate-100/60' : ''}`}
                  >
                    <span className={`text-[9px] font-medium ${weekend ? 'text-slate-300' : 'text-slate-400'}`}>
                      {CZ_DAYS_SHORT[dow]}
                    </span>
                    <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-violet text-white' : weekend ? 'text-slate-300' : 'text-navy'
                    }`}>
                      {day}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Rows grouped by department */}
            {Object.entries(grouped).map(([dept, deptPeople]) => (
              <div key={dept}>
                {/* Department separator */}
                <div className="flex bg-slate-50/80 border-b border-slate-100">
                  <div style={{ width: NAME_W, minWidth: NAME_W }} className="flex-shrink-0 px-4 py-1.5 border-r border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{dept}</span>
                  </div>
                  {days.map(day => (
                    <div key={day} style={{ width: 32, minWidth: 32 }} className={`flex-shrink-0 border-r border-slate-50 ${isWeekend(viewYear, viewMonth, day) ? 'bg-slate-100/40' : ''}`} />
                  ))}
                </div>

                {/* Person rows */}
                {deptPeople.map((person, pIdx) => {
                  const personLeaves = getLeavesForPerson(person.name)
                  const isLast = pIdx === deptPeople.length - 1
                  return (
                    <div key={person.id} className={`flex items-center ${isLast ? '' : 'border-b border-slate-50'} hover:bg-slate-50/50 transition-colors`} style={{ height: ROW_H }}>
                      {/* Name */}
                      <div style={{ width: NAME_W, minWidth: NAME_W }} className="flex-shrink-0 px-4 border-r border-slate-100 h-full flex items-center">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-semibold">{person.name[0]}</span>
                          </div>
                          <span className="text-xs text-navy truncate">{person.name}</span>
                        </div>
                      </div>

                      {/* Day cells + leave bars */}
                      <div className="flex-1 flex items-center relative h-full">
                        {days.map(day => (
                          <div
                            key={day}
                            style={{ width: 32, minWidth: 32 }}
                            className={`flex-shrink-0 h-full border-r border-slate-50 ${isWeekend(viewYear, viewMonth, day) ? 'bg-slate-100/30' : ''} ${todayDay === day ? 'bg-violet/5' : ''}`}
                          />
                        ))}

                        {/* Leave bars overlaid */}
                        {personLeaves.map(leave => {
                          const s = new Date(leave.startDate)
                          const e = new Date(leave.endDate)
                          const monthStart = new Date(viewYear, viewMonth, 1)
                          const monthEnd   = new Date(viewYear, viewMonth, daysInMonth)

                          if (s > monthEnd || e < monthStart) return null

                          const startDay = s < monthStart ? 1 : s.getDate()
                          const endDay   = e > monthEnd   ? daysInMonth : e.getDate()
                          const spanDays = endDay - startDay + 1

                          const colors = TYPE_COLORS[leave.type] || TYPE_COLORS.ANNUAL
                          const isPending = leave.status === 'PENDING'

                          return (
                            <div
                              key={leave.id}
                              onMouseEnter={() => setHoveredLeave(leave)}
                              onMouseLeave={() => setHoveredLeave(null)}
                              title={`${leave.userName} · ${colors.label}${isPending ? ' (čeká na schválení)' : ''}`}
                              style={{
                                position: 'absolute',
                                left: (startDay - 1) * 32 + 3,
                                width: spanDays * 32 - 6,
                                height: 22,
                                top: '50%',
                                transform: 'translateY(-50%)',
                              }}
                              className={`rounded ${colors.bar} ${isPending ? 'opacity-50 border-2 border-dashed border-current' : 'opacity-80'} cursor-default flex items-center px-1.5`}
                            >
                              <span className="text-[10px] text-white font-medium truncate leading-none">
                                {spanDays > 2 ? colors.label : ''}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

          </div>
        </div>

        {/* Today line indicator note */}
        {todayDay && (
          <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/50">
            <span className="text-xs text-slate-400">
              <span className="w-2 h-2 bg-violet rounded-full inline-block mr-1.5 align-middle" />
              Fialové zvýraznění = dnešní den
            </span>
          </div>
        )}
      </div>

      {/* Hover tooltip - fixed bottom right */}
      {hoveredLeave && (
        <div className="fixed bottom-6 right-6 bg-violet text-white rounded-xl shadow-xl p-4 z-50 max-w-xs">
          <p className="font-semibold text-sm">{hoveredLeave.userName}</p>
          <p className="text-xs text-navy-200 mt-0.5">{hoveredLeave.department} · {TYPE_COLORS[hoveredLeave.type]?.label}</p>
          <p className="text-xs text-navy-300 mt-2">
            {new Date(hoveredLeave.startDate).toLocaleDateString('cs-CZ')} — {new Date(hoveredLeave.endDate).toLocaleDateString('cs-CZ')}
          </p>
          {hoveredLeave.status === 'PENDING' && (
            <p className="text-xs text-amber-300 mt-1">⏳ Čeká na schválení</p>
          )}
        </div>
      )}
    </div>
  )
}
