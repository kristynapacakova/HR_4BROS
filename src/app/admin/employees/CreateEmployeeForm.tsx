'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateEmployeeForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Demo: simulate creation
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setSuccess(true)
    setForm({ name: '', email: '', department: '', position: '', startDate: '' })
    setTimeout(() => setSuccess(false), 3000)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-700 font-medium">✓ Zaměstnanec byl vytvořen!</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'name', label: 'Jméno a příjmení', placeholder: 'Jan Novák', required: true },
          { key: 'email', label: 'Firemní e-mail', placeholder: 'jan.novak@fourbros.cz', type: 'email', required: true },
          { key: 'department', label: 'Oddělení', placeholder: 'Vývoj' },
          { key: 'position', label: 'Pozice', placeholder: 'Developer' },
          { key: 'startDate', label: 'Datum nástupu', type: 'date' },
        ].map(({ key, label, placeholder, type = 'text', required }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
            <input
              type={type}
              value={(form as Record<string, string>)[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              required={required}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-violet hover:bg-violet-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
      >
        {loading ? 'Vytváří se...' : 'Vytvořit zaměstnance'}
      </button>
    </form>
  )
}
