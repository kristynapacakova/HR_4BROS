'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Circle, ChevronLeft, ChevronRight, ChevronDown, PartyPopper,
  ClipboardList, RotateCcw, UserPlus, UserMinus, ArrowRight, Play, X, Lightbulb, Rocket, Lock,
} from 'lucide-react'
import { ONBOARDING_PHASES, OFFBOARDING_PHASES, normItem, type GuidePhase, type GuideStep } from './guide-data'

type Mode = 'onboarding' | 'offboarding'

const STORAGE_KEY = 'fb-hr-pruvodce'

interface ModeState { checked: string[]; name: string; started: boolean }
interface StoredState {
  onboarding: ModeState
  offboarding: ModeState
}

const EMPTY: StoredState = {
  onboarding: { checked: [], name: '', started: false },
  offboarding: { checked: [], name: '', started: false },
}

function load(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<{ onboarding: Partial<ModeState>; offboarding: Partial<ModeState> }>
    return {
      onboarding: { checked: parsed.onboarding?.checked ?? [], name: parsed.onboarding?.name ?? '', started: parsed.onboarding?.started ?? false },
      offboarding: { checked: parsed.offboarding?.checked ?? [], name: parsed.offboarding?.name ?? '', started: parsed.offboarding?.started ?? false },
    }
  } catch {
    return EMPTY
  }
}

// Every checkable unit: itemless steps count as one unit, steps with items
// count one unit per item — the step itself is derived (done = all items done).
function itemIds(step: GuideStep): string[] {
  return step.items ? step.items.map((_, i) => `${step.id}::${i}`) : [step.id]
}

