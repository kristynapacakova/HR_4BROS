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
      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent bg-white"
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
      className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
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

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        value={ico}
        placeholder="IČO"
        onChange={(e) => setIco(e.target.value)}
        onBlur={() => savePersonOverride(person.id, { icoNumber: ico || null })}
        className="w-28 text-xs border border-slate-200 rounded-lg px-2 py-1 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
      />
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={office}
          placeholder="kancelář Kč"
          title="Nájem kancelářského místa (Kč/měsíc)"
          onChange={(e) => setOffice(e.target.value === '' ? '' : Number(e.target.value))}
          onBlur={() => savePersonOverride(person.id, { officeAmount: office === '' ? null : Number(office) })}
          className="w-20 text-xs border border-slate-200 rounded-lg px-2 py-1 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
        />
        <input
          type="number"
          min={0}
          value={refresh}
          placeholder="obč. Kč"
          title="Občerstvení (Kč/měsíc)"
          onChange={(e) => setRefresh(e.target.value === '' ? '' : Number(e.target.value))}
          onBlur={() => savePersonOverride(person.id, { refreshAmount: refresh === '' ? null : Number(refresh) })}
          className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
        />
      </div>
    </div>
  )
}
