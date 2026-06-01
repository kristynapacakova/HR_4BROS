'use client'

import { useMemo } from 'react'

interface Props {
  name: string
  position?: string
  department?: string
  tenure: string
  startDate: string
}

export function DashboardGreeting({ name, position, department, tenure, startDate }: Props) {
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 10) return 'Dobré ráno'
    if (h < 13) return 'Dobrý den'
    if (h < 18) return 'Dobré odpoledne'
    return 'Dobrý večer'
  }, [])

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-headline text-navy">
          {greeting}, {name}!
        </h1>
        {position && department && (
          <p className="text-sm text-slate-400 mt-0.5">{position} · {department}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">Ve firmě</p>
        <p className="text-sm font-medium text-navy">{tenure}</p>
      </div>
    </div>
  )
}
