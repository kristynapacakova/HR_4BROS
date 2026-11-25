'use client'

import { useEffect, useState } from 'react'
import type { PersonRecord } from '@/lib/mock-data'
import { PERSON_ROLE_LABELS } from '@/lib/mock-data'
import { loadPersonOverrides, savePersonOverride, PERSON_OVERRIDE_CHANGED_EVENT, type PersonOverride } from '@/lib/person-admin-client'

function useOverride(personId: string) {
  const [overrides, setOverrides] = useState<Record<string, PersonOverride>>({})
  useEffect(() => {
    const refresh = () => setOverrides(loadPersonOverrides())
    refresh()
    window.addEventListener(PERSON_OVERRIDE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(PERSON_OVERRIDE_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return overrides[personId]
}

export function RoleCell({ person }: { person: PersonRecord }) {
  const override = useOverride(person.id)
  const current = override?.role ?? person.role
  return (
    <select
      value={current}
      onChange={(e) => savePersonOverride(person.id, { role: e.target.value as PersonRecord['role'] })}
      className="h-9 text-sm border border-[rgba(13,33,79,0.2)] bg-white px-3 text-navy focus:outline-none focus:border-violet"
    >
      {Object.entries(PERSON_ROLE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}

export function LeaveDaysCell({ person }: { person: PersonRecord }) {
  const override = useOverride(person.id)
  const current = override?.annualLeaveDays !== undefined ? override.annualLeaveDays : person.annualLeaveDays
  const [value, setValue] = useState(current ?? '')

  useEffect(() => { setValue(current ?? '') }, [current])

  return (
    <input
      type="number"
      min={0}
      value={value}
      placeholder="—"
      onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
      onBlur={() => savePersonOverride(person.id, { annualLeaveDays: value === '' ? null : Number(value) })}
      className="w-16 text-xs border border-slate-200 px-2 py-1.5 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
    />
  )
}

export function IcoFieldsCell({ person }: { person: PersonRecord }) {
  const override = useOverride(person.id)
  if (person.employmentType !== 'ICO') return <span className="text-slate-400">—</span>

  const icoNumber = override?.icoNumber !== undefined ? override.icoNumber : person.icoNumber
  const officeAmount = override?.officeAmount !== undefined ? override.officeAmount : person.officeAmount
  const refreshAmount = override?.refreshAmount !== undefined ? override.refreshAmount : person.refreshAmount

  const [ico, setIco] = useState(icoNumber ?? '')
  const [office, setOffice] = useState(officeAmount ?? '')
  const [refresh, setRefresh] = useState(refreshAmount ?? '')

  useEffect(() => { setIco(icoNumber ?? '') }, [icoNumber])
  useEffect(() => { setOffice(officeAmount ?? '') }, [officeAmount])
  useEffect(() => { setRefresh(refreshAmount ?? '') }, [refreshAmount])

  // IČO, kancelář a občerstvení vedle sebe — každé pole s vlastním popiskem
  return (
    <>
      <label className="block">
        <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-navy/55 mb-1">IČO</span>
        <input type="text" inputMode="numeric" value={ico} placeholder="12345678"
          onChange={(e) => setIco(e.target.value)}
          onBlur={() => savePersonOverride(person.id, { icoNumber: ico || null })}
          className="w-32 h-9 text-sm border border-[rgba(13,33,79,0.2)] bg-white px-3 text-navy focus:outline-none focus:border-violet" />
      </label>
      <label className="block">
        <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-navy/55 mb-1">Kancelář (Kč / měs)</span>
        <input type="number" min={0} value={office} placeholder="0"
          onChange={(e) => setOffice(e.target.value === '' ? '' : Number(e.target.value))}
          onBlur={() => savePersonOverride(person.id, { officeAmount: office === '' ? null : Number(office) })}
          className="w-32 h-9 text-sm border border-[rgba(13,33,79,0.2)] bg-white px-3 text-navy focus:outline-none focus:border-violet" />
      </label>
      <label className="block">
        <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-navy/55 mb-1">Občerstvení (Kč / měs)</span>
        <input type="number" min={0} value={refresh} placeholder="0"
          onChange={(e) => setRefresh(e.target.value === '' ? '' : Number(e.target.value))}
          onBlur={() => savePersonOverride(person.id, { refreshAmount: refresh === '' ? null : Number(refresh) })}
          className="w-32 h-9 text-sm border border-[rgba(13,33,79,0.2)] bg-white px-3 text-navy focus:outline-none focus:border-violet" />
      </label>
    </>
  )
}
