'use client'

import { useState, useMemo } from 'react'
import { CalendarX, Info } from 'lucide-react'

function getCzechHolidays(year: number): Date[] {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  const easter = new Date(year, month - 1, day)
  const goodFriday = new Date(easter); goodFriday.setDate(easter.getDate() - 2)
  const easterMon = new Date(easter); easterMon.setDate(easter.getDate() + 1)

  return [
    new Date(year, 0, 1),
    goodFriday,
    easterMon,
    new Date(year, 4, 1),
    new Date(year, 4, 8),
    new Date(year, 6, 5),
    new Date(year, 6, 6),
    new Date(year, 8, 28),
    new Date(year, 9, 28),
    new Date(year, 10, 17),
    new Date(year, 11, 24),
    new Date(year, 11, 25),
    new Date(year, 11, 26),
  ]
}

const HOLIDAY_NAMES: Record<string, string> = {
  '01-01': 'Nový rok',
  '05-01': 'Svátek práce',
  '05-08': 'Den vítězství',
  '07-05': 'Cyril a Metoděj',
  '07-06': 'Jan Hus',
  '09-28': 'Den české státnosti',
  '10-28': 'Vznik ČSR',
  '11-17': 'Den svobody a demokracie',
  '12-24': 'Štědrý den',
  '12-25': '1. vánoční svátek',
  '12-26': '2. vánoční svátek',
}

function getHolidayName(date: Date, year: number): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const key = `${mm}-${dd}`
  if (HOLIDAY_NAMES[key]) return HOLIDAY_NAMES[key]
  // Easter-based — derive from year
  const holidays = getCzechHolidays(year)
  const gf = holidays[1] // good friday
  const em = holidays[2] // easter monday
  if (date.toDateString() === gf.toDateString()) return 'Velký pátek'
  if (date.toDateString() === em.toDateString()) return 'Velikonoční pondělí'
  return 'Státní svátek'
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function calcWorkdays(start: Date, end: Date): { workdays: number; holidays: Date[] } {
  const yearsSet = new Set<number>()
  const cur = new Date(start)
  while (cur <= end) { yearsSet.add(cur.getFullYear()); cur.setDate(cur.getDate() + 1) }
  const years = Array.from(yearsSet)
  const holidaySet = new Set<string>()
  const holidayDates: Date[] = []
  for (const y of years) {
    for (const h of getCzechHolidays(y)) {
      const key = toKey(h)
      if (!holidaySet.has(key)) { holidaySet.add(key); holidayDates.push(h) }
    }
  }

  let workdays = 0
  const hitHolidays: Date[] = []
  const d = new Date(start)
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      if (holidaySet.has(toKey(d))) {
        hitHolidays.push(new Date(d))
      } else {
        workdays++
      }
    }
    d.setDate(d.getDate() + 1)
  }
  return { workdays, holidays: hitHolidays }
}

export function LeaveRequestForm() {
  const [form, setForm] = useState({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const calc = useMemo(() => {
    if (!form.startDate || !form.endDate) return null
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (end < start) return null
    return calcWorkdays(start, end)
  }, [form.startDate, form.endDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setSuccess(true)
    setForm({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' })
    setTimeout(() => setSuccess(false), 3000)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-700 font-medium">Žádost byla odeslána!</p>
        <p className="text-sm text-amber-600 mt-1">Demo verze — změny se neukládají.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Typ dovolené</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          >
            <option value="ANNUAL">Řádná dovolená</option>
            <option value="SICK">Nemocenská</option>
            <option value="PERSONAL">Osobní volno</option>
            <option value="UNPAID">Neplacené volno</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Důvod (nepovinné)</label>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            placeholder="Např. letní dovolená"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Od</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Do</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            required
            min={form.startDate}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
      </div>

      {/* Live calculation */}
      {calc && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Pracovní dny k čerpání dovolené</span>
            <span className="text-lg font-headline font-bold text-navy">{calc.workdays} dní</span>
          </div>
          {calc.holidays.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-violet font-medium">
                <CalendarX className="w-3.5 h-3.5" />
                Státní svátky v období (neodečítají se z dovolené)
              </div>
              {calc.holidays.map((h) => (
                <div key={h.toISOString()} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet/40 flex-shrink-0" />
                  <span className="font-medium text-navy">{h.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}</span>
                  <span>— {getHolidayName(h, h.getFullYear())}</span>
                </div>
              ))}
            </div>
          )}
          {calc.holidays.length === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 border-t border-slate-200">
              <Info className="w-3.5 h-3.5" />
              V tomto období nejsou žádné státní svátky
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-violet hover:bg-violet-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
      >
        {loading ? 'Odesílám...' : 'Odeslat žádost'}
      </button>
    </form>
  )
}
