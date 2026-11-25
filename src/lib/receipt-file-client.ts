'use client'

import { useEffect, useState } from 'react'

/**
 * Soubory k dokladům k proplacení a k žádostem o příspěvek na sport (účtenky, faktury).
 *
 * Dnes: v prohlížeči (localStorage `fb-receipt-files`), menší soubory i s obsahem jako data URL.
 * Po napojení: soubor do úložiště souborů (Document, kind = RECEIPT, vazba na ExpenseRequest / SportRequest),
 * HR ho otevře přes zabezpečený odkaz. Viz docs/predani/03-odmeny.md.
 */
export interface ReceiptFile {
  fileName: string
  type: string
  size: number
  uploadedAt: string
  dataUrl?: string
}

const KEY = 'fb-receipt-files'
export const RECEIPT_FILES_CHANGED_EVENT = 'fb-receipt-files-changed'
const MAX_INLINE_BYTES = 1_200_000

export function loadReceiptFiles(): Record<string, ReceiptFile> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

function write(map: Record<string, ReceiptFile>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    const slim = Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { ...v, dataUrl: undefined }]))
    try { localStorage.setItem(KEY, JSON.stringify(slim)) } catch { /* noop */ }
  }
  window.dispatchEvent(new Event(RECEIPT_FILES_CHANGED_EVENT))
}

/** Uloží soubor k dokladu (id dokladu / žádosti). */
export async function saveReceiptFile(requestId: string, file: File) {
  let dataUrl: string | undefined
  if (file.size <= MAX_INLINE_BYTES) {
    dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = () => rej(r.error)
      r.readAsDataURL(file)
    })
  }
  write({ ...loadReceiptFiles(), [requestId]: { fileName: file.name, type: file.type, size: file.size, uploadedAt: new Date().toISOString(), dataUrl } })
}

export function removeReceiptFile(requestId: string) {
  const map = loadReceiptFiles()
  delete map[requestId]
  write(map)
}

export function useReceiptFiles() {
  const [files, setFiles] = useState<Record<string, ReceiptFile>>({})
  useEffect(() => {
    const refresh = () => setFiles(loadReceiptFiles())
    refresh()
    window.addEventListener(RECEIPT_FILES_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(RECEIPT_FILES_CHANGED_EVENT, refresh)
  }, [])
  return files
}

/** Otevře soubor v nové záložce (obrázek / PDF). */
export function openReceipt(f: ReceiptFile) {
  if (!f.dataUrl) { alert('V demu se tenhle soubor neuložil (je moc velký). Po napojení úložiště půjde otevřít.'); return }
  const w = window.open()
  if (!w) return
  if (f.type.startsWith('image/')) w.document.write(`<title>${f.fileName}</title><img src="${f.dataUrl}" style="max-width:100%">`)
  else w.document.write(`<title>${f.fileName}</title><iframe src="${f.dataUrl}" style="border:0;width:100%;height:100vh"></iframe>`)
}

/** Stáhne soubor. */
export function downloadReceipt(f: ReceiptFile) {
  if (!f.dataUrl) { alert('V demu se tenhle soubor neuložil (je moc velký). Po napojení úložiště půjde stáhnout.'); return }
  const a = document.createElement('a')
  a.href = f.dataUrl
  a.download = f.fileName
  a.click()
}
