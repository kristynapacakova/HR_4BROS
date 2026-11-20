'use client'

import { DEMO_ASSETS, ASSET_TYPES } from './mock-data'

export interface AssetRecord {
  id: string
  name: string
  type: string
  brand: string
  model: string
  serialNumber: string | null
  assignedTo: string | null
  assignedAt: string | null
  condition: string
  notes: string | null
}

const KEY = 'fb-assets'
export const ASSET_CHANGED_EVENT = 'fb-assets-changed'

function seed(): AssetRecord[] {
  return DEMO_ASSETS.map(a => ({
    ...a,
    assignedAt: a.assignedAt ? new Date(a.assignedAt).toISOString() : null,
  }))
}

export function loadAssets(): AssetRecord[] {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
    const initial = seed()
    localStorage.setItem(KEY, JSON.stringify(initial))
    return initial
  } catch {
    return seed()
  }
}

function persist(list: AssetRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(ASSET_CHANGED_EVENT))
  } catch { /* noop */ }
}

export function saveAssets(list: AssetRecord[]) {
  persist(list)
}

export function addAsset(input: Omit<AssetRecord, 'id' | 'assignedAt'>): AssetRecord {
  const list = loadAssets()
  const record: AssetRecord = {
    ...input,
    id: `a-${Date.now()}`,
    assignedAt: input.assignedTo ? new Date().toISOString() : null,
  }
  persist([...list, record])
  return record
}

export function updateAsset(id: string, patch: Partial<AssetRecord>) {
  const list = loadAssets()
  const next = list.map(a => {
    if (a.id !== id) return a
    const updated = { ...a, ...patch }
    // Pokud se mění přiřazení, obnov datum přiřazení (nebo ho smaž, pokud jde zpět na sklad).
    if ('assignedTo' in patch && patch.assignedTo !== a.assignedTo) {
      updated.assignedAt = patch.assignedTo ? new Date().toISOString() : null
    }
    return updated
  })
  persist(next)
}

export function deleteAsset(id: string) {
  persist(loadAssets().filter(a => a.id !== id))
}

export function assetTypeLabel(type: string) {
  return ASSET_TYPES.find(t => t.value === type)?.label || type
}
