'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProfileForm } from './ProfileForm'
import { Laptop, Smartphone, Mouse, Keyboard, Monitor, Zap, Headphones, Package, User as UserIcon, Banknote, CalendarDays, FileText, ClipboardList, Gift } from 'lucide-react'
import { BenefitsPanel } from './panels/BenefitsPanel'

const TYPE_ICONS: Record<string, React.ElementType> = {
  NOTEBOOK: Laptop, TELEFON: Smartphone, MYS: Mouse,
  KLAVESNICE: Keyboard, MONITOR: Monitor, NABIJEC: Zap,
  SLUCHATKA: Headphones, JINE: Package,
}

const CONDITION_COLORS: Record<string, string> = {
  NOVY: 'bg-green-50 text-green-700',
  DOBRY: 'bg-blue-50 text-blue-700',
  OPOTREBOVANY: 'bg-amber-50 text-amber-700',
  POSKOZENY: 'bg-red-50 text-red-700',
}

interface Asset {
  id: string; name: string; type: string; brand: string | null; model: string | null
  serialNumber: string | null; condition: string; assignedAt: Date | null; notes: string | null
}
interface AssetType { value: string; label: string }
interface AssetCondition { value: string; label: string }
interface User {
  id: string
  name: string; email: string; phone: string | null; address: string | null
  city: string | null; bankAccount: string | null; department: string | null
  position: string | null; country: string | null; employmentType?: string | null
}
interface HRData {
  seniority: string | null
  monthlyHours: number | null
  clientHours: number | null
  monthlySalary: number | null
  hourlyRate: number | null
}

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

