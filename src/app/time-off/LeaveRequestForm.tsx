'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LeaveRequestForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Demo: simulate submission
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setSuccess(true)
    setForm({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' })
    setTimeout(() => setSuccess(false), 3000)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-700 font-medium">Žádost byla odeslána!</p>
        <p className="text-sm text-amber-600 mt-1">Demo verze — změny se neukládají.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Typ dovolené</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          >
            <option value="ANNUAL">Řádná dovolená</option>
            <option value="SICK">Nemocenská</option>
            <option value="PERSONAL">Osobní volno</option>
            <option value="UNPAID">Neplacené volno</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Důvod (nepovinné)</label>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            placeholder="Např. letní dovolená"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Od</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Do</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            required
            min={form.startDate}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-violet hover:bg-violet-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
      >
        {loading ? 'Odesílám...' : 'Odeslat žádost'}
      </button>
    </form>
  )
}
