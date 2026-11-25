'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { PersonRecord } from '@/lib/mock-data'
import { useUserStatuses, statusOf, deactivateUser, reactivateUser } from '@/lib/user-status-client'

const fmt = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ')
const today = () => new Date().toISOString().slice(0, 10)

export function useStatusFilter(people: PersonRecord[]) {
  const map = useUserStatuses()
  const isActive = (id: string) => map[id]?.active !== false
  const inactive = people.filter(p => !isActive(p.id)).length
  return { isActive, counts: { active: people.length - inactive, inactive } }
}

/** Stav uživatele v Admin → Uživatelé: aktivní / neaktivní + deaktivovat / znovu aktivovat. */
/** mode 'row' = stav v řádku (u neaktivních i „Znovu aktivovat“); 'action' = jen tlačítko Deaktivovat v rozbaleném nastavení */
export function UserStatusCell({ person, mode = 'row' }: { person: PersonRecord; mode?: 'row' | 'action' }) {
  const map = useUserStatuses()
  const st = statusOf(map, person.id, person.startDate)
  const last = st.periods[st.periods.length - 1]
  const [dialog, setDialog] = useState<'off' | 'on' | null>(null)
  const [date, setDate] = useState(today())
  const [reason, setReason] = useState('')
  const returns = st.periods.length - 1

  const confirm = () => {
    if (dialog === 'off') deactivateUser(person.id, person.startDate, date, reason.trim())
    else reactivateUser(person.id, person.startDate, date)
    setDialog(null)
  }
  const open = (k: 'off' | 'on') => { setDate(today()); setReason(''); setDialog(k) }

  return (
    <div className={mode === 'row' ? 'min-w-[140px] text-center' : ''}>
      {mode === 'action' ? (
        st.active && <button type="button" onClick={() => open('off')} className="text-xs font-semibold border border-navy/30 text-navy px-3 py-1.5 hover:border-navy">Deaktivovat uživatele</button>
      ) : st.active ? (
        <>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy"><span className="w-2 h-2 bg-mint" />Aktivní</span>
          <span className="block text-[11px] text-navy/45">od {fmt(last.start)}{returns > 0 ? ` · ${returns}× návrat` : ''}</span>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy/60"><span className="w-2 h-2 bg-navy/25" />Neaktivní</span>
          <span className="block text-[11px] text-navy/45">skončil(a) {last.end ? fmt(last.end) : ''}</span>
          <button type="button" onClick={() => open('on')} className="mt-1 text-[11px] font-bold uppercase tracking-[0.06em] bg-gold text-navy px-2 py-1 hover:bg-navy hover:text-white">Znovu aktivovat</button>
        </>
      )}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60" onClick={() => setDialog(null)}>
          <div className="bg-white border border-navy w-full max-w-md text-left" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(13,33,79,0.14)]">
              <p className="font-headline text-navy text-[17px]" style={{ fontWeight: 600 }}>{dialog === 'off' ? 'Deaktivovat' : 'Znovu aktivovat'} — {person.name}</p>
              <button type="button" onClick={() => setDialog(null)} aria-label="Zavřít" className="text-navy/60 hover:text-navy"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4 text-sm text-navy">
              <p className="text-navy/70">
                {dialog === 'off'
                  ? 'Uživatel se nebude moct přihlásit a zmizí z Týmu, Dashboardu a přehledů. Smlouvy, dokumenty, výplaty i historie zůstanou — když se vrátí, jen ho znovu aktivuješ.'
                  : 'Uživatel se znovu přihlásí stejným účtem a vrátí se do Týmu i přehledů. Začne mu nové období spolupráce, předchozí historie zůstane. Zkontroluj smlouvy — ke každému návratu obvykle patří nová.'}
              </p>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60 mb-1">{dialog === 'off' ? 'Poslední den spolupráce' : 'Datum návratu'}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-violet" />
              </div>
              {dialog === 'off' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60 mb-1">Důvod (nepovinné, vidí jen HR)</label>
                  <input value={reason} onChange={e => setReason(e.target.value)} placeholder="např. konec smlouvy, odchod na mateřskou" className="w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-violet" />
                </div>
              )}
              {st.periods.length > 1 || !st.active ? (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60 mb-1">Historie spolupráce</p>
                  <ul className="text-[12px] text-navy/70 space-y-0.5">
                    {st.periods.map((p, i) => <li key={i}>{fmt(p.start)} – {p.end ? fmt(p.end) : 'dosud'}{p.endReason ? ` · ${p.endReason}` : ''}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-[rgba(13,33,79,0.14)]">
              <button type="button" onClick={() => setDialog(null)} className="px-4 py-2 text-sm font-semibold text-navy/60 hover:text-navy">Zrušit</button>
              <button type="button" onClick={confirm} disabled={!date} className="px-4 py-2 text-sm font-semibold bg-navy text-white hover:bg-violet disabled:opacity-40">{dialog === 'off' ? 'Deaktivovat' : 'Aktivovat'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
