'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OnboardingTask } from '@prisma/client'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'

export function OnboardingTaskItem({ task }: { task: OnboardingTask }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    await fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, completed: !task.completed }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <li className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
      <button
        onClick={toggle}
        disabled={loading}
        className="mt-0.5 flex-shrink-0 disabled:opacity-50 transition-transform hover:scale-110"
      >
        {task.completed ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6 text-slate-300 hover:text-violet transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-navy'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
        )}
        {task.completed && task.completedAt && (
          <p className="text-xs text-green-500 mt-1">Splněno {formatDate(task.completedAt)}</p>
        )}
      </div>
    </li>
  )
}
