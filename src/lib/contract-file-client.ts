'use client'

import { useEffect, useState } from 'react'

/**
 * Smlouvy nahrané HR (naskenované / podepsané mimo portál) — přiřazené ke konkrétnímu člověku.
 *
 * Dnes: v prohlížeči (localStorage `fb-contract-files`), menší PDF i s obsahem (data URL).
 * Po napojení: tabulka Contract (+ Document se souborem v úložišti), vazba personId, stav podpisu.
 * Viz docs/predani/04-smlouvy-smernice-dokumenty.md.
 */
export type StoredContractStatus = 'SIGNED' | 'UNSIGNED'

export interface StoredContract {
  id: string
  personId: string
  /** název smlouvy, např. „Pracovní smlouva“, „Dodatek č. 1 — změna mzdy“ */
  name: string
  /** HPP / DPP / DPČ / IČO / Dodatek / NDA / GDPR / Jiné */
  type: string
  status: StoredContractStatus
  /** kdy byla podepsaná (YYYY-MM-DD) */
  signedAt: string | null
  notes: string
  uploadedAt: string
  fileName: string
  fileType: string
  size: number
  dataUrl?: string
}

export const CONTRACT_DOC_TYPES = ['HPP', 'DPP', 'DPČ', 'IČO', 'Dodatek', 'NDA', 'GDPR', 'Jiné'] as const

const KEY = 'fb-contract-files'
export const CONTRACT_FILES_CHANGED_EVENT = 'fb-contract-files-changed'
const MAX_INLINE_BYTES = 1_200_000

export function loadStoredContracts(): StoredContract[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function write(list: StoredContract[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    try { localStorage.setItem(KEY, JSON.stringify(list.map(c => ({ ...c, dataUrl: undefined })))) } catch { /* noop */ }
  }
  window.dispatchEvent(new Event(CONTRACT_FILES_CHANGED_EVENT))
}

export async function addStoredContract(input: Omit<StoredContract, 'id' | 'uploadedAt' | 'fileName' | 'fileType' | 'size' | 'dataUrl'>, file: File) {
  let dataUrl: string | undefined
  if (file.size <= MAX_INLINE_BYTES) {
    dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = () => rej(r.error)
      r.readAsDataURL(file)
    })
  }
  const rec: StoredContract = {
    ...input,
    id: `sc-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
    fileName: file.name, fileType: file.type, size: file.size, dataUrl,
  }
  write([rec, ...loadStoredContracts()])
  return rec
}

export function updateStoredContract(id: string, patch: Partial<StoredContract>) {
  write(loadStoredContracts().map(c => (c.id === id ? { ...c, ...patch } : c)))
}

export function removeStoredContract(id: string) {
  write(loadStoredContracts().filter(c => c.id !== id))
}

export function useStoredContracts() {
  const [list, setList] = useState<StoredContract[]>([])
  useEffect(() => {
    const refresh = () => setList(loadStoredContracts())
    refresh()
    window.addEventListener(CONTRACT_FILES_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(CONTRACT_FILES_CHANGED_EVENT, refresh)
  }, [])
  return list
}

const missing = () => alert('V demu se tenhle soubor neuložil (je moc velký). Po napojení úložiště půjde otevřít.')

export function openStoredContract(c: StoredContract) {
  if (!c.dataUrl) return missing()
  const w = window.open()
  if (!w) return
  if (c.fileType.startsWith('image/')) w.document.write(`<title>${c.name}</title><img src="${c.dataUrl}" style="max-width:100%">`)
  else w.document.write(`<title>${c.name}</title><iframe src="${c.dataUrl}" style="border:0;width:100%;height:100vh"></iframe>`)
}

export function downloadStoredContract(c: StoredContract) {
  if (!c.dataUrl) return missing()
  const a = document.createElement('a')
  a.href = c.dataUrl
  a.download = c.fileName
  a.click()
}
