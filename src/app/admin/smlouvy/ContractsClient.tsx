'use client'

import { useState } from 'react'
import { Contract, ContractTemplate, ContractStatus } from '@/lib/mock-data'
import { ContractDetailModal } from './ContractDetailModal'
import { FilePen, FileText, Clock, CheckCircle2, ChevronRight, Plus, Send, Pen } from 'lucide-react'

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

const TYPE_COLOR: Record<string, string> = {
  HPP: 'bg-green-50 text-green-700',
  DPP: 'bg-blue-50 text-blue-700',
  DPC: 'bg-sky-50 text-sky-700',
  ICO: 'bg-amber-50 text-amber-700',
  OBECNA: 'bg-slate-100 text-slate-600',
}

const FILTER_OPTIONS: { value: ContractStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Všechny' },
  { value: 'DRAFT', label: 'Návrh' },
  { value: 'PENDING_MANAGEMENT', label: 'Čeká na vedení' },
  { value: 'PENDING_EMPLOYEE', label: 'Čeká na zaměstnance' },
  { value: 'SIGNED', label: 'Podepsáno' },
]

export function ContractsClient({ templates, contracts: initialContracts }: {
  templates: ContractTemplate[]
  contracts: Contract[]
}) {
  const [tab, setTab] = useState<'sablony' | 'smlouvy'>('smlouvy')
  const [contracts, setContracts] = useState<Contract[]>(initialContracts)
  const [filter, setFilter] = useState<ContractStatus | 'ALL'>('ALL')
  const [selected, setSelected] = useState<Contract | null>(null)

  const filtered = filter === 'ALL' ? contracts : contracts.filter(c => c.status === filter)

  function advance(id: string) {
    const now = new Date()
    setContracts(prev => prev.map(c => {
      if (c.id !== id) return c
      if (c.status === 'DRAFT') return { ...c, status: 'PENDING_MANAGEMENT', sentToManagementAt: now }
      if (c.status === 'PENDING_MANAGEMENT') return {
        ...c, status: 'PENDING_EMPLOYEE',
        managementSignedAt: now, managementSignedBy: 'Petra Nováková',
        sentToEmployeeAt: now,
      }
      if (c.status === 'PENDING_EMPLOYEE') return { ...c, status: 'SIGNED', employeeSignedAt: now }
      return c
    }))
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1">
        {([['smlouvy', 'Smlouvy'], ['sablony', 'Šablony']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === id ? 'bg-navy text-white shadow-sm' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Šablony */}
      {tab === 'sablony' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 bg-violet/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-violet" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLOR[tpl.type] ?? 'bg-slate-100 text-slate-600'}`}>{tpl.type}</span>
              </div>
              <div>
                <p className="font-headline font-semibold text-navy">{tpl.name}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <span className="text-xs text-slate-400">{tpl.placeholders.length} polí</span>
                <button
                  onClick={() => setTab('smlouvy')}
                  className="flex items-center gap-1.5 text-xs font-medium text-violet hover:text-violet/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Použít šablonu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smlouvy */}
      {tab === 'smlouvy' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === opt.value ? 'bg-navy text-white' : 'bg-white text-slate-500 border border-slate-200 hover:text-navy'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Zaměstnanec</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Šablona</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Stav</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Datum</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {c.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-navy">{c.employeeName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FilePen className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          <span className="text-navy">{c.templateName}</span>
                        </div>
                        {c.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{c.notes}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {c.createdAt.toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {c.status === 'DRAFT' && (
                            <button
                              onClick={() => advance(c.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              Odeslat vedení
                            </button>
                          )}
                          {c.status === 'PENDING_MANAGEMENT' && (
                            <button
                              onClick={() => advance(c.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet text-white rounded-lg text-xs font-medium hover:bg-violet/90 transition-colors"
                            >
                              <Pen className="w-3 h-3" />
                              Podepsat
                            </button>
                          )}
                          {c.status === 'PENDING_EMPLOYEE' && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              Čeká
                            </span>
                          )}
                          {c.status === 'SIGNED' && (
                            <button
                              onClick={() => window.print()}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              PDF
                            </button>
                          )}
                          <button
                            onClick={() => setSelected(c)}
                            className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Žádné smlouvy v tomto stavu.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <ContractDetailModal
          contract={selected}
          template={templates.find(t => t.id === selected.templateId)}
          onClose={() => setSelected(null)}
          onSign={(id) => { advance(id); setSelected(null) }}
        />
      )}
    </div>
  )
}
