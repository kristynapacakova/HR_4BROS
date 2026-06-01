'use client'

import { useState } from 'react'
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

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ANNUAL:   { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400' },
  SICK:     { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400' },
  PERSONAL: { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-400' },
  UNPAID:   { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400' },
}

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Dovolená', SICK: 'Nemoc', PERSONAL: 'Osobní volno', UNPAID: 'Neplacené volno',
}

const CZ_MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const CZ_DAYS = ['Po','Út','St','Čt','Pá','So','Ne']

function isoToDate(iso: string) { return new Date(iso) }

function datesOverlap(leaveStart: Date, leaveEnd: Date, day: Date) {
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const s = new Date(leaveStart.getFullYear(), leaveStart.getMonth(), leaveStart.getDate())
  const e = new Date(leaveEnd.getFullYear(), leaveEnd.getMonth(), leaveEnd.getDate())
  return d >= s && d <= e
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  // Monday-based: Mon=0 … Sun=6
  const d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

export function LeaveCalendar({ leaves }: { leaves: Leave[] }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDay(null) }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // leaves active in this month
  const monthLeaves = leaves.filter((l) => {
    const s = isoToDate(l.startDate)
    const e = isoToDate(l.endDate)
    const monthStart = new Date(viewYear, viewMonth, 1)
    const monthEnd = new Date(viewYear, viewMonth, daysInMonth)
    return s <= monthEnd && e >= monthStart
  })

  // leaves for selected day
  const selectedLeaves = selectedDay
    ? leaves.filter((l) => datesOverlap(isoToDate(l.startDate), isoToDate(l.endDate), selectedDay))
    : []

  // people on leave each day of this month (for count badges)
  const dayLeaveCounts: number[] = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(viewYear, viewMonth, i + 1)
    return leaves.filter((l) => datesOverlap(isoToDate(l.startDate), isoToDate(l.endDate), d)).length
  })

  // unique people on leave this month
  const uniquePeople = Array.from(new Set(monthLeaves.map((l) => l.userName)))

  const calendarCells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  // pad to complete last row
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header controls */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-navy">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-headline font-semibold text-navy text-xl min-w-[180px] text-center">
              {CZ_MONTHS[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-navy">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={goToday} className="text-xs font-medium text-violet hover:text-violet-dark border border-violet/30 px-3 py-1.5 rounded-lg transition-colors">
              Dnes
            </button>
            <div className="text-xs text-slate-400">{uniquePeople.length} lidí na dovolené tento měsíc</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {CZ_DAYS.map((d) => (
              <div key={d} className={`py-2.5 text-center text-xs font-medium ${d === 'So' || d === 'Ne' ? 'text-slate-300' : 'text-slate-500'}`}>
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="border-b border-r border-slate-50 h-16 bg-slate-50/30" />
              const dayDate = new Date(viewYear, viewMonth, day)
              const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
              const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === viewMonth && selectedDay?.getFullYear() === viewYear
              const dayOfWeek = (dayDate.getDay() + 6) % 7
              const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
              const count = dayLeaveCounts[day - 1]

              // get leave entries for this day (up to 2 visible)
              const dayLeaves = leaves.filter((l) => datesOverlap(isoToDate(l.startDate), isoToDate(l.endDate), dayDate))

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : dayDate)}
                  className={`border-b border-r border-slate-50 h-16 p-1.5 cursor-pointer transition-colors relative
                    ${isWeekend ? 'bg-slate-50/50' : 'bg-white'}
                    ${isSelected ? 'bg-violet/5 border-violet/20' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${
                    isToday ? 'bg-violet text-white' : isWeekend ? 'text-slate-300' : 'text-navy'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayLeaves.slice(0, 2).map((l) => {
                      const colors = TYPE_COLORS[l.type] || TYPE_COLORS.ANNUAL
                      return (
                        <div key={l.id} className={`${colors.bg} ${colors.text} text-[9px] font-medium px-1 py-0.5 rounded truncate leading-tight`}>
                          {l.userName.split(' ')[0]}
                        </div>
                      )
                    })}
                    {dayLeaves.length > 2 && (
                      <div className="text-[9px] text-slate-400 px-1">+{dayLeaves.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Legenda</h4>
            <div className="space-y-2">
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${TYPE_COLORS[key]?.dot || 'bg-slate-400'}`} />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                {selectedDay.getDate()}. {CZ_MONTHS[selectedDay.getMonth()]} {selectedDay.getFullYear()}
              </h4>
              {selectedLeaves.length === 0 ? (
                <p className="text-xs text-slate-400">Nikdo nemá dovolenou.</p>
              ) : (
                <div className="space-y-2">
                  {selectedLeaves.map((l) => {
                    const colors = TYPE_COLORS[l.type] || TYPE_COLORS.ANNUAL
                    return (
                      <div key={l.id} className={`${colors.bg} rounded-lg p-3`}>
                        <p className={`text-xs font-semibold ${colors.text}`}>{l.userName}</p>
                        <p className={`text-xs ${colors.text} opacity-80`}>{l.department} · {TYPE_LABELS[l.type]}</p>
                        <p className={`text-xs ${colors.text} opacity-60 mt-0.5`}>
                          {isoToDate(l.startDate).getDate()}. – {isoToDate(l.endDate).getDate()}. {CZ_MONTHS[isoToDate(l.endDate).getMonth()]}
                          {l.status === 'PENDING' && ' · čeká na schválení'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* This month summary */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Tento měsíc</h4>
            {monthLeaves.length === 0 ? (
              <p className="text-xs text-slate-400">Žádné dovolené.</p>
            ) : (
              <div className="space-y-2.5">
                {monthLeaves.map((l) => {
                  const colors = TYPE_COLORS[l.type] || TYPE_COLORS.ANNUAL
                  const s = isoToDate(l.startDate)
                  const e = isoToDate(l.endDate)
                  return (
                    <div key={l.id} className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${colors.dot}`} />
                      <div>
                        <p className="text-xs font-medium text-navy">{l.userName}</p>
                        <p className="text-xs text-slate-400">
                          {s.getDate()}. – {e.getDate()}. {CZ_MONTHS[e.getMonth()]}
                          {l.status === 'PENDING' && <span className="ml-1 text-amber-500">· čeká</span>}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
