import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate, getDaysBetween } from '@/lib/utils'
import { CalendarDays, Plus } from 'lucide-react'
import { LeaveRequestForm } from './LeaveRequestForm'
import { DEMO_LEAVE_BALANCE, DEMO_LEAVE_REQUESTS, DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'

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

export default async function TimeOffPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER
  const leaveBalance = DEMO_LEAVE_BALANCE
  const leaveRequests = DEMO_LEAVE_REQUESTS

  const annualRemaining = leaveBalance.annualTotal - leaveBalance.annualUsed
  const sickRemaining = leaveBalance.sickTotal - leaveBalance.sickUsed

  const today = new Date()
  const currentYear = today.getFullYear()
  const thisYearHolidays = getCzechHolidays(currentYear)
  return (
    <AppShell
      title="Moje docházka"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BalanceCard title="Řádná dovolená" used={leaveBalance.annualUsed} total={leaveBalance.annualTotal} remaining={annualRemaining} color="violet" />
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
            <p className="text-xs font-medium text-slate-500 mb-1">Nemoc / absence</p>
            <p className="text-2xl font-headline font-bold text-navy">{leaveBalance.sickUsed} dní</p>
            <p className="text-xs text-slate-400 mt-1">čerpáno letos</p>
          </div>
        </div>

        {/* New request — holidays auto-calculated inside form */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline font-semibold text-navy mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet" />
            Nová žádost
          </h3>
          <LeaveRequestForm monthlySalary={['HPP', 'DPP', 'DPC'].includes(user.employmentType ?? '') ? ((user as typeof DEMO_USER).monthlySalary ?? null) : null} />
        </div>

        {/* Holidays this year */}
        <HolidayTable year={currentYear} holidays={thisYearHolidays} today={today} />

        {/* History */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  )
}

function HolidayTable({ year, holidays, today }: {
  year: number
  holidays: { date: Date; name: string }[]
  today: Date
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-headline font-semibold text-navy">Státní svátky {year}</h3>
        <span className="text-xs text-slate-400">{holidays.length} svátků</span>
      </div>
      <div className="divide-y divide-slate-50">
        {holidays.map((h) => {
          const isPast = h.date < today
          const isToday = h.date.toDateString() === today.toDateString()
          const dow = h.date.toLocaleDateString('cs-CZ', { weekday: 'long' })
          const isFriOrMon = h.date.getDay() === 5 || h.date.getDay() === 1
          return (
            <div key={h.date.toISOString()} className={`px-6 py-3 flex items-center gap-4 ${isToday ? 'bg-violet/5' : isPast ? 'opacity-40' : ''}`}>
              <div className={`w-14 text-center flex-shrink-0 rounded-lg py-1 ${isToday ? 'bg-violet text-white' : 'bg-slate-50 text-navy'}`}>
                <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">{h.date.toLocaleDateString('cs-CZ', { month: 'short' })}</p>
                <p className="text-xl font-headline font-bold leading-tight">{h.date.getDate()}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy">{h.name}</p>
                <p className="text-xs text-slate-400 capitalize">{dow}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isToday && <span className="text-xs bg-violet text-white px-2 py-0.5 rounded font-medium">Dnes</span>}
                {isFriOrMon && !isPast && !isToday && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">Prodloužený víkend</span>
                )}
              </div>
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
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
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
