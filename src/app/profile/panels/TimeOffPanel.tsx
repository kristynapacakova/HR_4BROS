import { formatDate, getDaysBetween } from '@/lib/utils'
import { CalendarDays, Plus, Home } from 'lucide-react'
import { LeaveRequestForm } from '@/app/time-off/LeaveRequestForm'
import { DEMO_LEAVE_BALANCE, DEMO_LEAVE_REQUESTS } from '@/lib/mock-data'
import { SickNoteUpload } from './SickNoteUpload'

const LEAVE_LABEL: Record<string, string> = {
  DOVOLENA: 'Dovolená', HOMEOFFICE: 'Homeoffice', NEMOC: 'Nemoc',
  POHREB: 'Pohřeb', NEPLACENE_VOLNO: 'Neplacené volno', PLACENE_VOLNO: 'Placené volno',
  ANNUAL: 'Dovolená', SICK: 'Nemoc', PERSONAL: 'Osobní volno', UNPAID: 'Neplacené volno',
}

function getCzechHolidays(year: number) {
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
  const gf = new Date(easter); gf.setDate(easter.getDate() - 2)
  const em = new Date(easter); em.setDate(easter.getDate() + 1)

  return [
    { date: new Date(year, 0, 1),   name: 'Nový rok' },
    { date: gf,                      name: 'Velký pátek' },
    { date: em,                      name: 'Velikonoční pondělí' },
    { date: new Date(year, 4, 1),   name: 'Svátek práce' },
    { date: new Date(year, 4, 8),   name: 'Den vítězství' },
    { date: new Date(year, 6, 5),   name: 'Cyril a Metoděj' },
    { date: new Date(year, 6, 6),   name: 'Den Jana Husa' },
    { date: new Date(year, 8, 28),  name: 'Den české státnosti' },
    { date: new Date(year, 9, 28),  name: 'Den vzniku ČSR' },
    { date: new Date(year, 10, 17), name: 'Den svobody a demokracie' },
    { date: new Date(year, 11, 24), name: 'Štědrý den' },
    { date: new Date(year, 11, 25), name: '1. vánoční svátek' },
    { date: new Date(year, 11, 26), name: '2. vánoční svátek' },
  ].sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function TimeOffPanel({ isEmployee = false, monthlySalary = null }: { isEmployee?: boolean; monthlySalary?: number | null }) {
  const leaveBalance = DEMO_LEAVE_BALANCE
  const leaveRequests = DEMO_LEAVE_REQUESTS

  const annualRemaining = leaveBalance.annualTotal - leaveBalance.annualUsed

  const today = new Date()
  const currentYear = today.getFullYear()
  const thisYearHolidays = getCzechHolidays(currentYear)

  const homeofficeUsed = leaveRequests
    .filter(r => r.type === 'HOMEOFFICE' && r.status !== 'REJECTED' && new Date(r.startDate).getFullYear() === currentYear)
    .reduce((sum, r) => sum + getDaysBetween(r.startDate, r.endDate), 0)

  return (
    <div className="space-y-6">

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BalanceCard title="Dovolená" used={leaveBalance.annualUsed} total={leaveBalance.annualTotal} remaining={annualRemaining} color="violet" />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-500 mb-1">Nemoc</p>
          <p className="text-2xl font-headline font-bold text-navy">{leaveBalance.sickUsed} dní</p>
          <p className="text-xs text-slate-400 mt-1">čerpáno letos</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-1">
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-medium text-slate-500">Homeoffice</p>
          </div>
          <p className="text-2xl font-headline font-bold text-navy">{homeofficeUsed} dní</p>
          <p className="text-xs text-slate-400 mt-1">čerpáno letos</p>
        </div>
      </div>

      {/* New request — holidays auto-calculated inside form; sick-pay estimate appears inline when „Nemoc" is selected */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-headline font-semibold text-navy mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-violet" />
          Nová žádost
        </h3>
        <LeaveRequestForm monthlySalary={isEmployee ? monthlySalary : null} />
      </div>

      {/* Holidays this year */}
      <HolidayTable year={currentYear} holidays={thisYearHolidays} today={today} />

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-headline font-semibold text-navy">Historie žádostí</h3>
        </div>
        {leaveRequests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Zatím jste nepodali žádnou žádost</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {leaveRequests.map((req) => (
              <div key={req.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-navy">{LEAVE_LABEL[req.type] ?? req.type}</p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    {' · '}{getDaysBetween(req.startDate, req.endDate)} dní
                  </p>
                  {req.reason && <p className="text-xs text-slate-400 mt-0.5 italic">"{req.reason}"</p>}
                  {req.note && <p className="text-xs text-amber-600 mt-0.5">Poznámka HR: {req.note}</p>}
                  {(req.type === 'NEMOC' || req.type === 'SICK') && <SickNoteUpload requestId={req.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

const MONTH_NAMES_CZ = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const DOW_LABELS = ['Po','Út','St','Čt','Pá','So','Ne']

function HolidayTable({ year, holidays, today }: {
  year: number
  holidays: { date: Date; name: string }[]
  today: Date
}) {
  const byMonth = new Map<number, { date: Date; name: string }[]>()
  for (const h of holidays) {
    const arr = byMonth.get(h.date.getMonth()) ?? []
    arr.push(h)
    byMonth.set(h.date.getMonth(), arr)
  }
  const months = Array.from(byMonth.keys()).sort((a, b) => a - b)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-headline font-semibold text-navy">Státní svátky {year}</h3>
        <span className="text-xs text-slate-400">{holidays.length} svátků</span>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {months.map(m => (
          <MonthMini key={m} year={year} month={m} holidays={byMonth.get(m)!} today={today} />
        ))}
      </div>
    </div>
  )
}

function MonthMini({ year, month, holidays, today }: {
  year: number; month: number; holidays: { date: Date; name: string }[]; today: Date
}) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Po=0 ... Ne=6
  const leadingBlanks = (first.getDay() + 6) % 7
  const holidayMap = new Map(holidays.map(h => [h.date.getDate(), h]))
  const cells = Array.from({ length: leadingBlanks }, () => null as null | number)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  return (
    <div className="rounded-2xl bg-[#F7F8FE] p-4">
      <p className="text-sm font-semibold text-navy mb-3">{MONTH_NAMES_CZ[month]}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DOW_LABELS.map(d => (
          <span key={d} className="text-[9px] font-medium text-slate-400 uppercase">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`b${i}`} />
          const date = new Date(year, month, day)
          const holiday = holidayMap.get(day)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          const isToday = date.toDateString() === today.toDateString()
          const isPast = date < today && !isToday
          const isFriOrMon = holiday && (date.getDay() === 5 || date.getDay() === 1)
          return (
            <div key={day} className="relative flex items-center justify-center py-1" title={holiday?.name}>
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-medium ${
                  isToday ? 'bg-violet text-white' :
                  holiday ? 'bg-white text-violet font-bold shadow-sm' :
                  isWeekend ? 'text-slate-300' :
                  isPast ? 'text-slate-300' : 'text-navy'
                }`}
              >
                {day}
              </span>
              {isFriOrMon && !isToday && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-green-400" />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-white space-y-1">
        {holidays.map(h => {
          const isFriOrMon = h.date.getDay() === 5 || h.date.getDay() === 1
          return (
            <div key={h.date.toISOString()} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 truncate">{h.date.getDate()}. {h.name}</span>
              {isFriOrMon && (
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium flex-shrink-0">
                  <span className="w-1 h-1 rounded-full bg-green-400" />
                  Prodloužený víkend
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BalanceCard({ title, used, total, remaining, color }: {
  title: string; used: number; total: number; remaining: number; color: 'violet' | 'blue'
}) {
  const pct = total > 0 ? (used / total) * 100 : 0
  const barColor = color === 'violet' ? 'bg-violet' : 'bg-blue-500'
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-headline font-bold text-navy">{remaining}</p>
      <p className="text-xs text-slate-400 mb-3">zbývajících dní z {total}</p>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">Čerpáno {used} dní</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') return <span className="badge-approved">Schváleno</span>
  if (status === 'REJECTED') return <span className="badge-rejected">Zamítnuto</span>
  return <span className="badge-pending">Čeká na schválení</span>
}
