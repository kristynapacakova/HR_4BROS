'use client'

import { useState, useMemo } from 'react'
import { Plus, ChevronDown, Plane, Home, Stethoscope, Thermometer, Wallet, Ban, Trash2 } from 'lucide-react'

interface Leave {
  id: string
  userName: string
  department: string
  type: string
  startDate: string
  endDate: string
  status: string
}

const TYPE_COLORS: Record<string, { dot: string; cell: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  ANNUAL:         { dot: 'bg-green-400',  cell: 'bg-green-100 text-green-700',   label: 'Dovolená',        icon: Plane },
  PLACENE_VOLNO:  { dot: 'bg-blue-400',   cell: 'bg-blue-100 text-blue-700',     label: 'Placené volno',   icon: Wallet },
  PERSONAL:       { dot: 'bg-blue-400',   cell: 'bg-blue-100 text-blue-700',     label: 'Placené volno',   icon: Wallet },
  NEPLACENE_VOLNO:{ dot: 'bg-slate-400',  cell: 'bg-slate-200 text-slate-600',   label: 'Neplacené volno', icon: Ban },
  SICK:           { dot: 'bg-red-400',    cell: 'bg-red-100 text-red-700',       label: 'Nemoc',           icon: Thermometer },
  LEKAR:          { dot: 'bg-amber-400',  cell: 'bg-amber-100 text-amber-700',   label: 'Lékař',           icon: Stethoscope },
  HOMEOFFICE:     { dot: 'bg-violet',     cell: 'bg-violet/15 text-violet',      label: 'Homeoffice',      icon: Home },
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

// Gaussovský algoritmus pro velikonoční neděli — použito k výpočtu Velkého pátku a pondělí
function getCzechHolidays(year: number): Set<string> {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  const easter = new Date(year, month - 1, day)
  const goodFriday = new Date(easter); goodFriday.setDate(easter.getDate() - 2)
  const easterMonday = new Date(easter); easterMonday.setDate(easter.getDate() + 1)

  const fixed = [
    new Date(year, 0, 1), new Date(year, 4, 1), new Date(year, 4, 8),
    new Date(year, 6, 5), new Date(year, 6, 6), new Date(year, 8, 28),
    new Date(year, 9, 28), new Date(year, 10, 17),
    new Date(year, 11, 24), new Date(year, 11, 25), new Date(year, 11, 26),
    goodFriday, easterMonday,
  ]
  return new Set(fixed.map(d => `${d.getMonth()}-${d.getDate()}`))
}

interface NewLeaveForm {
  person: string
  type: string
  start: string
  end: string
}

export function LeaveCalendar({ leaves: initialLeaves, canEdit = true }: { leaves: Leave[]; canEdit?: boolean }) {
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [leaves, setLeaves] = useState<Leave[]>(initialLeaves)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<NewLeaveForm>({ person: ALL_PEOPLE[0].name, type: 'ANNUAL', start: '', end: '' })

  // "Moje absence" — demo bere aktuálně přihlášeného admina jako Petra Nováková
  const ME = 'Petra Nováková'
  const myLeaves = leaves.filter(l => l.userName === ME)
  const myLeavesThisYear = myLeaves.filter(l => new Date(l.startDate).getFullYear() === viewYear)
  const myDaysUsed = myLeavesThisYear
    .filter(l => l.type === 'ANNUAL' && l.status !== 'REJECTED')
    .reduce((sum, l) => {
      const s = new Date(l.startDate), e = new Date(l.endDate)
      return sum + Math.round((e.getTime() - s.getTime()) / 86400000) + 1
    }, 0)

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today.getDate() : null

  // Státní svátky se počítají vzorcem pro libovolný rok — není potřeba je ručně generovat.
  const holidaySet = useMemo(() => getCzechHolidays(viewYear), [viewYear])
  const isHoliday = (day: number) => holidaySet.has(`${viewMonth}-${day}`)

  const leaveForDay = useMemo(() => {
    return (name: string, day: number) => leaves.filter(l => l.userName === name).find(l => leaveOnDay(l, viewYear, viewMonth, day))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaves, viewYear, viewMonth])

  const deleteLeave = (leave: Leave) => {
    if (!confirm(`Smazat ${TYPE_COLORS[leave.type]?.label ?? leave.type} — ${leave.userName}?`)) return
    setLeaves(prev => prev.filter(l => l.id !== leave.id))
  }

  const addLeave = () => {
    if (!form.start || !form.end) return
    setLeaves(prev => [...prev, {
      id: `new-${Date.now()}`,
      userName: form.person,
      department: ALL_PEOPLE.find(p => p.name === form.person)?.department ?? '',
      type: form.type,
      startDate: form.start,
      endDate: form.end,
      status: 'PENDING',
    }])
    setForm({ person: ALL_PEOPLE[0].name, type: 'ANNUAL', start: '', end: '' })
    setAddOpen(false)
  }

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
      {canEdit && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400 -mb-2">
          <Trash2 className="w-3.5 h-3.5" /> Klikni na absenci v tabulce a smaž ji, když se nakonec nečerpala.
        </p>
      )}
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
                    const holiday = isHoliday(day)
                    const colors = leave ? (TYPE_COLORS[leave.type] ?? TYPE_COLORS.ANNUAL) : null
                    const pending = leave?.status === 'PENDING'
                    return (
                      <td key={day} className="text-center py-1">
                        <span
                          role={leave && canEdit ? 'button' : undefined}
                          onClick={leave && canEdit ? () => deleteLeave(leave) : undefined}
                          title={
                            leave
                              ? `${colors!.label}${pending ? ' · čeká na schválení' : ''}${canEdit ? ' · klikni pro smazání' : ''}`
                              : holiday ? 'Státní svátek' : undefined
                          }
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-medium transition-colors ${
                            colors
                              ? `${colors.cell} ${pending ? 'opacity-50 border border-dashed border-current' : ''} ${canEdit ? 'cursor-pointer hover:ring-2 hover:ring-red-300' : ''}`
                              : holiday
                                ? 'bg-slate-100 text-slate-400 font-semibold'
                                : 'text-slate-500 bg-slate-50'
                          } ${isToday ? 'border-2 border-violet' : ''}`}
                        >
                          {colors ? <colors.icon className="w-3.5 h-3.5" /> : day}
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
        {LEGEND_ORDER.map(key => {
          const Icon = TYPE_COLORS[key].icon
          return (
            <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center ${TYPE_COLORS[key].cell}`}>
                <Icon className="w-3 h-3" />
              </span>
              {TYPE_COLORS[key].label}
            </span>
          )
        })}
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-slate-300 inline-block" />
          Čeká na schválení
        </span>
      </div>


      {/* Nová absence */}
      {canEdit && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setAddOpen(o => !o)}
            className="w-full flex items-center gap-2 px-5 py-4 text-left text-sm font-medium text-navy hover:bg-slate-50 transition-colors"
          >
            <Plus className={`w-4 h-4 text-violet transition-transform ${addOpen ? 'rotate-45' : ''}`} />
            Nová absence
            <ChevronDown className={`w-4 h-4 text-slate-300 ml-auto transition-transform ${addOpen ? 'rotate-180' : ''}`} />
          </button>
          {addOpen && (
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={form.person}
                onChange={e => setForm(f => ({ ...f, person: e.target.value }))}
                className="input"
              >
                {ALL_PEOPLE.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="input"
              >
                {LEGEND_ORDER.map(key => <option key={key} value={key}>{TYPE_COLORS[key].label}</option>)}
              </select>
              <input type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} className="input" />
              <input type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} className="input" />
              <button
                onClick={addLeave}
                disabled={!form.start || !form.end}
                className="sm:col-span-4 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-violet hover:bg-violet-dark transition-colors disabled:opacity-40 w-fit"
              >
                Přidat absenci
              </button>
            </div>
          )}
        </div>
      )}

      {/* Moje absence */}
      {canEdit && (
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h3 className="text-sm font-semibold text-navy">Moje absence</h3>
            <p className="text-xs text-slate-400">Dovolená čerpaná v roce {viewYear}: {myDaysUsed} {myDaysUsed === 1 ? 'den' : myDaysUsed < 5 ? 'dny' : 'dnů'}</p>
          </div>
          {myLeavesThisYear.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-10 text-center">
              <p className="text-sm text-slate-400">Zatím nemáš žádnou absenci.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {myLeavesThisYear.map(l => {
                const colors = TYPE_COLORS[l.type] ?? TYPE_COLORS.ANNUAL
                return (
                  <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0`} />
                    <span className="text-sm text-navy flex-1">{colors.label}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(l.startDate).toLocaleDateString('cs-CZ')} – {new Date(l.endDate).toLocaleDateString('cs-CZ')}
                    </span>
                    {l.status === 'PENDING' && <span className="badge-pending">Čeká</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
