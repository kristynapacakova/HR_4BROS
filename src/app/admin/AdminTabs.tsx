'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconTeam, IconChart, IconLaptop } from '@/components/BrandIcons'

const TABS = [
  { id: 'analytika', label: 'Analytika', icon: IconChart },
  { id: 'uzivatele', label: 'Uživatelé', icon: IconTeam },
  { id: 'majetek', label: 'Majetek', icon: IconLaptop },
] as const

type TabId = typeof TABS[number]['id']

export function AdminTabs({ panels, header }: { panels: Record<TabId, React.ReactNode>; header?: React.ReactNode }) {
  const searchParams = useSearchParams()
  const requested = searchParams.get('tab')
  const initial = TABS.some(t => t.id === requested) ? (requested as TabId) : 'analytika'
  const [tab, setTab] = useState<TabId>(initial)

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 mb-6">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                active ? 'bg-white text-violet shadow-sm' : 'text-slate-500 hover:text-navy'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-violet' : 'text-slate-400'}`} />
              {t.label}
            </button>
          )
        })}
      </div>

      {header && <div className="mb-6">{header}</div>}

      {panels[tab]}
    </div>
  )
}