export function PruvodceClient() {
  const [mode, setMode] = useState<Mode>('onboarding')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [state, setState] = useState<StoredState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [walkthrough, setWalkthrough] = useState<{ step: GuideStep; idx: number } | null>(null)

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
  const memberStarted = state[mode].started

  const isStepDone = (s: GuideStep) => itemIds(s).every(id => checked.has(id))

  const allUnits = phases.flatMap(p => p.steps.flatMap(itemIds))
  const doneCount = allUnits.filter(id => checked.has(id)).length
  const totalCount = allUnits.length
  const pct = Math.round((doneCount / totalCount) * 100)
  const allDone = doneCount === totalCount

  const phase = phases[Math.min(phaseIdx, phases.length - 1)]
  const phaseDone = (p: GuidePhase) => p.steps.every(isStepDone)

  const applyChecked = (mutate: (cur: Set<string>) => void) => {
    setState(prev => {
      const cur = new Set(prev[mode].checked)
      mutate(cur)
      return { ...prev, [mode]: { ...prev[mode], checked: Array.from(cur) } }
    })
  }

  // Step-level checkbox: checks/unchecks the whole step incl. all its items
  const toggleStep = (step: GuideStep) => {
    const ids = itemIds(step)
    const done = ids.every(id => checked.has(id))
    applyChecked(cur => ids.forEach(id => (done ? cur.delete(id) : cur.add(id))))
  }

  const toggleItem = (id: string) =>
    applyChecked(cur => (cur.has(id) ? cur.delete(id) : cur.add(id)))

  const toggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const setName = (name: string) =>
    setState(prev => ({ ...prev, [mode]: { ...prev[mode], name } }))

  const toggleStarted = () =>
    setState(prev => ({ ...prev, [mode]: { ...prev[mode], started: !prev[mode].started } }))

  const reset = () => {
    if (!confirm(`Opravdu resetovat průběh ${mode === 'onboarding' ? 'onboardingu' : 'offboardingu'}? Hodí se pro dalšího člena týmu.`)) return
    setState(prev => ({ ...prev, [mode]: { checked: [], name: '', started: false } }))
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
                mode === 'onboarding' ? 'bg-violet text-white shadow-sm' : 'text-slate-500 hover:text-navy'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Onboarding
            </button>
            <button
              onClick={() => switchMode('offboarding')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                mode === 'offboarding' ? 'bg-violet text-white shadow-sm' : 'text-slate-500 hover:text-navy'
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

        {/* Spustit / zastavit — kdokoliv z HR to může kdykoliv přepnout, není to vázané na dokončení checklistu */}
        <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${memberStarted ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          <div className="flex items-center gap-2.5">
            {memberStarted
              ? <Rocket className="w-4 h-4 text-green-600 flex-shrink-0" />
              : <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />}
            <p className={`text-xs ${memberStarted ? 'text-green-700' : 'text-amber-700'}`}>
              {memberStarted
                ? `${mode === 'onboarding' ? 'Onboarding' : 'Offboarding'} je pro ${memberName || 'nového člena'} otevřený — vidí ho ve své appce.`
                : `${mode === 'onboarding' ? 'Onboarding' : 'Offboarding'} ještě ${memberName || 'člen'} nevidí — dej vědět, až má začít.`}
            </p>
          </div>
          <button
            onClick={toggleStarted}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              memberStarted ? 'bg-white text-green-700 hover:bg-green-100' : 'bg-violet text-white hover:bg-violet-dark'
            }`}
          >
            {memberStarted ? 'Zavřít znovu' : `Spustit ${mode === 'onboarding' ? 'onboarding' : 'offboarding'}`}
          </button>
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
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-2xl border border-green-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-headline font-semibold text-navy">
                {mode === 'onboarding' ? 'Vše hotovo' : 'Offboarding dokončen'}
              </p>
              <p className="text-slate-500 text-sm mt-0.5">
                {mode === 'onboarding'
                  ? `Všech ${totalCount} bodů je hotových. Teď můžeš předat zbytek onboardingu ${memberName || 'novému členovi'} formou checklistu.`
                  : `Všech ${totalCount} bodů je hotových. Spolupráce je řádně ukončena.`}
              </p>
            </div>
          </div>
          {mode === 'onboarding' && (
            <Link
              href="/onboarding"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-violet hover:bg-violet-dark transition-colors flex-shrink-0"
            >
              <ClipboardList className="w-4 h-4" />
              Předat checklist novému členovi
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">

        {/* Phase stepper */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 lg:sticky lg:top-20">
          {phases.map((p, i) => {
            const done = phaseDone(p)
            const active = i === phaseIdx
            const doneSteps = p.steps.filter(isStepDone).length
            return (
              <button
                key={p.id}
                onClick={() => setPhaseIdx(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-left transition-all ${
                  active ? 'bg-violet/10' : 'hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-violet text-white' : 'bg-violet/10 text-violet'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : `0${i + 1}`}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium truncate ${active ? 'text-violet' : 'text-navy'}`}>{p.title}</span>
                  <span className="block text-[11px] truncate text-slate-400">
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
            const done = isStepDone(step)
            const hasItems = !!step.items?.length
            const stepItemDone = hasItems ? itemIds(step).filter(id => checked.has(id)).length : 0
            const isOpen = expanded[step.id] ?? false
            return (
              <div
                key={step.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  done ? 'border-green-200 bg-green-50/40' : 'border-slate-100'
                }`}
              >
                {/* Step header */}
                <div className="flex items-start gap-3.5 p-5">
                  <button
                    onClick={() => toggleStep(step)}
                    className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                    title={hasItems ? (done ? 'Odškrtnout celý krok' : 'Označit celý krok jako hotový') : undefined}
                    aria-label={done ? 'Označit jako nehotové' : 'Označit jako hotové'}
                  >
                    {done
                      ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                      : <Circle className="w-6 h-6 text-slate-200 hover:text-violet transition-colors" />}
                  </button>
                  <div
                    className={`flex-1 min-w-0 ${hasItems ? 'cursor-pointer select-none' : ''}`}
                    onClick={hasItems ? () => toggleExpand(step.id) : undefined}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-headline font-semibold ${done ? 'text-green-800' : 'text-navy'}`}>{step.title}</p>
                      {hasItems && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          done ? 'bg-green-100 text-green-700' : stepItemDone > 0 ? 'bg-violet/10 text-violet' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {stepItemDone}/{step.items!.length}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${done ? 'text-green-700/70' : 'text-slate-500'}`}>{step.desc}</p>
                  </div>
                  {hasItems && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <button
                        onClick={() => setWalkthrough({ step, idx: 0 })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-violet bg-violet/10 hover:bg-violet hover:text-white transition-colors"
                        title="Spustit grafického průvodce bod po bodu"
                      >
                        <Play className="w-3 h-3" />
                        <span className="hidden sm:inline">Projít krok za krokem</span>
                      </button>
                      <button
                        onClick={() => toggleExpand(step.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-navy hover:bg-slate-50 transition-all"
                        aria-label={isOpen ? 'Sbalit' : 'Rozbalit body'}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Expandable item checklist — for going point by point with the new hire */}
                {hasItems && isOpen && (
                  <div className={`px-5 pb-4 pt-1 ml-[38px] mr-2 border-t ${done ? 'border-green-100' : 'border-slate-50'}`}>
                    <ul className="pt-3 space-y-1">
                      {step.items!.map((rawItem, i) => {
                        const item = normItem(rawItem)
                        const id = `${step.id}::${i}`
                        const itemDone = checked.has(id)
                        return (
                          <li key={id}>
                            <button
                              onClick={() => toggleItem(id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                                itemDone ? 'text-green-700' : 'text-navy hover:bg-slate-50'
                              }`}
                            >
                              {itemDone
                                ? <CheckCircle2 className="w-[18px] h-[18px] text-green-500 flex-shrink-0" />
                                : <Circle className="w-[18px] h-[18px] text-slate-200 flex-shrink-0" />}
                              <span className={itemDone ? 'line-through decoration-green-300' : ''}>{item.text}</span>
                              {item.how && (
                                <span
                                  className="ml-auto flex-shrink-0 text-[10px] font-semibold text-violet bg-violet/10 px-2 py-0.5 rounded-full cursor-pointer hover:bg-violet hover:text-white transition-colors"
                                  onClick={e => { e.stopPropagation(); setWalkthrough({ step, idx: i }) }}
                                >
                                  návod
                                </span>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
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

      {/* ══ Grafický průvodce — jeden bod = jeden slide ══ */}
      {walkthrough && (() => {
        const { step, idx } = walkthrough
        const items = step.items!.map(normItem)
        const item = items[idx]
        const id = `${step.id}::${idx}`
        const itemDone = checked.has(id)
        const isLast = idx === items.length - 1

        const closeWt = () => setWalkthrough(null)
        const goNext = () => (isLast ? closeWt() : setWalkthrough({ step, idx: idx + 1 }))
        const donAndNext = () => {
          if (!itemDone) toggleItem(id)
          goNext()
        }

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(14,35,55,0.85)', backdropFilter: 'blur(6px)' }}>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
              {/* Glow decor */}
              <div
                className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.12), transparent 70%)', filter: 'blur(30px)' }}
              />

              {/* Header */}
              <div className="relative flex items-center justify-between px-7 pt-6 pb-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Bod {idx + 1} z {items.length}</p>
                </div>
                <button onClick={closeWt} className="p-2 rounded-full text-slate-300 hover:text-navy hover:bg-slate-50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slide body */}
              <div className="relative px-7 py-5 min-h-[320px]">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1 rounded-full opacity-30" style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)', filter: 'blur(8px)' }} />
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-headline font-bold text-xl" style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)' }}>
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-navy leading-snug">{item.text}</h3>
                </div>

                {item.how ? (
                  <ol className="space-y-2.5">
                    {item.how.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 bg-[#F7F8FE] rounded-2xl px-4 py-3">
                        <span className="w-6 h-6 rounded-full bg-white text-violet text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          {i + 1}
                        </span>
                        <span className="text-sm text-navy leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-500 leading-relaxed bg-[#F7F8FE] rounded-2xl px-4 py-3">
                    {step.desc}
                  </p>
                )}

                {item.hint && (
                  <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">{item.hint}</p>
                  </div>
                )}
              </div>

              {/* Footer: dots + nav */}
              <div className="relative px-7 py-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setWalkthrough(idx === 0 ? null : { step, idx: idx - 1 })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-slate-500 hover:text-navy hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {idx === 0 ? 'Zavřít' : 'Zpět'}
                </button>

                <div className="flex items-center gap-1.5">
                  {items.map((_, i) => {
                    const dotDone = checked.has(`${step.id}::${i}`)
                    return (
                      <button
                        key={i}
                        onClick={() => setWalkthrough({ step, idx: i })}
                        className={`rounded-full transition-all ${
                          i === idx ? 'w-6 h-2 bg-violet' : dotDone ? 'w-2 h-2 bg-green-400' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                        }`}
                        aria-label={`Bod ${i + 1}`}
                      />
                    )
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goNext}
                    className="px-4 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-navy transition-colors"
                  >
                    Přeskočit
                  </button>
                  <button
                    onClick={donAndNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-violet hover:bg-violet-dark transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isLast ? 'Hotovo — dokončit' : 'Hotovo — další bod'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
