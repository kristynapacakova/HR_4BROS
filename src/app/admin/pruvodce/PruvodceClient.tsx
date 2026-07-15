'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Circle, ChevronLeft, ChevronRight, PartyPopper,
  ClipboardList, RotateCcw, UserPlus, UserMinus, ArrowRight,
} from 'lucide-react'
import { ONBOARDING_PHASES, OFFBOARDING_PHASES, type GuidePhase } from './guide-data'

type Mode = 'onboarding' | 'offboarding'

const STORAGE_KEY = 'fb-hr-pruvodce'

interface StoredState {
  onboarding: { checked: string[]; name: string }
  offboarding: { checked: string[]; name: string }
}

const EMPTY: StoredState = {
  onboarding: { checked: [], name: '' },
  offboarding: { checked: [], name: '' },
}

function load(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<StoredState>
    return {
      onboarding: { checked: parsed.onboarding?.checked ?? [], name: parsed.onboarding?.name ?? '' },
      offboarding: { checked: parsed.offboarding?.checked ?? [], name: parsed.offboarding?.name ?? '' },
    }
  } catch {
    return EMPTY
  }
}

export function PruvodceClient() {
  const [mode, setMode] = useState<Mode>('onboarding')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [state, setState] = useState<StoredState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(load())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const phases: GuidePhase[] = mode === 'onboarding' ? ONBOARDING_PHASES : OFFBOARDING_PHASES
  const checked = new Set(state[mode].checked)
  const memberName = state[mode].name

  const allSteps = useMemo(() => phases.flatMap(p => p.steps), [phases])
  const doneCount = allSteps.filter(s => checked.has(s.id)).length
  const totalCount = allSteps.length
  const pct = Math.round((doneCount / totalCount) * 100)
  const allDone = doneCount === totalCount

  const phase = phases[Math.min(phaseIdx, phases.length - 1)]
  const phaseDone = (p: GuidePhase) => p.steps.every(s => checked.has(s.id))

  const toggleStep = (id: string) => {
    setState(prev => {
      const cur = new Set(prev[mode].checked)
      if (cur.has(id)) cur.delete(id)
      else cur.add(id)
      return { ...prev, [mode]: { ...prev[mode], checked: Array.from(cur) } }
    })
  }

  const setName = (name: string) =>
    setState(prev => ({ ...prev, [mode]: { ...prev[mode], name } }))

  const reset = () => {
    if (!confirm(`Opravdu resetovat průběh ${mode === 'onboarding' ? 'onboardingu' : 'offboardingu'}? Hodí se pro dalšího člena týmu.`)) return
    setState(prev => ({ ...prev, [mode]: { checked: [], name: '' } }))
    setPhaseIdx(0)
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setPhaseIdx(0)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Mode switch + name + progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-slate-50 rounded-full border border-slate-100 p-1">
            <button
              onClick={() => switchMode('onboarding')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                mode === 'onboarding' ? 'bg-navy text-white shadow-sm' : 'text-slate-500 hover:text-navy'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Onboarding
            </button>
            <button
              onClick={() => switchMode('offboarding')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                mode === 'offboarding' ? 'bg-navy text-white shadow-sm' : 'text-slate-500 hover:text-navy'
              }`}
            >
              <UserMinus className="w-4 h-4" />
              Offboarding
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="input !w-56"
              placeholder={mode === 'onboarding' ? 'Jméno nového člena…' : 'Jméno odcházejícího člena…'}
              value={memberName}
              onChange={e => setName(e.target.value)}
            />
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-navy hover:bg-slate-50 transition-colors"
              title="Resetovat průběh pro dalšího člena"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-400">
              {memberName
                ? <>{mode === 'onboarding' ? 'Onboarding' : 'Offboarding'}: <span className="font-semibold text-navy">{memberName}</span></>
                : 'Celkový průběh'}
            </p>
            <p className={`text-xs font-bold ${allDone ? 'text-green-600' : 'text-violet'}`}>{doneCount}/{totalCount} · {pct}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-violet'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* All done celebration */}
      {allDone && (
        <div className="relative bg-navy rounded-2xl overflow-hidden">
          <div
            className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.35), transparent 70%)', filter: 'blur(40px)' }}
          />
          <div className="relative z-10 px-7 py-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-6 h-6 text-violet-light" />
              </div>
              <div>
                <p className="text-white font-headline font-semibold text-lg">
                  {mode === 'onboarding' ? 'Vše DONE! 🎉' : 'Offboarding dokončen ✓'}
                </p>
                <p className="text-white/60 text-sm mt-0.5">
                  {mode === 'onboarding'
                    ? `Všech ${totalCount} kroků je hotových. Teď můžeš předat zbytek onboardingu ${memberName || 'novému členovi'} formou checklistu.`
                    : `Všech ${totalCount} kroků je hotových. Spolupráce je řádně ukončena.`}
                </p>
              </div>
            </div>
            {mode === 'onboarding' && (
              <Link
                href="/profile?tab=onboarding"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-violet hover:bg-violet-dark transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                Předat checklist novému členovi
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">

        {/* Phase stepper */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 lg:sticky lg:top-20">
          {phases.map((p, i) => {
            const done = phaseDone(p)
            const active = i === phaseIdx
            const doneSteps = p.steps.filter(s => checked.has(s.id)).length
            return (
              <button
                key={p.id}
                onClick={() => setPhaseIdx(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-left transition-all ${
                  active ? 'text-white' : 'hover:bg-slate-50'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #194669, #2E5070)' } : undefined}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-white/15 text-white' : 'bg-violet/10 text-violet'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : `0${i + 1}`}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium truncate ${active ? 'text-white' : 'text-navy'}`}>{p.title}</span>
                  <span className={`block text-[11px] truncate ${active ? 'text-white/60' : 'text-slate-400'}`}>
                    {doneSteps}/{p.steps.length} hotovo
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Current phase detail */}
        <div className="space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet mb-1">{phase.timing}</p>
              <h2 className="text-2xl font-headline font-bold text-navy">{phase.title}</h2>
            </div>
            <p className="text-xs text-slate-400">Fáze {phaseIdx + 1} z {phases.length}</p>
          </div>

          {phase.steps.map(step => {
            const done = checked.has(step.id)
            return (
              <div
                key={step.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                  done ? 'border-green-200 bg-green-50/40' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                    aria-label={done ? 'Označit jako nehotové' : 'Označit jako hotové'}
                  >
                    {done
                      ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                      : <Circle className="w-6 h-6 text-slate-200 hover:text-violet transition-colors" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-headline font-semibold ${done ? 'text-green-800' : 'text-navy'}`}>{step.title}</p>
                    <p className={`text-sm mt-1 leading-relaxed ${done ? 'text-green-700/70' : 'text-slate-500'}`}>{step.desc}</p>
                    {step.items && (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {step.items.map(item => (
                          <li
                            key={item}
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              done ? 'bg-green-100/70 text-green-700' : 'bg-slate-50 text-slate-500'
                            }`}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Phase navigation */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setPhaseIdx(i => Math.max(0, i - 1))}
              disabled={phaseIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-slate-500 hover:text-navy hover:bg-white border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Předchozí fáze
            </button>
            {phaseIdx < phases.length - 1 ? (
              <button
                onClick={() => setPhaseIdx(i => Math.min(phases.length - 1, i + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-violet hover:bg-violet-dark transition-colors"
              >
                Další fáze
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <span className={`text-sm font-medium ${allDone ? 'text-green-600' : 'text-slate-400'}`}>
                {allDone ? 'Průvodce dokončen ✓' : 'Poslední fáze — zbývá dokončit kroky výše'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
