'use client'

import { Eye, Download } from 'lucide-react'
import { useReceiptFiles, openReceipt, downloadReceipt } from '@/lib/receipt-file-client'

/** Název přiloženého dokladu + Otevřít / Stáhnout (pro HR při schvalování). */
export function ReceiptLink({ requestId, fileName }: { requestId: string; fileName: string }) {
  const files = useReceiptFiles()
  const f = files[requestId]
  if (!f) {
    return <span title="Soubor se v demu u starších dokladů neukládal">{fileName}</span>
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={() => openReceipt(f)} className="inline-flex items-center gap-1 text-violet hover:underline font-medium" title="Otevřít doklad">
        <Eye className="w-3.5 h-3.5" /> {f.fileName}
      </button>
      <button type="button" onClick={() => downloadReceipt(f)} className="inline-flex items-center gap-1 text-navy/60 hover:text-navy" title="Stáhnout doklad">
        <Download className="w-3.5 h-3.5" /> Stáhnout
      </button>
    </span>
  )
}
