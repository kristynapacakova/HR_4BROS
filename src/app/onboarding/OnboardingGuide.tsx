'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2, Circle, ChevronDown, ChevronLeft, ChevronRight,
  Play, X, Lightbulb, PartyPopper, Users,
} from 'lucide-react'
import { ONBOARDING_PHASES, normItem, type GuidePhase, type GuideStep } from '@/app/admin/pruvodce/guide-data'

// Fáze, které si employee sám odškrtává — dřívější fáze (smlouvy, příprava
// místa, přístupy…) dělá HR ještě před nástupem, zobrazují se jen informačně.
const INTERACTIVE_PHASE_IDS = ['on-den1', 'on-zkusebka']

// Sdílí úložiště s HR průvodcem (/admin/pruvodce) — co si tu zaškrtneš,
// uvidí HR live ve svém přehledu, a naopak.
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

function itemIds(step: GuideStep): string[] {
  return step.items ? step.items.map((_, i) => `${step.id}::${i}`) : [step.id]
}

export function OnboardingGuide() {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [state, setState] = useState<StoredState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [walkthrough, setWalkthrough] = useState<{ step: GuideStep; idx: number } | null>(null)

  useEffect(() => {
    const loaded = load()
    setState(loaded)
    setHydrated(true)
    // Naskoč rovnou na první fázi, kterou má employee ještě rozdělanou
    const checkedSet = new Set(loaded.onboarding.checked)
    const firstUndone = ONBOARDING_PHASES.findIndex(p =>
      INTERACTIVE_PHASE_IDS.includes(p.id) && !p.steps.every(s => itemIds(s).every(id => checkedSet.has(id)))
    )
    if (firstUndone !== -1) setPhaseIdx(firstUndone)
    else setPhaseIdx(ONBOARDING_PHASES.findIndex(p => p.id === 'on-den1'))
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const checked = new Set(state.onboarding.checked)

  const isStepDone = (s: GuideStep) => itemIds(s).every(id => checked.has(id))
  const isInteractive = (p: GuidePhase) => INTERACTIVE_PHASE_IDS.includes(p.id)
  const phaseDone = (p: GuidePhase) => (isInteractive(p) ? p.steps.every(isStepDone) : true) // HR fáze = automaticky hotové

  const interactiveUnits = ONBOARDING_PHASES.filter(isInteractive).flatMap(p => p.steps.flatMap(itemIds))
  const doneCount = interactiveUnits.filter(id => checked.has(id)).length
  const totalCount = interactiveUnits.length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const allDone = doneCount === totalCount

  const phase = ONBOARDING_PHASES[Math.min(phaseIdx, ONBOARDING_PHASES.length - 1)]
  const interactive = isInteractive(phase)

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

  const toggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  if (!hydrated) return null

  return (
    <div className="space-y-5">

      {/* Progress — jen to, co má employee sám na starosti */}
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
        <p className="text-sm text-slate-500">Splněno {doneCount} z {totalCount} bodů, které máš na starosti ty</p>
      </div>

      {allDone && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
          <PartyPopper className="w-6 h-6 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-700">Skvělá práce — máš zaškolení hotové! HR to uvidí i ve svém přehledu.</p>
        </div>
      )}

      {/* Celá cesta — všech 7 fází, ať víš, kde přesně jsi a co tě ještě čeká */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Tvoje cesta onboardingem</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ONBOARDING_PHASES.map((p, i) => {
            const done = phaseDone(p)
            const active = i === phaseIdx
            const hr = !isInteractive(p)
            return (
              <button
                key={p.id}
                onClick={() => setPhaseIdx(i)}
                className={`flex-shrink-0 w-[168px] text-left rounded-2xl border p-3.5 transition-all ${
                  active ? 'border-violet bg-violet/5' : done ? 'border-green-100 bg-green-50/40' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                      done ? 'bg-green-500 text-white' : active ? 'bg-violet text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  {hr && <Users className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                </div>
                <p className={`text-sm font-semibold leading-snug ${active ? 'text-violet' : 'text-navy'}`}>{p.title}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{p.timing}</p>
              </button>
            )
          })}
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
          <Users className="w-3 h-3" />
          Fáze s touto ikonou má na starosti HR — u těch nemusíš nic dělat, jen víš, co se zrovna děje.
        </p>
      </div>

      {/* Detail vybrané fáze */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet">{phase.timing}</p>
          {!interactive && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Users className="w-3.5 h-3.5" />
              Zajišťuje HR
            </span>
          )}
        </div>

        {!interactive && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <p className="text-xs text-amber-700 leading-relaxed">
              Tuhle fázi má na starosti HR, ty tu nic zaškrtávat nemusíš — je tu jen pro přehled, co se aktuálně děje.
            </p>
          </div>
        )}

        {phase.steps.map(step => {
          const done = isStepDone(step)
          const hasItems = !!step.items?.length
          const stepItemDone = hasItems ? itemIds(step).filter(id => checked.has(id)).length : 0
          const isOpen = expanded[step.id] ?? false

          if (!interactive) {
            return (
              <div key={step.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="font-headline font-semibold text-navy">{step.title}</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                {hasItems && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {step.items!.map((rawItem, i) => {
                      const item = normItem(rawItem)
                      return (
                        <li key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">
                          {item.text}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          }

          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border shadow-sm transition-all ${
                done ? 'border-green-200 bg-green-50/40' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start gap-3.5 p-5">
                <button
                  onClick={() => toggleStep(step)}
                  className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
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
                      title="Spustit průvodce krok za krokem"
                    >
                      <Play className="w-3 h-3" />
                      <span className="hidden sm:inline">Krok za krokem</span>
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
            Předchozí
          </button>
          {phaseIdx < ONBOARDING_PHASES.length - 1 ? (
            <button
              onClick={() => setPhaseIdx(i => Math.min(ONBOARDING_PHASES.length - 1, i + 1))}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-violet hover:bg-violet-dark transition-colors"
            >
              Další fáze
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-sm font-medium text-slate-400">Poslední fáze</span>
          )}
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
