'use client'

import { useState } from 'react'
import { Contract, ContractTemplate } from '@/lib/mock-data'
import { Pen, X, CheckCircle2, FileText, Download } from 'lucide-react'

function fillPlaceholders(body: string, values: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? `{{${k}}}`)
}

function SignModal({ contract, template, onSign, onClose }: {
  contract: Contract
  template: ContractTemplate | undefined
  onSign: () => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const filled = fillPlaceholders(template?.body ?? '', contract.values)
  const canSign = name.trim().toLowerCase() === contract.employeeName.toLowerCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-headline text-navy text-lg">{contract.templateName}</h2>
            <p className="text-sm text-slate-500">Přečtěte si smlouvu a potvrďte podpisem</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-navy rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 prose prose-sm max-w-none text-navy"
          dangerouslySetInnerHTML={{ __html: filled }}
        />

        {/* Signature area */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 space-y-3">
          <p className="text-sm font-medium text-navy">Elektronický podpis</p>
          <p className="text-xs text-slate-500">Pro potvrzení podpisu napište své celé jméno: <strong>{contract.employeeName}</strong></p>
          <input
            className="input"
            placeholder="Napište své jméno..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={() => { onSign(); onClose() }}
              disabled={!canSign}
              className="flex items-center gap-2 px-5 py-2 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Pen className="w-4 h-4" />
              Podepsat smlouvu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DocumentsSigningClient({ contracts, templates }: {
  contracts: Contract[]
  templates: ContractTemplate[]
}) {
  const [list, setList] = useState(contracts)
  const [signing, setSigning] = useState<Contract | null>(null)

  const pending = list.filter(c => c.status === 'PENDING_EMPLOYEE')
  const signed = list.filter(c => c.status === 'SIGNED')

  function doSign(id: string) {
    setList(prev => prev.map(c => c.id === id
      ? { ...c, status: 'SIGNED' as const, employeeSignedAt: new Date() }
      : c
    ))
  }

  if (pending.length === 0 && signed.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
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
        {/* Pending */}
        {pending.map(c => (
          <div key={c.id} className="px-6 py-4 flex items-center gap-4 bg-violet/5">
            <div className="w-10 h-10 bg-violet/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Pen className="w-5 h-5 text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy">{c.templateName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Podepsáno vedením {c.managementSignedAt ? `(${new Date(c.managementSignedAt).toLocaleDateString('cs-CZ')})` : ''} · Čeká na váš podpis
              </p>
            </div>
            <button
              onClick={() => setSigning(c)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <Pen className="w-3.5 h-3.5" />
              Podepsat
            </button>
          </div>
        ))}

        {/* Signed */}
        {signed.map(c => (
          <div key={c.id} className="px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy">{c.templateName}</p>
              <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Podepsáno {c.employeeSignedAt ? new Date(c.employeeSignedAt).toLocaleDateString('cs-CZ') : ''}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex-shrink-0 p-2 text-slate-300 hover:text-navy rounded-lg transition-colors"
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
          onSign={() => doSign(signing.id)}
          onClose={() => setSigning(null)}
        />
      )}
    </div>
  )
}
