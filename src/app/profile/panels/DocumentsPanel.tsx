import { FileText, Download, FileCheck, Clock } from 'lucide-react'
import { DEMO_DOCUMENTS, DEMO_CONTRACTS, CONTRACT_TEMPLATES, DEMO_TEAM } from '@/lib/mock-data'
import { PayslipYearPicker } from '@/app/documents/PayslipYearPicker'
import { MyContracts } from './MyContracts'
import { DocumentsSigningClient } from '@/app/documents/DocumentsSigningClient'

const TAG_LABEL: Record<string, string> = {
  SMLOUVA: 'Smlouva',
  DODATEK: 'Dodatek',
  GDPR: 'GDPR',
}

const TAG_ORDER = ['SMLOUVA', 'DODATEK', 'GDPR']

type Doc = typeof DEMO_DOCUMENTS[number]

function ContractRow({ doc }: { doc: Doc & { pendingSigner?: string } }) {
  const label = TAG_LABEL[doc.tag ?? ''] ?? doc.tag ?? '—'
  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
      <div className="p-2.5 rounded-full flex-shrink-0 bg-alice text-navy">
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-navy truncate">{doc.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-slate-300">·</span>
          {doc.signedAt
            ? <span className="text-xs text-green-600 flex items-center gap-1 font-medium"><FileCheck className="w-3 h-3" />Podepsáno</span>
            : <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                {doc.pendingSigner ? `Čeká na podpis — ${doc.pendingSigner}` : 'Čeká na podpis'}
              </span>
          }
        </div>
      </div>
      <button className="flex-shrink-0 p-2 text-slate-300 hover:text-navy rounded-full transition-colors" title="Stáhnout (demo)">
        <Download className="w-4 h-4" />
      </button>
    </div>
  )
}

export function DocumentsPanel({ isHPP, personId }: { isHPP: boolean; personId?: string }) {
  const contracts = DEMO_DOCUMENTS
    .filter(d => d.type === 'CONTRACT')
    .sort((a, b) => TAG_ORDER.indexOf(a.tag ?? '') - TAG_ORDER.indexOf(b.tag ?? ''))

  const payslips = DEMO_DOCUMENTS
    .filter(d => d.type === 'PAYSLIP')
    .sort((a, b) => {
      const ad = a as typeof a & { month?: number; year?: number }
      const bd = b as typeof b & { month?: number; year?: number }
      if ((bd.year ?? 0) !== (ad.year ?? 0)) return (bd.year ?? 0) - (ad.year ?? 0)
      return (bd.month ?? 0) - (ad.month ?? 0)
    })

  const payslipsByYear = payslips.reduce<Record<number, typeof payslips>>((acc, p) => {
    const y = (p as typeof p & { year?: number }).year ?? 0
    if (!acc[y]) acc[y] = []
    acc[y].push(p)
    return acc
  }, {})

  const payslipYears = Object.keys(payslipsByYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="space-y-6">

      {/* Smlouvy čekající na podpis zaměstnance */}
      <DocumentsSigningClient
        // jen smlouvy daného člověka (ukázkové smlouvy pro „Ukázkového zaměstnance“ se nikomu neukazují)
        contracts={DEMO_CONTRACTS.filter(c => (c.status === 'PENDING_EMPLOYEE' || c.status === 'SIGNED') && c.employeeName === DEMO_TEAM.find(m => m.id === personId)?.name)}
        templates={CONTRACT_TEMPLATES}
        personId={personId}
      />

      {/* Moje smlouvy — nahrané HR k tomuto člověku */}
      <MyContracts personId={personId} />

      {/* Výplatní pásky — only HPP */}
      {isHPP && (
        <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Výplatní pásky</h3>
            <p className="text-xs text-slate-400 mt-0.5">{payslips.length} dokumentů</p>
          </div>
          <PayslipYearPicker
            payslipsByYear={payslipsByYear as Record<number, { id: string; name: string; month?: number; year?: number }[]>}
            years={payslipYears}
          />
        </div>
      )}

    </div>
  )
}
