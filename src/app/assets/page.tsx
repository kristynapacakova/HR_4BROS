import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_ASSETS, ASSET_TYPES, ASSET_CONDITIONS } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { Laptop, Smartphone, Mouse, Keyboard, Monitor, Zap, Headphones, Package } from 'lucide-react'

const TYPE_ICONS: Record<string, React.ElementType> = {
  NOTEBOOK: Laptop,
  TELEFON: Smartphone,
  MYS: Mouse,
  KLAVESNICE: Keyboard,
  MONITOR: Monitor,
  NABIJEC: Zap,
  SLUCHATKA: Headphones,
  JINE: Package,
}

const CONDITION_COLORS: Record<string, string> = {
  NOVY: 'bg-green-50 text-green-700',
  DOBRY: 'bg-blue-50 text-blue-700',
  OPOTREBOVANY: 'bg-amber-50 text-amber-700',
  POSKOZENY: 'bg-red-50 text-red-700',
}

export default async function AssetsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.email === 'admin@fourbros.cz' ? 'demo-admin-1' : 'demo-employee-1'
  const myAssets = DEMO_ASSETS.filter((a) => a.assignedTo === userId)

  return (
    <AppShell
      title="Můj majetek"
      isAdmin={session.user.role === 'ADMIN'}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ASSET_TYPES.filter((t) => myAssets.some((a) => a.type === t.value)).map((type) => {
            const count = myAssets.filter((a) => a.type === type.value).length
            const Icon = TYPE_ICONS[type.value] || Package
            return (
              <div key={type.value} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-alice rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-navy">{count}</p>
                  <p className="text-xs text-slate-400">{type.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Assets list */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Přiřazené vybavení ({myAssets.length} položek)</h3>
          </div>

          {myAssets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">Zatím nemáte přiřazený žádný majetek.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {myAssets.map((asset) => {
                const Icon = TYPE_ICONS[asset.type] || Package
                const typeLabel = ASSET_TYPES.find((t) => t.value === asset.type)?.label || asset.type
                const conditionLabel = ASSET_CONDITIONS.find((c) => c.value === asset.condition)?.label || asset.condition
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
                      {asset.assignedAt && (
                        <p className="text-xs text-slate-300 mt-0.5">od {formatDate(asset.assignedAt)}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center">
          Při ztrátě nebo poškození majetku kontaktujte HR oddělení.
        </p>
      </div>
    </AppShell>
  )
}
