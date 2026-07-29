'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Lock, AlertTriangle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  completedAt: Date | null
  order: number
}

function TaskList({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-semibold text-navy">Průběh</h2>
          <span className="text-lg font-bold text-violet">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
          <div
            className="bg-violet h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-slate-500">Splněno {completed} z {tasks.length} úkolů</p>
        {progress === 100 && (
          <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Všechny úkoly jsou splněny.</p>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-headline font-semibold text-navy">Úkoly</h3>
        </div>
        <ul className="divide-y divide-slate-50">
          {tasks.map((task) => (
            <li key={task.id} className="px-6 py-4 flex items-start gap-4">
              <div className="mt-0.5 flex-shrink-0">
                {task.completed
                  ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                  : <Circle className="w-5 h-5 text-slate-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-navy'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                {task.completed && task.completedAt && (
                  <p className="text-xs text-green-500 mt-1">
                    Splněno {new Date(task.completedAt).toLocaleDateString('cs-CZ')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function OffboardingLocked() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
        <Lock className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-headline font-semibold text-navy text-lg mb-2">Offboarding je zamknutý</h3>
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
        Tato sekce bude odemknuta HR nebo administrátorem v okamžiku, kdy dojde k ukončení spolupráce.
        Pokud se domníváš, že by měla být přístupná, kontaktuj HR.
      </p>
      <div className="mt-6 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 text-sm text-amber-700">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Přístup uděluje HR nebo administrátor
      </div>
    </div>
  )
}

export function OnboardingClient({
  onboardingTasks,
  offboardingTasks,
  offboardingUnlocked,
  isAdmin,
}: {
  onboardingTasks: Task[]
  offboardingTasks: Task[]
  offboardingUnlocked: boolean
  isAdmin: boolean
}) {
  const [tab, setTab] = useState<'onboarding' | 'offboarding'>('onboarding')

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1">
        <button
          onClick={() => setTab('onboarding')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'onboarding' ? 'bg-violet text-white shadow-sm' : 'text-slate-500 hover:text-navy'
          }`}
        >
          Onboarding
        </button>
        <button
          onClick={() => offboardingUnlocked && setTab('offboarding')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
            tab === 'offboarding'
              ? 'bg-violet text-white shadow-sm'
              : offboardingUnlocked
                ? 'text-slate-500 hover:text-navy'
                : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          {!offboardingUnlocked && <Lock className="w-3.5 h-3.5" />}
          Offboarding
        </button>
      </div>

      {tab === 'onboarding' && <TaskList tasks={onboardingTasks} />}
      {tab === 'offboarding' && (
        offboardingUnlocked ? <TaskList tasks={offboardingTasks} /> : <OffboardingLocked />
      )}
    </div>
  )
}
