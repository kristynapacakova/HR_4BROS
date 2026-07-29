'use client'

import { useState, useMemo, useRef } from 'react'
import { CalendarX, Info, ExternalLink, AlertCircle, Stethoscope, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { computeSickPay } from '@/app/profile/panels/SickPayCard'

function fmtCzk(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

// ── Czech holiday helpers ────────────────────────────────────────────────────

function getCzechHolidayDates(year: number): Date[] {
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
    new Date(year, 0, 1), gf, em,
    new Date(year, 4, 1), new Date(year, 4, 8),
    new Date(year, 6, 5), new Date(year, 6, 6),
    new Date(year, 8, 28), new Date(year, 9, 28), new Date(year, 10, 17),
    new Date(year, 11, 24), new Date(year, 11, 25), new Date(year, 11, 26),
  ]
}

const FIXED_NAMES: Record<string, string> = {
  '01-01': 'Nový rok', '05-01': 'Svátek práce', '05-08': 'Den vítězství',
  '07-05': 'Cyril a Metoděj', '07-06': 'Den Jana Husa', '09-28': 'Den české státnosti',
  '10-28': 'Den vzniku ČSR', '11-17': 'Den svobody a demokracie',
  '12-24': 'Štědrý den', '12-25': '1. vánoční svátek', '12-26': '2. vánoční svátek',
}

function toKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }

function getHolidayName(date: Date, year: number): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  if (FIXED_NAMES[`${mm}-${dd}`]) return FIXED_NAMES[`${mm}-${dd}`]
  const dates = getCzechHolidayDates(year)
  if (date.toDateString() === dates[1].toDateString()) return 'Velký pátek'
  if (date.toDateString() === dates[2].toDateString()) return 'Velikonoční pondělí'
  return 'Státní svátek'
}

function calcWorkdays(start: Date, end: Date) {
  const yearsArr = Array.from(new Set<number>(
    (() => { const ys: number[] = []; const c = new Date(start); while (c <= end) { ys.push(c.getFullYear()); c.setDate(c.getDate() + 1) } return ys })()
  ))
  const holidaySet = new Set<string>()
  const holidayMap = new Map<string, Date>()
  for (const y of yearsArr) {
    for (const h of getCzechHolidayDates(y)) {
      const k = toKey(h)
      if (!holidaySet.has(k)) { holidaySet.add(k); holidayMap.set(k, h) }
    }
  }
  let workdays = 0
  const hitHolidays: Date[] = []
  const d = new Date(start)
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      const k = toKey(d)
      if (holidaySet.has(k)) hitHolidays.push(new Date(d))
      else workdays++
    }
    d.setDate(d.getDate() + 1)
  }
  return { workdays, holidays: hitHolidays }
}

// ── Leave types ───────────────────────────────────────────────────────────────

