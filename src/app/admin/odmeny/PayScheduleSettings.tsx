'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_PAY_SCHEDULE, loadPaySchedule, savePaySchedule, type PaySchedule } from '@/lib/pay-schedule'

/** Nastavení termínů: do kdy posílají OSVČ fakturu a kdy se proplácí výplaty/faktury. Řídí odpočet na Dashboardu. */
export function PayScheduleSettings() {
  const [s, setS] = useState<PaySchedule>(DEFAULT_PAY_SCHEDULE)
  const [saved, setSaved] = useState(false)
  useEffect(() => { setS(loadPaySchedule()) }, [])

  const set = (k: keyof PaySchedule, v: string) => {
    const n = Math.max(1, Math.min(28, Number(v) || 1))
    setS(prev => ({ ...prev, [k]: n }))
    setSaved(false)
  }
  const save = () => { savePaySchedule(s); setSaved(true) }

  const field = (k: keyof PaySchedule, label: string, hint: string) => (
    <label className="flex items-center gap-3">
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-navy">{label}</span>
        <span className="block text-xs text-navy/55">{hint}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <input
          type="number" min={1} max={28} value={s[k]}
          onChange={e => set(k, e.target.value)}
          className="w-16 border border-[rgba(13,33,79,0.25)] px-2 py-1.5 text-center font-headline text-navy text-lg focus:outline-none focus:border-violet"
        />
        <span className="text-sm text-navy/60">. dne</span>
      </span>
    </label>
  )

  return (
    <section className="bg-white border border-[rgba(13,33,79,0.14)] border-l-4 border-l-gold p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <p className="font-headline text-navy text-[17px]" style={{ fontWeight: 600 }}>Termíny</p>
        <p className="text-xs text-navy/50">Podle nich se lidem na Dashboardu odpočítává faktura a výplata.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
        {field('invoiceDueDay', 'OSVČ pošlou fakturu do', 'za předchozí měsíc')}
        {field('payDay', 'Výplaty a faktury se proplácí', 'HPP i OSVČ')}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} className="px-4 py-2 bg-navy text-white text-sm font-semibold hover:bg-violet transition-colors">Uložit termíny</button>
        {saved && <span className="text-sm text-navy/60">Uloženo ✓</span>}
      </div>
    </section>
  )
}
