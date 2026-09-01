'use client'

import { useEffect, useState } from 'react'
import { EMPLOYMENT_TYPES, DEMO_TEAM } from '@/lib/mock-data'
import { loadTeamProfiles, saveTeamProfile, TEAM_PROFILE_CHANGED_EVENT, PERSONALITY_TYPES } from '@/lib/team-profile-client'

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
  /** Extra data pro zaměstnanecký poměr (HPP/DPP/DPČ) */
  employment?: {
    startDate?: Date | null
    currentSalary?: number | null
    contractTermType?: 'URCITA' | 'NEURCITA' | null
    contractEndDate?: Date | null
  }
}

const INSURANCE_COMPANIES = [
  { code: '111', name: 'VZP — Všeobecná zdravotní pojišťovna' },
  { code: '201', name: 'VoZP — Vojenská zdravotní pojišťovna' },
  { code: '205', name: 'ČPZP — Česká průmyslová zdravotní pojišťovna' },
  { code: '207', name: 'OZP — Oborová zdravotní pojišťovna' },
  { code: '211', name: 'ZPMV — Zdravotní pojišťovna ministerstva vnitra' },
  { code: '213', name: 'RBP — Revírní bratrská pokladna' },
]

const BOZP_URL = 'https://www.skolenibozp.cz/'
const BOZP_KEY = 'fb-bozp-last-done'

