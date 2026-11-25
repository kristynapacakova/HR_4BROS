'use client'

import { useState, useMemo } from 'react'
import { Contract, ContractTemplate, DEMO_TEAM } from '@/lib/mock-data'
import { ESignField } from '@/components/ESignField'
import type { ESignResult } from '@/lib/esign'
import { flowDocModel, printFlowContract } from '@/lib/print-contract'
import { useFlowContracts, signAsEmployee } from '@/lib/contract-flow-client'
import { useContractTemplates } from '@/lib/contract-template-client'
import { ContractDocPreview } from '@/components/ContractDocPreview'
import { X, FileText, Download, ShieldCheck, BadgeCheck } from 'lucide-react'

/** Přečíst smlouvu a podepsat přes DocuSeal (stejné podpisové pole jako u směrnic). */
function SignModal({ contract, template, onSign, onClose }: {
  contract: Contract
  template: ContractTemplate | undefined
  onSign: (r: ESignResult) => void
  onClose: () => void
}) {
  const docModel = useMemo(() => flowDocModel(contract, template ? [template] : []), [contract, template])
  const person = DEMO_TEAM.find(m => m.name === contract.employeeName)
  const [done, setDone] = useState<ESignResult | null>(null)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
      <div className="bg-white border border-navy w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[rgba(13,33,79,0.14)]">
          <div className="min-w-0">
            <p className="font-headline text-navy text-[17px] truncate" style={{ fontWeight: 600 }}>{contract.templateName}</p>
            <p className="text-xs text-navy/55">Přečti si smlouvu a dole ji podepiš</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => printFlowContract(contract, template ? [template] : [])} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-navy border border-navy/30 hover:border-navy"><Download className="w-3.5 h-3.5" />Stáhnout PDF</button>
            <button onClick={onClose} aria-label="Zavřít" className="p-1 text-navy/60 hover:text-navy"><X className="w-6 h-6" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#ebe8f6]">
          <ContractDocPreview model={docModel} />
        </div>
        <div className="px-5 py-4 border-t border-[rgba(13,33,79,0.14)] bg-white space-y-3">
          <ESignField
            documentId={contract.id}
            documentTitle={contract.templateName}
            documentHtml={JSON.stringify(docModel)}
            signer={{ name: contract.employeeName, email: person?.email ?? '' }}
            what="smlouvu"
            done={done ? { signedAt: done.signedAt, submissionId: done.submissionId, documentHash: done.documentHash } : null}
            onSigned={r => { setDone(r); onSign(r) }}
          />
          {done && <div className="flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-navy text-white text-sm font-semibold hover:bg-violet">Hotovo</button></div>}
        </div>
      </div>
    </div>
  )
}

export function DocumentsSigningClient({ contracts = [], templates: baseTemplates, personId }: {
  contracts?: Contract[]
  templates: ContractTemplate[]
  /** uživatel — smlouvy, které mu HR vytvořila a jednatel podepsal */
  personId?: string
}) {
  const templates = useContractTemplates(baseTemplates)
  const flow = useFlowContracts()
  const [local, setLocal] = useState(contracts)
  // jen čekající — podepsané jsou níž v Moje smlouvy (PDF ke stažení)
  const mine = personId ? flow.filter(c => c.personId === personId && c.status === 'PENDING_EMPLOYEE') : []
  const list: Contract[] = [...mine, ...local]
  const [signing, setSigning] = useState<Contract | null>(null)

  const pending = list.filter(c => c.status === 'PENDING_EMPLOYEE')
  const signed = list.filter(c => c.status === 'SIGNED')

  function doSign(id: string, r: ESignResult) {
    const f = mine.find(c => c.id === id)
    if (f) { signAsEmployee(f, r); return }
    setLocal(prev => prev.map(c => c.id === id ? { ...c, status: 'SIGNED' as const, employeeSignedAt: new Date() } : c))
  }

  if (pending.length === 0 && signed.length === 0) return null

  return (
    <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <FileText className="w-4 h-4 text-violet" />
        <h3 className="font-headline font-semibold text-navy">Smlouvy k podpisu</h3>
        {pending.length > 0 && (
          <span className="ml-auto text-xs bg-violet/10 text-violet px-2 py-0.5 rounded-full font-medium">
            {pending.length} čeká
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-50">
        {pending.map(c => (
          <div key={c.id} className="px-6 py-4 flex items-center gap-4 bg-violet/5">
            <div className="w-10 h-10 bg-violet/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy">{c.templateName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Podepsáno jednatelem {c.managementSignedAt ? `(${new Date(c.managementSignedAt).toLocaleDateString('cs-CZ')})` : ''} · Čeká na tvůj podpis
              </p>
            </div>
            <button
              onClick={() => setSigning(c)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-violet text-white text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Podepsat
            </button>
          </div>
        ))}

        {signed.map(c => (
          <div key={c.id} className="px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy">{c.templateName}</p>
              <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Podepsáno elektronicky (DocuSeal) · {c.employeeSignedAt ? new Date(c.employeeSignedAt).toLocaleDateString('cs-CZ') : ''}
              </p>
            </div>
            <button
              onClick={() => printFlowContract(c, templates)}
              className="flex-shrink-0 p-2 text-slate-300 hover:text-navy transition-colors"
              title="Stáhnout PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {signing && (
        <SignModal
          contract={signing}
          template={templates.find(t => t.id === signing.templateId)}
          onSign={(r) => doSign(signing.id, r)}
          onClose={() => setSigning(null)}
        />
      )}
    </div>
  )
}
