'use client'

import { Contract, ContractStatus, ContractTemplate } from '@/lib/mock-data'
import { printContract } from '@/lib/print-contract'
import { X, CheckCircle2, Clock, User, Building2, Download, Pen } from 'lucide-react'

const STATUS_LABEL: Record<ContractStatus, string> = {
  DRAFT: 'Návrh',
  PENDING_MANAGEMENT: 'Čeká na vedení',
  PENDING_EMPLOYEE: 'Čeká na zaměstnance',
  SIGNED: 'Podepsáno',
}

const STATUS_COLOR: Record<ContractStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_MANAGEMENT: 'bg-amber-50 text-amber-700',
  PENDING_EMPLOYEE: 'bg-blue-50 text-blue-700',
  SIGNED: 'bg-green-50 text-green-700',
}

function fillPlaceholders(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
}

interface Props {
  contract: Contract
  template: ContractTemplate | undefined
  onClose: () => void
  onSign: (id: string) => void
}

export function ContractDetailModal({ contract, template, onClose, onSign }: Props) {
  const filledBody = fillPlaceholders(template?.body ?? '', contract.values)

  const timeline = [
    { label: 'Vytvořeno', date: contract.createdAt, done: true, icon: Building2 },
    { label: 'Odesláno vedení', date: contract.sentToManagementAt, done: !!contract.sentToManagementAt, icon: Building2 },
    {
      label: contract.managementSignedBy ? `Podepsáno vedením (${contract.managementSignedBy})` : 'Podpis vedení',
      date: contract.managementSignedAt,
      done: !!contract.managementSignedAt,
      icon: Pen,
    },
    { label: 'Odesláno zaměstnanci', date: contract.sentToEmployeeAt, done: !!contract.sentToEmployeeAt, icon: User },
    { label: 'Podepsáno zaměstnancem', date: contract.employeeSignedAt, done: !!contract.employeeSignedAt, icon: CheckCircle2 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-headline text-navy text-lg">{contract.templateName}</h2>
            <p className="text-sm text-slate-500">{contract.employeeName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[contract.status]}`}>
              {STATUS_LABEL[contract.status]}
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-navy rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Timeline */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Průběh podpisu</h3>
            <div className="flex gap-3 flex-wrap">
              {timeline.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${step.done ? 'text-navy' : 'text-slate-400'}`}>{step.label}</p>
                      {step.date && (
                        <p className="text-[10px] text-slate-400">{new Date(step.date).toLocaleDateString('cs-CZ')}</p>
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <span className="text-slate-200 mx-1 text-xs">→</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contract body */}
          <div
            className="px-6 py-5 prose prose-sm max-w-none text-navy"
            dangerouslySetInnerHTML={{ __html: filledBody }}
          />
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          {contract.status === 'PENDING_MANAGEMENT' && (
            <button
              onClick={() => { onSign(contract.id); onClose() }}
              className="flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <Pen className="w-4 h-4" />
              Podepsat jako vedení
            </button>
          )}
          {contract.status === 'SIGNED' && (
            <button
              onClick={() => printContract(contract, template)}
              className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Stáhnout PDF
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  )
}
