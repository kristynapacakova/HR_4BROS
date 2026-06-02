'use client'

import { useState } from 'react'
import { EMPLOYMENT_TYPES } from '@/lib/mock-data'

interface UserData {
  name: string | null
  email: string
  phone: string | null
  address: string | null
  city: string | null
  bankAccount: string | null
  department: string | null
  position: string | null
  country: string | null
  employmentType?: string | null
}

interface ProfileFormProps {
  user: UserData
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    bankAccount: user.bankAccount || '',
    ecName: '',
    ecPhone: '',
    ecRelationship: '',
  })

  const update = (key: string, value: string) => setFormData((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Demo: simulate save delay then show demo notice
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Demo notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800 text-xs">Demo verze — změny se neukládají</p>
      </div>

      {/* Personal info */}
      <Section title="Osobní údaje">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Jméno a příjmení" value={formData.name} onChange={(v) => update('name', v)} />
          <Field label="E-mail" value={user.email} readOnly />
          <Field label="Telefon" value={formData.phone} onChange={(v) => update('phone', v)} type="tel" />
          <Field label="Oddělení" value={user.department || ''} readOnly />
          <Field label="Pozice" value={user.position || ''} readOnly />
          <Field
            label="Typ spolupráce"
            value={EMPLOYMENT_TYPES.find((t) => t.value === user.employmentType)?.label || user.employmentType || '—'}
            readOnly
          />
          <Field label="Bankovní účet (IBAN)" value={formData.bankAccount} onChange={(v) => update('bankAccount', v)} />
        </div>
      </Section>

      {/* Address */}
      <Section title="Adresa">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Ulice a číslo" value={formData.address} onChange={(v) => update('address', v)} />
          </div>
          <Field label="Město" value={formData.city} onChange={(v) => update('city', v)} />
          <Field label="Stát" value={user.country || 'CZ'} readOnly />
        </div>
      </Section>

      {/* Emergency contact */}
      <Section title="Kontakt pro případ nouze">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Jméno" value={formData.ecName} onChange={(v) => update('ecName', v)} />
          <Field label="Telefon" value={formData.ecPhone} onChange={(v) => update('ecPhone', v)} type="tel" />
          <Field label="Vztah" value={formData.ecRelationship} onChange={(v) => update('ecRelationship', v)} placeholder="Manžel/ka, rodič..." />
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-violet hover:bg-violet-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {saving ? 'Ukládám...' : 'Uložit změny'}
        </button>
        {saved && <p className="text-amber-600 text-sm">Demo verze — změny se neukládají</p>}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-headline font-semibold text-navy mb-4 pb-3 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${
          readOnly
            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-default'
            : 'bg-white border-slate-200 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent'
        }`}
      />
    </div>
  )
}
