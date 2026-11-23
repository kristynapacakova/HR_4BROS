'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { CreateEmployeeForm } from './CreateEmployeeForm'

/** Header row of the users list: title + gold pill „+ Přidat uživatele“ that expands an inline create form. */
export function EmployeesListHeader({ count }: { count: number }) {
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 3500)
    return () => clearTimeout(t)
  }, [flash])

  return (
    <>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-headline text-navy" style={{ fontWeight: 600 }}>Přehled uživatelů ({count})</h3>
          {flash && (
            <span className="text-xs font-medium text-mint-dark bg-mint-tint px-2 py-0.5">
              ✓ Uživatel vytvořen · demo, změny se neukládají
            </span>
          )}
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-pill bg-gold hover:bg-navy hover:text-white text-navy text-[12px] font-bold uppercase tracking-[0.06em] py-2 px-4 transition-colors"
          >
            + Přidat uživatele
          </button>
        )}
      </div>

      {open && (
        <div className="bg-alice border-b border-[rgba(13,33,79,0.14)] border-l-4 border-l-gold px-6 py-5 animate-rise">
          <div className="flex items-center justify-between mb-4">
            <p className="kicker">Nový uživatel</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-navy"
              aria-label="Zavřít formulář"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <CreateEmployeeForm
            onCancel={() => setOpen(false)}
            onCreated={() => { setOpen(false); setFlash(true) }}
          />
        </div>
      )}
    </>
  )
}