function fmtCzk(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

export function ProfileForm({ user, employment }: ProfileFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nickname, setNickname] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [insurance, setInsurance] = useState('111')
  const [startingSalary, setStartingSalary] = useState('')
  const [bozpLastDone, setBozpLastDone] = useState<string | null>(null)
  const [personality, setPersonality] = useState<string>('')

  const teamMemberId = DEMO_TEAM.find((m) => m.email.toLowerCase() === user.email.toLowerCase())?.id ?? null

  const isEmployee = ['HPP', 'DPP', 'DPC'].includes(user.employmentType ?? '')
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

  useEffect(() => {
    try {
      setNickname(localStorage.getItem('fb-nickname') ?? '')
      setBozpLastDone(localStorage.getItem(BOZP_KEY))
    } catch { /* noop */ }
  }, [])

  useEffect(() => {
    if (!teamMemberId) return
    const refresh = () => setPersonality(loadTeamProfiles()[teamMemberId]?.personality ?? '')
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [teamMemberId])

  const updatePersonality = (code: string) => {
    setPersonality(code)
    if (teamMemberId) saveTeamProfile(teamMemberId, { personality: code || null })
  }

  const markBozpDone = () => {
    const today = new Date().toISOString().slice(0, 10)
    try { localStorage.setItem(BOZP_KEY, today) } catch { /* noop */ }
    setBozpLastDone(today)
  }

  const bozpNextDue = bozpLastDone
    ? new Date(new Date(bozpLastDone).setFullYear(new Date(bozpLastDone).getFullYear() + 1))
    : null
  const bozpOverdue = bozpNextDue ? bozpNextDue < new Date() : true

  const currentSalary = employment?.currentSalary ?? null
  const startSalaryNum = Number(startingSalary) || null
  const growthPct = currentSalary && startSalaryNum && startSalaryNum > 0
    ? Math.round(((currentSalary - startSalaryNum) / startSalaryNum) * 100)
    : null

  const update = (key: string, value: string) => setFormData((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Nickname is persisted locally — the dashboard greets you with it
    try {
      if (nickname.trim()) localStorage.setItem('fb-nickname', nickname.trim())
      else localStorage.removeItem('fb-nickname')
    } catch { /* noop */ }
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Demo notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
        <p className="text-amber-800 text-xs">Demo verze — změny se neukládají</p>
      </div>

      {/* Personal info */}
      <Section title="Osobní údaje">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Jméno a příjmení" value={formData.name} onChange={(v) => update('name', v)} />
          <div>
            <label className="block text-xs font-medium text-violet mb-1">Přezdívka — jak ti máme říkat</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="např. Peťa, Kiki…"
              className="w-full px-3 py-2 border rounded-lg text-sm transition-all bg-white border-violet/30 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
            />
            <p className="text-[10px] text-slate-400 mt-1">Portál tě bude vítat touto přezdívkou. Tahle volba se ukládá.</p>
          </div>
          <Field label="E-mail" value={user.email} readOnly />
          <Field label="Telefon" value={formData.phone} onChange={(v) => update('phone', v)} type="tel" />
          <Field label="Oddělení" value={user.department || ''} readOnly />
          <Field label="Pozice" value={user.position || ''} readOnly />
          <Field
            label="Typ spolupráce"
            value={EMPLOYMENT_TYPES.find((t) => t.value === user.employmentType)?.label || user.employmentType || '—'}
            readOnly
          />
          <Field label="Nástup" value={employment?.startDate ? new Date(employment.startDate).toLocaleDateString('cs-CZ') : '—'} readOnly />
          <Field
            label="Typ smlouvy"
            value={
              employment?.contractTermType === 'URCITA'
                ? `Na dobu určitou — do ${employment.contractEndDate ? new Date(employment.contractEndDate).toLocaleDateString('cs-CZ') : '—'}`
                : employment?.contractTermType === 'NEURCITA'
                  ? 'Na dobu neurčitou'
                  : '—'
            }
            readOnly
          />
          {user.employmentType !== 'ICO' && (
            <Field label="Bankovní účet (IBAN)" value={formData.bankAccount} onChange={(v) => update('bankAccount', v)} />
          )}
          {teamMemberId && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">16 Personalities</label>
              <select
                value={personality}
                onChange={(e) => updatePersonality(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm transition-all bg-white border-slate-200 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              >
                <option value="">— nevyplněno —</option>
                {Object.entries(PERSONALITY_TYPES).map(([code, t]) => (
                  <option key={code} value={code}>{code} — {t.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Zobrazí se na tvé kartě v Týmu Four Bros. Test najdeš na{' '}
                <a href="https://www.16personalities.com/cz" target="_blank" rel="noopener noreferrer" className="text-violet hover:underline">16personalities.com</a>.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Zaměstnanecké údaje — jen pro HPP/DPP/DPČ */}
      {isEmployee && (
        <Section title="Zaměstnanecké údaje">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Datum narození</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Zdravotní pojišťovna</label>
              <select
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              >
                {INSURANCE_COMPANIES.map(i => <option key={i.code} value={i.code}>{i.code} · {i.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nástupní plat (Kč)</label>
              <input
                type="number"
                value={startingSalary}
                onChange={(e) => setStartingSalary(e.target.value)}
                placeholder="např. 45 000"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Aktuální plat</label>
              <div className="flex items-center gap-3">
                <p className="text-lg font-headline font-bold text-navy">{currentSalary ? fmtCzk(currentSalary) : '—'}</p>
                {growthPct !== null && growthPct > 0 && (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    +{growthPct} % od nástupu
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Školení BOZP */}
          <div className={`mt-5 rounded-2xl p-4 border ${bozpOverdue ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-navy">Školení BOZP</p>
                {bozpLastDone ? (
                  <p className={`text-xs mt-0.5 ${bozpOverdue ? 'text-amber-700' : 'text-green-700'}`}>
                    {bozpOverdue
                      ? `⚠️ Propadlé — naposledy ${new Date(bozpLastDone).toLocaleDateString('cs-CZ')}`
                      : `✓ Splněno ${new Date(bozpLastDone).toLocaleDateString('cs-CZ')} · další termín ${bozpNextDue!.toLocaleDateString('cs-CZ')}`}
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 mt-0.5">⚠️ Zatím neabsolvováno — je potřeba každý rok</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={BOZP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-violet hover:bg-violet-dark transition-colors"
                >
                  Přejít na školení →
                </a>
                <button
                  type="button"
                  onClick={markBozpDone}
                  className="px-3 py-2 rounded-full text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:text-navy transition-colors"
                >
                  Označit jako splněné
                </button>
              </div>
            </div>
          </div>
        </Section>
      )}

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
          className="bg-violet hover:bg-violet-dark text-white font-medium py-2.5 px-6 rounded-full transition-colors disabled:opacity-50 shadow-sm"
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
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
