'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2, Circle, ChevronLeft, X, Lightbulb, PartyPopper, Lock, AlertTriangle,
  Mail, CalendarDays, KeyRound, MessageSquare, ListChecks, Clock3, Building2, Package, Wallet, Target,
} from 'lucide-react'
import { ONBOARDING_PHASES, normItem, type GuideStep } from '@/app/admin/pruvodce/guide-data'

// Jen to, co si employee sám nastavuje — HR agenda (smlouvy, příprava před
// nástupem…) sem záměrně nepatří, to řeší HR mimo tuhle appku.
const SETUP_STEP_IDS = ['on-predani', 'on-gmail', 'on-kalendar', 'on-1password', 'on-slack', 'on-asana-costlocker', 'on-dochazka', 'on-settleup', 'on-prostory']
const GOALS_STEP_IDS = ['on-cile', 'on-11', 'on-feedback']

const setupSteps = ONBOARDING_PHASES.flatMap(p => p.steps).filter(s => SETUP_STEP_IDS.includes(s.id))
const goalSteps = ONBOARDING_PHASES.flatMap(p => p.steps).filter(s => GOALS_STEP_IDS.includes(s.id))

const STEP_ICONS: Record<string, typeof Mail> = {
  'on-predani': Package,
  'on-gmail': Mail,
  'on-kalendar': CalendarDays,
  'on-1password': KeyRound,
  'on-slack': MessageSquare,
  'on-asana-costlocker': ListChecks,
  'on-dochazka': Clock3,
  'on-settleup': Wallet,
  'on-prostory': Building2,
  'on-cile': Target,
  'on-11': CalendarDays,
  'on-feedback': MessageSquare,
}

// Sdílí úložiště s HR průvodcem (/admin/pruvodce) — co si tu zaškrtneš,
// uvidí HR live ve svém přehledu, a naopak. Otevírá se ručně tlačítkem
// "Spustit onboarding" v HR průvodci — nečeká se, až HR odškrtá úplně vše
// (kdyby byla např. na dovolené, spustit to může kdokoliv jiný z týmu).
const STORAGE_KEY = 'fb-hr-pruvodce'

interface StoredState {
  onboarding: { checked: string[]; name: string; started: boolean }
  offboarding: { checked: string[]; name: string; started: boolean }
}

const EMPTY: StoredState = {
  onboarding: { checked: [], name: '', started: false },
  offboarding: { checked: [], name: '', started: false },
}

function load(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<{ onboarding: Partial<StoredState['onboarding']>; offboarding: Partial<StoredState['offboarding']> }>
    return {
      onboarding: { checked: parsed.onboarding?.checked ?? [], name: parsed.onboarding?.name ?? '', started: parsed.onboarding?.started ?? false },
      offboarding: { checked: parsed.offboarding?.checked ?? [], name: parsed.offboarding?.name ?? '', started: parsed.offboarding?.started ?? false },
    }
  } catch {
    return EMPTY
  }
}

function itemIds(step: GuideStep): string[] {
  return step.items ? step.items.map((_, i) => `${step.id}::${i}`) : [step.id]
}

