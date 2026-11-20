'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { UserCog, ChevronDown } from 'lucide-react'

const DEMO_ROLES = [
  { email: 'admin@fourbros.cz', label: 'Admin & HR' },
  { email: 'eva.horakova@fourbros.cz', label: 'Team Lead' },
  { email: 'jan.novak@fourbros.cz', label: 'Zaměstnanec' },
  { email: 'tomas.dvorak@fourbros.cz', label: 'OSVČ' },
]

export function RoleSwitcher({ currentEmail }: { currentEmail?: string | null }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const switchTo = async (email: string) => {
    setLoading(true)
    await signIn('credentials', { email, callbackUrl: pathname || '/dashboard' })
  }

  const current = DEMO_ROLES.find(r => r.email.toLowerCase() === currentEmail?.toLowerCase())

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Přepnout demo roli — bez odhlašování"
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 hover:text-navy hover:bg-slate-100 transition-all duration-150"
      >
        <UserCog className="w-4 h-4" />
        {current?.label ?? 'Přepnout roli'}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 z-40">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Demo — přepnout roli</p>
          {DEMO_ROLES.map((r) => {
            const active = r.email.toLowerCase() === currentEmail?.toLowerCase()
            return (
              <button
                key={r.email}
                onClick={() => !active && switchTo(r.email)}
                disabled={loading}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  active ? 'text-violet font-medium bg-violet/5' : 'text-slate-600 hover:bg-slate-50 hover:text-navy'
                } disabled:opacity-50`}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
