'use client'

import { useState } from 'react'
import { ProfileForm } from './ProfileForm'
import { Laptop, Smartphone, Mouse, Keyboard, Monitor, Zap, Headphones, Package } from 'lucide-react'

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
  name: string; email: string; phone: string | null; address: string | null
  city: string | null; bankAccount: string | null; department: string | null
  position: string | null; country: string | null; employmentType?: string | null
}

export function ProfileTabs({
  user, assets, assetTypes, assetConditions,
}: {
  user: User
  assets: Asset[]
  assetTypes: AssetType[]
  assetConditions: AssetCondition[]
}) {
  const [tab, setTab] = useState<'udaje' | 'majetek'>('udaje')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1 mb-5">
        {([
          { id: 'udaje',   label: 'Osobní údaje' },
          { id: 'majetek', label: 'Zapůjčený majetek' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t.id
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'udaje' && <ProfileForm user={user} />}

      {tab === 'majetek' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
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
                    <div className="w-10 h-10 bg-alice rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-navy">{asset.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CONDITION_COLORS[asset.condition] || 'bg-slate-50 text-slate-600'}`}>
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
    </div>
  )
}