export function OnboardingGuide({ isAdmin = false }: { isAdmin?: boolean }) {
  const [section, setSection] = useState<'setup' | 'goals'>('setup')
  const [state, setState] = useState<StoredState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const [openStepId, setOpenStepId] = useState<string | null>(null)
  const [walkthrough, setWalkthrough] = useState<{ step: GuideStep; idx: number } | null>(null)

  useEffect(() => {
    setState(load())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const checked = new Set(state.onboarding.checked)
  const isStepDone = (s: GuideStep) => itemIds(s).every(id => checked.has(id))

  // HR (admin) si to nezamyká sám sobě — vidí rovnou plný obsah pro náhled/kontrolu.
  const started = isAdmin || state.onboarding.started

  const allUnits = [...setupSteps, ...goalSteps].flatMap(itemIds)
  const doneCount = allUnits.filter(id => checked.has(id)).length
  const totalCount = allUnits.length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const allDone = doneCount === totalCount

  const setupDone = setupSteps.filter(isStepDone).length
  const goalsDone = goalSteps.filter(isStepDone).length

  const applyChecked = (mutate: (cur: Set<string>) => void) => {
    setState(prev => {
      const cur = new Set(prev.onboarding.checked)
      mutate(cur)
      return { ...prev, onboarding: { ...prev.onboarding, checked: Array.from(cur) } }
    })
  }

  const toggleStep = (step: GuideStep) => {
    const ids = itemIds(step)
    const done = ids.every(id => checked.has(id))
    applyChecked(cur => ids.forEach(id => (done ? cur.delete(id) : cur.add(id))))
  }

  const toggleItem = (id: string) =>
    applyChecked(cur => (cur.has(id) ? cur.delete(id) : cur.add(id)))

  if (!hydrated) return null

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-headline font-semibold text-navy text-lg mb-2">Ještě chvilku strpení</h3>
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
          HR ti teď připravuje nástup — jakmile ti onboarding spustí, otevře se ti tenhle průvodce
          a budeš si moct sám nastavit všechny přístupy.
        </p>
        <div className="mt-6 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 text-sm text-amber-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Ozvi se HR, ať ti to spustí
        </div>
      </div>
    )
  }

  const activeSteps = section === 'setup' ? setupSteps : goalSteps

  return (
    <div className="space-y-5">

      {isAdmin && !state.onboarding.started && (
        <div className="flex items-center gap-2.5 bg-violet/5 border border-violet/15 rounded-2xl px-4 py-3">
          <Lock className="w-4 h-4 text-violet flex-shrink-0" />
          <p className="text-xs text-violet">
            Náhled pro HR — nový člen tohle ještě nevidí, dokud nezmáčkneš „Spustit onboarding" v průvodci.
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-semibold text-navy">Tvůj postup</h2>
          <span className={`text-lg font-bold ${allDone ? 'text-green-600' : 'text-violet'}`}>{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-violet'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-slate-500">Splněno {doneCount} z {totalCount} bodů</p>
      </div>

      {allDone && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
          <PartyPopper className="w-6 h-6 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-700">Skvělá práce — máš vše nastavené a hotové!</p>
        </div>
      )}

      {/* Section switch */}
      <div className="flex gap-1.5 bg-slate-50 rounded-2xl p-1.5">
        <button
          onClick={() => setSection('setup')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            section === 'setup' ? 'bg-white text-violet shadow-sm' : 'text-slate-500 hover:text-navy'
          }`}
        >
          Nastavení přístupů
          <span className="text-xs text-slate-400">{setupDone}/{setupSteps.length}</span>
        </button>
        <button
          onClick={() => setSection('goals')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            section === 'goals' ? 'bg-white text-violet shadow-sm' : 'text-slate-500 hover:text-navy'
          }`}
        >
          Zkušební doba
          <span className="text-xs text-slate-400">{goalsDone}/{goalSteps.length}</span>
        </button>
      </div>

      {/* Tool cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {activeSteps.map(step => {
          const Icon = STEP_ICONS[step.id] ?? Circle
          const done = isStepDone(step)
          const hasItems = !!step.items?.length
          const stepItemDone = hasItems ? itemIds(step).filter(id => checked.has(id)).length : 0
          return (
            <button
              key={step.id}
              onClick={() => setOpenStepId(step.id)}
              className={`relative flex flex-col items-center text-center gap-2 rounded-2xl border p-5 transition-all ${
                done ? 'border-green-200 bg-green-50/40' : 'border-slate-100 bg-white hover:border-violet/30 hover:shadow-sm'
              }`}
            >
              {done && (
                <span className="absolute top-2.5 right-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </span>
              )}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${done ? 'bg-green-100' : 'bg-violet/10'}`}>
                <Icon className={`w-5 h-5 ${done ? 'text-green-600' : 'text-violet'}`} />
              </div>
              <p className={`text-sm font-medium leading-snug ${done ? 'text-green-800' : 'text-navy'}`}>{step.title}</p>
              {hasItems && (
                <span className={`text-[11px] font-semibold ${done ? 'text-green-600' : 'text-slate-400'}`}>
                  {stepItemDone}/{step.items!.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Step detail sheet */}
      {openStepId && (() => {
        const step = activeSteps.find(s => s.id === openStepId)
        if (!step) return null
        const done = isStepDone(step)
        const hasItems = !!step.items?.length
        const Icon = STEP_ICONS[step.id] ?? Circle
        return (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(14,35,55,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-violet/10'}`}>
                    <Icon className={`w-5 h-5 ${done ? 'text-green-600' : 'text-violet'}`} />
                  </div>
                  <div>
                    <h3 className="font-headline font-semibold text-navy text-lg">{step.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
                <button onClick={() => setOpenStepId(null)} className="p-2 rounded-full text-slate-300 hover:text-navy hover:bg-slate-50 transition-colors flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-4">
                {hasItems ? (
                  <ul className="space-y-1.5">
                    {step.items!.map((rawItem, i) => {
                      const item = normItem(rawItem)
                      const id = `${step.id}::${i}`
                      const itemDone = checked.has(id)
                      return (
                        <li key={id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleItem(id)}
                            className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                              itemDone ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-navy hover:bg-slate-100'
                            }`}
                          >
                            {itemDone
                              ? <CheckCircle2 className="w-[18px] h-[18px] text-green-500 flex-shrink-0" />
                              : <Circle className="w-[18px] h-[18px] text-slate-300 flex-shrink-0" />}
                            <span className={itemDone ? 'line-through decoration-green-300' : ''}>{item.text}</span>
                          </button>
                          {item.how && (
                            <button
                              onClick={() => setWalkthrough({ step, idx: i })}
                              className="flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-semibold text-violet bg-violet/10 hover:bg-violet hover:text-white transition-colors"
                            >
                              Ukaž jak
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <button
                    onClick={() => { toggleStep(step); setOpenStepId(null) }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      done ? 'bg-green-50 text-green-700' : 'bg-violet text-white hover:bg-violet-dark'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {done ? 'Hotovo — odškrtnuto' : 'Označit jako hotové'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

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
        const doneAndNext = () => {
          if (!itemDone) toggleItem(id)
          goNext()
        }

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(14,35,55,0.85)', backdropFilter: 'blur(6px)' }}>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div
                className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.12), transparent 70%)', filter: 'blur(30px)' }}
              />

              <div className="relative flex items-center justify-between px-7 pt-6 pb-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Bod {idx + 1} z {items.length}</p>
                </div>
                <button onClick={closeWt} className="p-2 rounded-full text-slate-300 hover:text-navy hover:bg-slate-50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                    onClick={doneAndNext}
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
