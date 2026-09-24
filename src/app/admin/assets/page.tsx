import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_ASSETS, DEMO_EMPLOYEES, ASSET_TYPES, ASSET_CONDITIONS } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { Laptop, Smartphone, Mouse, Keyboard, Monitor, Zap, Headphones, Package, PlusCircle } from 'lucide-react'
import { AddAssetForm } from './AddAssetForm'

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

export default async function AdminAssetsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const allEmployees = DEMO_EMPLOYEES
  const allAssets = DEMO_ASSETS

  const getEmployeeName = (userId: string | null) => {
    if (!userId) return null
    return allEmployees.find((e) => e.id === userId)?.name || 'Neznámý'
  }

  const assigned = allAssets.filter((a) => a.assignedTo !== null)
  const unassigned = allAssets.filter((a) => a.assignedTo === null)

  return (
    <AppShell
      title="Správa majetku"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-2xl font-semibold text-navy">{allAssets.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Celkem položek</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-2xl font-semibold text-navy">{assigned.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Přiřazeno</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-2xl font-semibold text-navy">{unassigned.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Skladem</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-2xl font-semibold text-navy">{allEmployees.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Zaměstnanců s majetkem</p>
          </div>
        </div>

        {/* Add asset form */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline font-semibold text-navy mb-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-violet" />
            Přidat položku majetku
          </h3>
          <AddAssetForm employees={allEmployees.map((e) => ({ id: e.id, name: e.name }))} />
        </div>

        {/* Assets table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Všechen majetek ({allAssets.length} položek)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Položka</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Typ</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Stav</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Přiřazeno</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Od</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allAssets.map((asset) => {
                  const Icon = TYPE_ICONS[asset.type] || Package
                  const typeLabel = ASSET_TYPES.find((t) => t.value === asset.type)?.label || asset.type
                  const conditionLabel = ASSET_CONDITIONS.find((c) => c.value === asset.condition)?.label || asset.condition
                  const ownerName = getEmployeeName(asset.assignedTo)
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-alice rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-navy" />
                          </div>
                          <div>
                            <p className="font-medium text-navy">{asset.name}</p>
                            <p className="text-xs text-slate-400">{asset.brand} · {asset.model}</p>
                            {asset.serialNumber && (
                              <p className="text-xs text-slate-300">S/N: {asset.serialNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{typeLabel}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CONDITION_COLORS[asset.condition] || 'bg-slate-50 text-slate-600'}`}>
                          {conditionLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {ownerName ? (
                          <span className="font-medium text-navy">{ownerName}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">Skladem</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {asset.assignedAt ? formatDate(asset.assignedAt) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-employee view */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Majetek podle zaměstnanců</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {allEmployees.map((emp) => {
              const empAssets = allAssets.filter((a) => a.assignedTo === emp.id)
              return (
                <div key={emp.id} className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">{emp.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-navy">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.email} · {empAssets.length} položek</p>
                    </div>
                  </div>
                  {empAssets.length > 0 ? (
                    <div className="flex flex-wrap gap-2 ml-11">
                      {empAssets.map((a) => {
                        const Icon = TYPE_ICONS[a.type] || Package
                        return (
                          <div key={a.id} className="flex items-center gap-1.5 bg-alice px-3 py-1.5 rounded-lg text-xs text-navy">
                            <Icon className="w-3.5 h-3.5 text-violet" />
                            <span>{a.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 ml-11">Žádný přiřazený majetek</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