const LEAVE_TYPES = [
  { value: 'DOVOLENA',       label: 'Dovolená',        deductsBalance: true },
  { value: 'HOMEOFFICE',     label: 'Homeoffice',      deductsBalance: false },
  { value: 'NEMOC',          label: 'Nemoc',           deductsBalance: false },
  { value: 'POHREB',         label: 'Pohřeb',          deductsBalance: false },
  { value: 'NEPLACENE_VOLNO',label: 'Neplacené volno', deductsBalance: false },
  { value: 'PLACENE_VOLNO',  label: 'Placené volno',   deductsBalance: false },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function LeaveRequestForm({ monthlySalary = null }: { monthlySalary?: number | null }) {
  const [form, setForm] = useState({
    type: 'DOVOLENA',
    startDate: '',
    endDate: '',
    halfDay: false,
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [attachment, setAttachment] = useState<{ name: string; size: number; kind: 'pdf' | 'image' } | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))

  const MAX_FILE_MB = 10
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const isPdf = file.type === 'application/pdf'
    const isImage = file.type === 'image/png' || file.type === 'image/jpeg'
    if (!isPdf && !isImage) {
      setAttachError('Podporované formáty: PDF, PNG, JPG')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setAttachError(`Soubor je moc velký (max ${MAX_FILE_MB} MB)`)
      return
    }
    setAttachError(null)
    setAttachment({ name: file.name, size: file.size, kind: isPdf ? 'pdf' : 'image' })
  }

  const selectedType = LEAVE_TYPES.find(t => t.value === form.type)!
  const isSick = form.type === 'NEMOC'
  const isFuneral = form.type === 'POHREB'
  const isHomeoffice = form.type === 'HOMEOFFICE'

  // For half-day, force start === end
  const effectiveEnd = form.halfDay ? form.startDate : form.endDate

  const calc = useMemo(() => {
    if (!form.startDate) return null
    if (form.halfDay) return { workdays: 0.5, holidays: [] }
    if (!form.endDate) return null
    const start = new Date(form.startDate)
    const end = new Date(effectiveEnd)
    if (end < start) return null
    return calcWorkdays(start, end)
  }, [form.startDate, form.endDate, form.halfDay, effectiveEnd])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setSuccess(true)
    setForm({ type: 'DOVOLENA', startDate: '', endDate: '', halfDay: false, reason: '' })
    setAttachment(null)
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

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Typ absence</label>
        <select
          value={form.type}
          onChange={(e) => update('type', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
        >
          {LEAVE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Sick note */}
      {isSick && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            Nevíš, jak postupovat při nemoci?{' '}
            <Link href="/pravidla" className="font-semibold underline hover:no-underline inline-flex items-center gap-0.5">
              Přečti si pravidla <ExternalLink className="w-3 h-3" />
            </Link>
            {' '}— najdeš tam postup, neschopenku i kontakt na HR.
          </p>
        </div>
      )}

      {/* Neschopenka upload */}
      {isSick && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Neschopenka <span className="text-slate-300 font-normal">(nepovinné — pokud ji ještě nemáš, klidně doplň po skončení nemoci v historii žádostí)</span>
          </label>
          {attachment ? (
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                {attachment.kind === 'pdf'
                  ? <FileText className="w-4 h-4 text-red-400" />
                  : <ImageIcon className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy truncate">{attachment.name}</p>
                <p className="text-xs text-slate-400">{(attachment.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-violet hover:text-violet hover:bg-violet/5 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              Nahrát neschopenku
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={handleFilePick}
            className="hidden"
          />
          {attachError && <p className="text-xs text-red-500 mt-1">{attachError}</p>}
        </div>
      )}

      {/* Funeral note */}
      {isFuneral && (
        <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            Do důvodu zadej <strong>pohřeb</strong>.{' '}
            <Link href="/pravidla" className="text-violet underline hover:no-underline inline-flex items-center gap-0.5">
              Pravidla pro pohřeb <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{form.halfDay ? 'Datum' : 'Od'}</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        {!form.halfDay && (
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
        )}
      </div>

      {/* Half day toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <div
          onClick={() => update('halfDay', !form.halfDay)}
          className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.halfDay ? 'bg-violet' : 'bg-slate-200'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow mt-1 transition-transform ${form.halfDay ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
        <span className="text-sm text-slate-600">Pouze půlden</span>
      </label>

      {/* Reason — required */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Důvod <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.reason}
          onChange={(e) => update('reason', e.target.value)}
          required
          placeholder={
            isSick ? 'Např. nachlazení' :
            isFuneral ? 'Pohřeb' :
            isHomeoffice ? 'Např. práce z domova' :
            'Např. letní dovolená'
          }
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
        />
      </div>

      {/* Live calculation */}
      {calc && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedType.deductsBalance ? 'Pracovní dny k čerpání dovolené' : 'Délka absence'}
            </span>
            <span className="text-lg font-headline font-bold text-navy">
              {calc.workdays === 0.5 ? 'půl dne' : `${calc.workdays} ${calc.workdays === 1 ? 'den' : 'dní'}`}
            </span>
          </div>

          {/* Náhrada + srážka při nemoci */}
          {isSick && monthlySalary && calc.workdays >= 1 && (() => {
            const r = computeSickPay(monthlySalary, calc.workdays)
            return (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Orientační dopad na výplatu
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] text-slate-400">Náhrada za den</p>
                    <p className="text-sm font-bold text-navy">{fmtCzk(r.compensationDay)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Náhrada celkem ({r.employerDays} dní)</p>
                    <p className="text-sm font-bold text-navy">{fmtCzk(r.compensationTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Srážka ze mzdy</p>
                    <p className="text-sm font-bold text-red-500">−{fmtCzk(r.deduction)}</p>
                  </div>
                </div>
                {r.csszDays > 0 && (
                  <p className="text-[11px] text-slate-400">
                    Od 15. dne ({r.csszDays} dní) platí nemocenské ČSSZ — nejde ze mzdy od Four Bros.
                  </p>
                )}
                <p className="text-[11px] text-slate-400">
                  Podrobný rozpis srážky uvidíš i v záložce <strong>Moje výplata</strong> po zpracování žádosti.
                </p>
              </div>
            )
          })()}
          {calc.holidays.length > 0 && selectedType.deductsBalance && (
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
