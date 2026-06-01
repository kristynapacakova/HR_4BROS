'use client'

import { useState } from 'react'
import { ASSET_TYPES, ASSET_CONDITIONS } from '@/lib/mock-data'

interface Employee {
  id: string
  name: string
}

export function AddAssetForm({ employees }: { employees: Employee[] }) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    condition: 'NOVY',
    assignedTo: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    setLoading(false)
    setSuccess(true)
    setForm({ name: '', type: '', brand: '', model: '', serialNumber: '', condition: 'NOVY', assignedTo: '', notes: '' })
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Název <span className="text-red-400">*</span></label>
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            placeholder='např. MacBook Pro 14"'
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Typ <span className="text-red-400">*</span></label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent bg-white"
          >
            <option value="">— Vyberte typ —</option>
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Výrobce</label>
          <input
            value={form.brand}
            onChange={(e) => update('brand', e.target.value)}
            placeholder="Apple, Dell, Lenovo..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
          <input
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="MacBook Pro M3..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Sériové číslo</label>
          <input
            value={form.serialNumber}
            onChange={(e) => update('serialNumber', e.target.value)}
            placeholder="C02X1234..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Stav</label>
          <select
            value={form.condition}
            onChange={(e) => update('condition', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent bg-white"
          >
            {ASSET_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Přiřadit zaměstnanci</label>
          <select
            value={form.assignedTo}
            onChange={(e) => update('assignedTo', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent bg-white"
          >
            <option value="">— Skladem (nepřiřazeno) —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">Poznámka</label>
          <input
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Volitelná poznámka..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-violet hover:bg-violet-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-sm text-sm"
        >
          {loading ? 'Přidávám...' : 'Přidat položku'}
        </button>
        {success && <p className="text-amber-600 text-sm">Demo verze — změny se neukládají.</p>}
      </div>
    </form>
  )
}
