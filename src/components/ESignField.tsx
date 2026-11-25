'use client'

import { useState } from 'react'
import { CheckCircle2, PenLine } from 'lucide-react'
import { getESignProvider, type ESignResult } from '@/lib/esign'

const fmtDateTime = (d: Date) => new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))

/**
 * Podpisové pole DocuSeal — jedno pro směrnice i smlouvy. Dnes simulace (src/lib/esign.ts),
 * po napojení se tu otevře embedded podpis DocuSeal (<DocusealForm>).
 */
export function ESignField({ documentId, documentTitle, documentHtml, signer, what = 'dokument', done, onSigned }: {
  documentId: string
  documentTitle: string
  documentHtml: string
  signer: { name: string; email: string }
  /** „směrnici“, „smlouvu“ … (4. pád) */
  what?: string
  done?: { signedAt: Date; submissionId?: string; documentHash?: string } | null
  onSigned: (r: ESignResult) => void
}) {
  const [state, setState] = useState<'idle' | 'signing'>('idle')
  const sign = async () => {
    setState('signing')
    const r = await getESignProvider().sign({ documentId, documentTitle, documentHtml, signer })
    onSigned(r)
  }
  if (done) {
    return (
      <div className="border border-mint bg-mint/15 p-4 flex items-start gap-3">
        <span className="w-9 h-9 bg-mint flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-5 h-5 text-navy" /></span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-navy">Podepsáno elektronicky · DocuSeal</p>
          <p className="text-navy/70">{signer.name} · {fmtDateTime(done.signedAt)}</p>
          {done.submissionId && <p className="text-[11px] text-navy/50 mt-1 break-all">Podpis č. {done.submissionId}{done.documentHash ? ` · otisk ${done.documentHash.slice(0, 16)}…` : ''}</p>}
        </div>
      </div>
    )
  }
  return (
    <div className="border-2 border-dashed border-navy/25 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[220px]">
          <p className="kicker text-navy/55 mb-1">Podpisové pole</p>
          <p className="text-sm text-navy">Tuhle {what} je potřeba <b>podepsat elektronicky</b>.</p>
          <p className="text-xs text-navy/55 mt-0.5">Podepisuje: {signer.name}{signer.email ? ` · ${signer.email}` : ''}</p>
        </div>
        <button type="button" onClick={sign} disabled={state === 'signing'}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-violet disabled:opacity-70 transition-colors">
          <PenLine className="w-4 h-4" />
          {state === 'signing' ? 'Otevírám DocuSeal…' : 'Podepsat přes DocuSeal'}
        </button>
      </div>
      <p className="text-[11px] text-navy/45 mt-3">Demo — podpis je zatím simulovaný. Po napojení se otevře podpis DocuSeal přímo tady.</p>
    </div>
  )
}
