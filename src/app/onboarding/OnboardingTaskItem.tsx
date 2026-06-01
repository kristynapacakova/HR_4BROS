'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string | null
  completed: boolean
  completedAt?: Date | null
}

export function OnboardingTaskItem({ task }: { task: Task }) {
  const [localCompleted, setLocalCompleted] = useState(task.completed)
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    // Demo: just toggle locally and show notice
    await new Promise((r) => setTimeout(r, 300))
    setLocalCompleted((v) => !v)
    setShowDemo(true)
    setTimeout(() => setShowDemo(false), 2000)
    setLoading(false)
  }

  return (
    <li className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
      <button
        onClick={toggle}
        disabled={loading}
        className="mt-0.5 flex-shrink-0 disabled:opacity-50 transition-transform hover:scale-110"
      >
        {localCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6 text-slate-300 hover:text-violet transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${localCompleted ? 'text-slate-400 line-through' : 'text-navy'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
        )}
        {localCompleted && task.completedAt && (
          <p className="text-xs text-green-500 mt-1">Splněno {formatDate(task.completedAt)}</p>
        )}
        {showDemo && (
          <p className="text-xs text-amber-600 mt-1">Demo verze — změny se neukládají</p>
        )}
      </div>
    </li>
  )
}
