'use client'

import { useEffect, useState } from 'react'
import type { ContractTemplate } from './mock-data'

/**
 * Šablony smluv nahrané / upravené HR. Vestavěné šablony (z kódu) jde upravit — uloží se pod stejným id;
 * vlastní šablony jde i smazat. Demo: localStorage. Ostrá verze: tabulka ContractTemplate (+ verze šablony u každé smlouvy).
 */
const KEY = 'fb-contract-templates'
export const CONTRACT_TEMPLATES_CHANGED_EVENT = 'fb-contract-templates-changed'
type Stored = Omit<ContractTemplate, 'createdAt'> & { createdAt: string }

function load(): Stored[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}
function write(list: Stored[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* noop */ }
  window.dispatchEvent(new Event(CONTRACT_TEMPLATES_CHANGED_EVENT))
}
const revive = (t: Stored): ContractTemplate => ({ ...t, createdAt: new Date(t.createdAt) })

export function saveContractTemplate(t: ContractTemplate) {
  const list = load().filter(x => x.id !== t.id)
  write([{ ...t, createdAt: t.createdAt.toISOString() }, ...list])
}
export function removeContractTemplate(id: string) {
  write(load().filter(x => x.id !== id))
}

/** Vestavěné šablony + uložené (uložená verze má přednost), vlastní nahoře. */
export function useContractTemplates(base: ContractTemplate[]): ContractTemplate[] {
  const [stored, setStored] = useState<ContractTemplate[]>([])
  useEffect(() => {
    const refresh = () => setStored(load().map(revive))
    refresh()
    window.addEventListener(CONTRACT_TEMPLATES_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(CONTRACT_TEMPLATES_CHANGED_EVENT, refresh)
  }, [])
  const byId = new Map(stored.map(t => [t.id, t]))
  const merged = base.map(t => byId.get(t.id) ?? t)
  const custom = stored.filter(t => !base.some(b => b.id === t.id))
  return [...custom, ...merged]
}