function tenure(startDate?: Date | null): string {
  if (!startDate) return '—'
  const now = new Date()
  const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
  if (months < 12) return `${months} měs.`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years} r. ${rem} měs.` : `${years} r.`
}

export function ProfileTabs({
  user, assets, assetTypes, assetConditions, isAdmin, hrData, seniorityLevels, employmentTypes,
  payslipsLabel, payslipsPanel, timeOffPanel, documentsPanel,
}: {
  user: User & { startDate?: Date | null }
  assets: Asset[]
  assetTypes: AssetType[]
  assetConditions: AssetCondition[]
  isAdmin?: boolean
  hrData?: HRData
  seniorityLevels?: { value: string; label: string }[]
  employmentTypes?: { value: string; label: string }[]
  payslipsLabel?: string
  payslipsPanel?: React.ReactNode
  timeOffPanel?: React.ReactNode
  documentsPanel?: React.ReactNode
}) {
  const tabs = [
    { id: 'udaje', label: 'Osobní údaje', icon: UserIcon },
    { id: 'majetek', label: 'Majetek', icon: Laptop },
    { id: 'vyplata', label: payslipsLabel ?? 'Moje odměna', icon: Banknote },
    { id: 'dochazka', label: 'Docházka', icon: CalendarDays },
    { id: 'benefity', label: 'Benefity', icon: Gift },
    { id: 'dokumenty', label: 'Dokumenty', icon: FileText },
  ] as const
  type TabId = typeof tabs[number]['id']
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const initialTab = tabs.some(t => t.id === requestedTab) ? (requestedTab as TabId) : 'udaje'
  const [tab, setTab] = useState<TabId>(initialTab)

  const efficiency = hrData?.monthlyHours && hrData.clientHours
    ? Math.round((hrData.clientHours / hrData.monthlyHours) * 100)
    : null

  const seniorityLabel = seniorityLevels?.find(s => s.value === hrData?.seniority)?.label ?? hrData?.seniority ?? '—'

  return (
    <div>
      {/* Tab bar — horizontal pill row under the profile header, clearly separate from the main nav */}
      <div className="flex flex-wrap gap-1.5 bg-slate-50 rounded-2xl p-1.5 mb-6">
        {tabs.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabId)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                active ? 'bg-white text-violet shadow-sm' : 'text-slate-500 hover:text-navy'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-violet' : 'text-slate-400'}`} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Osobní údaje + HR údaje */}
      {tab === 'udaje' && (
        <div className="space-y-6">
          <ProfileForm
            user={user}
            employment={{ startDate: (user as { startDate?: Date | null }).startDate, currentSalary: hrData?.monthlySalary ?? null }}
          />

          {/* HR údaje — viditelné jen pro TL / admina / HR */}
          {isAdmin && (
            <div className="space-y-4">
              {/* Summary row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Seniorita', value: seniorityLabel },
                  { label: 'Ve firmě', value: tenure((user as { startDate?: Date | null }).startDate) },
                  { label: 'Úvazek', value: hrData?.monthlyHours ? `${hrData.monthlyHours} h/měs` : '—' },
                  { label: 'Efektivita', value: efficiency ? `${efficiency} %` : '—', highlight: true },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                    <p className={`text-xl font-headline font-bold ${c.highlight ? 'text-violet' : 'text-navy'}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Detail form */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-headline font-semibold text-navy">HR údaje</h3>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">Demo — nelze uložit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Pozice">
                    <input defaultValue={user.position ?? ''} className="input" />
                  </Field>
                  <Field label="Seniorita">
                    <select defaultValue={hrData?.seniority ?? ''} className="input">
                      <option value="">— vyberte —</option>
                      {seniorityLevels?.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Oddělení / Tým">
                    <input defaultValue={user.department ?? ''} className="input" />
                  </Field>
                  <Field label="Typ spolupráce">
                    <select defaultValue={user.employmentType ?? ''} className="input">
                      <option value="">— vyberte —</option>
                      {employmentTypes?.map(e => <option key={e.value} value={e.value}>{e.value} — {e.label.split('–')[1]?.trim() ?? e.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Úvazek (h/měs)">
                    <input type="number" defaultValue={hrData?.monthlyHours ?? ''} className="input" />
                  </Field>
                  <Field label="Klientské hodiny (h/měs)">
                    <input type="number" defaultValue={hrData?.clientHours ?? ''} className="input" />
                  </Field>
                  {user.employmentType !== 'ICO' && (
                    <Field label="Mzda / měsíc (Kč)">
                      <input type="number" defaultValue={hrData?.monthlySalary ?? ''} className="input" />
                    </Field>
                  )}
                  {user.employmentType === 'ICO' && (
                    <Field label="Hodinová sazba (Kč/h)">
                      <input type="number" defaultValue={hrData?.hourlyRate ?? ''} className="input" />
                    </Field>
                  )}
                </div>
                {/* Derived stats */}
                {(hrData?.monthlyHours || hrData?.monthlySalary || hrData?.hourlyRate) && (
                  <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    {efficiency !== null && (
                      <div><p className="text-xs text-slate-400">Efektivita</p><p className="font-semibold text-violet">{efficiency} %</p></div>
                    )}
                    {hrData.monthlySalary && hrData.clientHours && (
                      <div><p className="text-xs text-slate-400">Náklad / kl. hodinu</p><p className="font-semibold text-navy">{fmt(Math.round(hrData.monthlySalary / hrData.clientHours))}</p></div>
                    )}
                    {hrData.hourlyRate && hrData.clientHours && (
                      <div><p className="text-xs text-slate-400">Měs. fakturace (odhad)</p><p className="font-semibold text-navy">{fmt(hrData.hourlyRate * hrData.clientHours)}</p></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zapůjčený majetek */}
      {tab === 'majetek' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Zapůjčený majetek ({assets.length} položek)</h3>
          </div>
          {assets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">Zatím nemáte přiřazený žádný majetek.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {assets.map(asset => {
                const Icon = TYPE_ICONS[asset.type] || Package
                const typeLabel = assetTypes.find(t => t.value === asset.type)?.label || asset.type
                const conditionLabel = assetConditions.find(c => c.value === asset.condition)?.label || asset.condition
                return (
                  <div key={asset.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-alice rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-navy">{asset.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_COLORS[asset.condition] || 'bg-slate-50 text-slate-600'}`}>
                          {conditionLabel}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {asset.brand} {asset.model}
                        {asset.serialNumber && <span className="ml-2 text-slate-300">S/N: {asset.serialNumber}</span>}
                      </p>
                      {asset.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{asset.notes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-slate-400">{typeLabel}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Moje odměna */}
      {tab === 'vyplata' && payslipsPanel}

      {/* Moje docházka */}
      {tab === 'dochazka' && timeOffPanel}

      {/* Benefity */}
      {tab === 'benefity' && <BenefitsPanel employeeId={user.id} employeeName={user.name} employmentType={user.employmentType} />}

      {/* Dokumenty a smlouvy */}
      {tab === 'dokumenty' && documentsPanel}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
