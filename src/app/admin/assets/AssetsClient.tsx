'use client'

import { useEffect, useState } from 'react'
import { ASSET_TYPES, ASSET_CONDITIONS } from '@/lib/mock-data'
import { loadAssets, updateAsset, deleteAsset, ASSET_CHANGED_EVENT, type AssetRecord } from '@/lib/asset-client'
import { formatDate } from '@/lib/utils'
import { Laptop, Smartphone, Mouse, Keyboard, Monitor, Zap, Headphones, Package, Pencil, Trash2, X } from 'lucide-react'
import { AddAssetForm } from './AddAssetForm'

const TYPE_ICONS: Record<string, React.ElementType> = {
  NOTEBOOK: Laptop, TELEFON: Smartphone, MYS: Mouse, KLAVESNICE: Keyboard,
  MONITOR: Monitor, NABIJEC: Zap, SLUCHATKA: Headphones, JINE: Package,
}

const CONDITION_COLORS: Record<string, string> = {
  NOVY: 'bg-mint-tint text-mint-dark',
  DOBRY: 'bg-alice text-navy',
  OPOTREBOVANY: 'bg-gold-tint text-gold-dark',
  POSKOZENY: 'bg-red-50 text-red-700',
}

interface Employee { id: string; name: string; email: string }

export function AssetsClient({ employees }: { employees: Employee[] }) {
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [editing, setEditing] = useState<AssetRecord | null>(null)
  const [filterUser, setFilterUser] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    const refresh = () => setAssets(loadAssets())
    refresh()
    window.addEventListener(ASSET_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(ASSET_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const getEmployeeName = (id: string | null) => id ? employees.find(e => e.id === id)?.name || 'Neznámý' : null
  const assigned = assets.filter(a => a.assignedTo !== null)
  const unassigned = assets.filter(a => a.assignedTo === null)

  const filteredAssets = assets.filter(a =>
    (filterUser === '' || (filterUser === 'SKLADEM' ? a.assignedTo === null : a.assignedTo === filterUser)) &&
    (filterType === '' || a.type === filterType)
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-4">
          <p className="text-2xl font-semibold text-navy">{assets.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Celkem položek</p>
        </div>
        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-4">
          <p className="text-2xl font-semibold text-navy">{assigned.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Přiřazeno</p>
        </div>
        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-4">
          <p className="text-2xl font-semibold text-navy">{unassigned.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Skladem</p>
        </div>
        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-4">
          <p className="text-2xl font-semibold text-navy">{employees.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Zaměstnanců</p>
        </div>
      </div>

      {/* Add asset form */}
      <div className="bg-white border border-[rgba(13,33,79,0.14)] p-6">
        <h3 className="font-headline font-semibold text-navy mb-4">Přidat položku majetku</h3>
        <AddAssetForm employees={employees.map(e => ({ id: e.id, name: e.name }))} />
      </div>

      {/* Assets table */}
      <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-headline font-semibold text-navy">Všechen majetek ({filteredAssets.length} z {assets.length})</h3>
          <div className="flex gap-2">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-1.5 border border-[rgba(13,33,79,0.14)] text-sm text-navy bg-white focus:outline-none focus:border-[#0D214F]"
            >
              <option value="">Všichni uživatelé</option>
              <option value="SKLADEM">Skladem (nepřiřazeno)</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-[rgba(13,33,79,0.14)] text-sm text-navy bg-white focus:outline-none focus:border-[#0D214F]"
            >
              <option value="">Všechny typy</option>
              {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy">
                <th className="text-left px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Položka</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Typ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Stav</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Přiřazeno</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Od</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssets.map((asset) => {
                const Icon = TYPE_ICONS[asset.type] || Package
                const typeLabel = ASSET_TYPES.find((t) => t.value === asset.type)?.label || asset.type
                const conditionLabel = ASSET_CONDITIONS.find((c) => c.value === asset.condition)?.label || asset.condition
                const ownerName = getEmployeeName(asset.assignedTo)
                return (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-alice flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-navy" />
                        </div>
                        <div>
                          <p className="font-medium text-navy">{asset.name}</p>
                          <p className="text-xs text-slate-400">{asset.brand} · {asset.model}</p>
                          {asset.serialNumber && <p className="text-xs text-slate-300">S/N: {asset.serialNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{typeLabel}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${CONDITION_COLORS[asset.condition] || 'bg-slate-50 text-slate-600'}`}>
                        {conditionLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ownerName ? <span className="font-medium text-navy">{ownerName}</span> : <span className="text-slate-400 text-xs">Skladem</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {asset.assignedAt ? formatDate(new Date(asset.assignedAt)) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setEditing(asset)} className="p-1.5 text-slate-400 hover:text-violet transition-colors" title="Upravit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Smazat položku „${asset.name}“?`)) deleteAsset(asset.id) }}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditAssetModal
          asset={editing}
          employees={employees}
          onClose={() => setEditing(null)}
          onSave={(patch) => { updateAsset(editing.id, patch); setEditing(null) }}
        />
      )}
    </div>
  )
}

function EditAssetModal({ asset, employees, onClose, onSave }: {
  asset: AssetRecord
  employees: Employee[]
  onClose: () => void
  onSave: (patch: Partial<AssetRecord>) => void
}) {
  const [form, setForm] = useState({
    name: asset.name, brand: asset.brand, model: asset.model,
    serialNumber: asset.serialNumber || '', condition: asset.condition,
    assignedTo: asset.assignedTo || '', notes: asset.notes || '',
  })
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-navy/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#0D214F] p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline font-semibold text-navy">Upravit položku</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Název"
            className="w-full px-3 py-2 border border-[rgba(13,33,79,0.14)] text-sm text-navy focus:outline-none focus:border-[#0D214F]" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="Výrobce"
              className="w-full px-3 py-2 border border-[rgba(13,33,79,0.14)] text-sm text-navy focus:outline-none focus:border-[#0D214F]" />
            <input value={form.model} onChange={e => update('model', e.target.value)} placeholder="Model"
              className="w-full px-3 py-2 border border-[rgba(13,33,79,0.14)] text-sm text-navy focus:outline-none focus:border-[#0D214F]" />
          </div>
          <input value={form.serialNumber} onChange={e => update('serialNumber', e.target.value)} placeholder="Sériové číslo"
            className="w-full px-3 py-2 border border-[rgba(13,33,79,0.14)] text-sm text-navy focus:outline-none focus:border-[#0D214F]" />
          <select value={form.condition} onChange={e => update('condition', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(13,33,79,0.14)] text-sm text-navy bg-white focus:outline-none focus:border-[#0D214F]">
            {ASSET_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={form.assignedTo} onChange={e => update('assignedTo', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(13,33,79,0.14)] text-sm text-navy bg-white focus:outline-none focus:border-[#0D214F]">
            <option value="">— Skladem (nepřiřazeno) —</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
          <input value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Poznámka"
            className="w-full px-3 py-2 border border-[rgba(13,33,79,0.14)] text-sm text-navy focus:outline-none focus:border-[#0D214F]" />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#0D214F] text-navy text-sm font-medium hover:bg-navy/5 transition-colors">Zrušit</button>
          <button
            onClick={() => onSave({
              name: form.name, brand: form.brand, model: form.model,
              serialNumber: form.serialNumber || null, condition: form.condition,
              assignedTo: form.assignedTo || null, notes: form.notes || null,
            })}
            className="flex-1 py-2.5 bg-gold hover:bg-gold-dark hover:text-white text-navy font-bold uppercase tracking-wide text-sm font-medium transition-colors"
          >
            Uložit
          </button>
        </div>
      </div>
    </div>
  )
}
