'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

export function LeaveActionButtons({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [note, setNote] = useState('')

  const handle = async (action: 'approve' | 'reject') => {
    setLoading(action)
    await fetch(`/api/admin/leave-requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    })
    setLoading(null)
    router.refresh()
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
