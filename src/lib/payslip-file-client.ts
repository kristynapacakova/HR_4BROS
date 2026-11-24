'use client'

/**
 * Výplatní pásky nahrané HR (PDF) — pro HPP, DPP a DPČ.
 *
 * Dnes: v prohlížeči (localStorage `fb-payslip-files`); menší soubory i s obsahem jako data URL,
 * aby šly v demu stáhnout. Po napojení: PDF do úložiště souborů (Document, kind = PAYSLIP,
 * personId, month, year) a sem jen metadata z API. Viz docs/predani/03-odmeny.md.
 */
export interface PayslipFile {
  personId: string
  month: number
  year: number
  fileName: string
  size: number
  uploadedAt: string
  /** obsah PDF (jen v demu a jen u menších souborů) */
  dataUrl?: string
}

const KEY = 'fb-payslip-files'
export const PAYSLIP_FILES_CHANGED_EVENT = 'fb-payslip-files-changed'
/** do localStorage se vejde jen pár MB — větší PDF si v demu pamatujeme jen jménem */
const MAX_INLINE_BYTES = 1_200_000

export const payslipKey = (personId: string, month: number, year: number) => `${personId}-${year}-${month}`

export function loadPayslipFiles(): Record<string, PayslipFile> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

function write(map: Record<string, PayslipFile>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // plné úložiště — uložíme bez obsahu souborů
    const slim = Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { ...v, dataUrl: undefined }]))
    try { localStorage.setItem(KEY, JSON.stringify(slim)) } catch { /* noop */ }
  }
  window.dispatchEvent(new Event(PAYSLIP_FILES_CHANGED_EVENT))
}

export async function savePayslipFile(personId: string, month: number, year: number, file: File): Promise<PayslipFile> {
  let dataUrl: string | undefined
  if (file.size <= MAX_INLINE_BYTES) {
    dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = () => rej(r.error)
      r.readAsDataURL(file)
    })
  }
  const rec: PayslipFile = { personId, month, year, fileName: file.name, size: file.size, uploadedAt: new Date().toISOString(), dataUrl }
  write({ ...loadPayslipFiles(), [payslipKey(personId, month, year)]: rec })
  return rec
}

export function removePayslipFile(personId: string, month: number, year: number) {
  const map = loadPayslipFiles()
  delete map[payslipKey(personId, month, year)]
  write(map)
}

/** Otevře / stáhne nahranou pásku (v demu z data URL). */
export function openPayslipFile(f: PayslipFile) {
  if (!f.dataUrl) { alert('V demu se tenhle soubor neuložil (je moc velký). Po napojení úložiště půjde stáhnout.'); return }
  const a = document.createElement('a')
  a.href = f.dataUrl
  a.download = f.fileName
  a.click()
}
