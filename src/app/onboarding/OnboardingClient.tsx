'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Lock, AlertTriangle, PartyPopper } from 'lucide-react'
import { OnboardingGuide } from './OnboardingGuide'

// Sdílené úložiště s HR průvodcem (/admin/pruvodce) — otevírá se ručně
// tlačítkem "Spustit offboarding" v HR průvodci, ne až po dokončení checklistu.
const GUIDE_STORAGE_KEY = 'fb-hr-pruvodce'

function loadHrOffboardingStarted(): boolean {
  try {
    const raw = localStorage.getItem(GUIDE_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { offboarding?: { started?: boolean } }
    return parsed.offboarding?.started ?? false
  } catch {
    return false
  }
}

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  completedAt: Date | null
  order: number
}

const STORAGE_KEY = 'fb-onboarding-progress'

interface StoredProgress {
  // task id -> ISO date string it was checked off
  [taskId: string]: string
}

function loadProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredProgress) : {}
  } catch {
    return {}
  }
}

function TaskList({ tasks, progress, onToggle }: {
  tasks: Task[]
  progress: StoredProgress
  onToggle: (taskId: string) => void
}) {
  const isDone = (t: Task) => t.completed || !!progress[t.id]
  const doneAt = (t: Task) => progress[t.id] ?? (t.completedAt ? t.completedAt.toISOString() : null)

  const completed = tasks.filter(isDone).length
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
  const allDone = pct === 100

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-semibold text-navy">Tvůj postup</h2>
          <span className="text-lg font-bold text-violet">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-violet'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-slate-500">Splněno {completed} z {tasks.length} úkolů</p>
        {allDone && (
          <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
            <PartyPopper className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Skvělá práce — máš vše hotovo!</p>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-headline font-semibold text-navy">Úkoly</h3>
        </div>
        <ul className="divide-y divide-slate-50">
          {tasks.map((task) => {
            const done = isDone(task)
            const at = doneAt(task)
            return (
              <li key={task.id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
                <button
                  onClick={() => onToggle(task.id)}
                  className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                  aria-label={done ? 'Označit jako nehotové' : 'Označit jako hotové'}
                >
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : <Circle className="w-5 h-5 text-slate-300 hover:text-violet transition-colors" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'line-through text-slate-400' : 'text-navy'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                  {done && at && (
                    <p className="text-xs text-green-500 mt-1">
                      Splněno {new Date(at).toLocaleDateString('cs-CZ')}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
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
  const [progress, setProgress] = useState<StoredProgress>({})
  const [hydrated, setHydrated] = useState(false)
  const [hrOffStarted, setHrOffStarted] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
    setHrOffStarted(loadHrOffboardingStarted())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) } catch { /* noop */ }
    }
  }, [progress, hydrated])

  const toggle = (taskId: string) => {
    setProgress(prev => {
      const next = { ...prev }
      if (next[taskId]) delete next[taskId]
      else next[taskId] = new Date().toISOString()
      return next
    })
  }

  const offboardingDone = offboardingTasks.filter(t => t.completed || !!progress[t.id]).length
  const offboardingPct = offboardingTasks.length > 0 ? Math.round((offboardingDone / offboardingTasks.length) * 100) : 0

  // Otevřeno, jakmile HR ručně klikne na „Spustit offboarding" ve svém
  // průvodci (nebo pokud je ručně odemknuto adminem přes mock data).
  // HR (admin) si vlastní onboarding/offboarding nezamyká sám sobě — vidí
  // rovnou plný obsah (náhled i kontrola toho, co uvidí nový/odcházející člen).
  const isOffboardingUnlocked = isAdmin || offboardingUnlocked || hrOffStarted

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-navy px-7 py-8">
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.30), transparent 70%)', filter: 'blur(48px)' }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-violet-light text-xs font-semibold uppercase tracking-[0.15em] mb-2">
              {tab === 'onboarding' ? 'Vítej na palubě' : 'Offboarding'}
            </p>
            <h1 className="font-headline text-2xl font-semibold text-white">
              {tab === 'onboarding' ? 'Rozjeď to s námi' : 'Předání a rozloučení'}
            </h1>
          </div>
          {tab === 'offboarding' && isOffboardingUnlocked && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10 text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Hotovo</p>
              <p className="text-white font-headline text-lg leading-tight">{offboardingPct}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-50 rounded-2xl p-1.5">
        <button
          onClick={() => setTab('onboarding')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
            tab === 'onboarding' ? 'bg-white text-violet shadow-sm' : 'text-slate-500 hover:text-navy'
          }`}
        >
          Onboarding
        </button>
        <button
          onClick={() => isOffboardingUnlocked && setTab('offboarding')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            tab === 'offboarding'
              ? 'bg-white text-violet shadow-sm'
              : isOffboardingUnlocked
                ? 'text-slate-500 hover:text-navy'
                : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          {!isOffboardingUnlocked && <Lock className="w-3.5 h-3.5" />}
          Offboarding
        </button>
      </div>

      {tab === 'onboarding' && <OnboardingGuide isAdmin={isAdmin} />}
      {tab === 'offboarding' && (
        isOffboardingUnlocked ? <TaskList tasks={offboardingTasks} progress={progress} onToggle={toggle} /> : <OffboardingLocked />
      )}
    </div>
  )
}
