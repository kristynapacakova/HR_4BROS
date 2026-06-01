'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

export function LeaveActionButtons({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState<'approve' | 'reject' | null>(null)

  const handle = async (action: 'approve' | 'reject') => {
    setLoading(action)
    // Demo: simulate action
    await new Promise((r) => setTimeout(r, 500))
    setLoading(null)
    setDone(action)
    setTimeout(() => setDone(null), 2500)
  }

  if (done) {
    return (
      <p className="text-xs text-amber-600 flex-shrink-0">
        Demo verze — změny se neukládají
      </p>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={() => handle('approve')}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
      >
        <Check className="w-4 h-4" />
        {loading === 'approve' ? '...' : 'Schválit'}
      </button>
      <button
        onClick={() => handle('reject')}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
      >
        <X className="w-4 h-4" />
        {loading === 'reject' ? '...' : 'Zamítnout'}
      </button>
    </div>
  )
}
