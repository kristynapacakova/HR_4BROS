'use client'

import { Contract, ContractStatus, ContractTemplate } from '@/lib/mock-data'
import { printContract } from '@/lib/print-contract'
import { X, CheckCircle2, User, Building2, Download, Pen } from 'lucide-react'

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

// Watercolor blob SVG — light blue, top-right decoration
const WatercolorBlob = () => (
  <svg
    className="absolute top-0 right-0 w-48 h-36 pointer-events-none select-none"
    viewBox="0 0 200 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="160" cy="30" rx="80" ry="55" fill="rgba(147,197,253,0.22)" transform="rotate(-15 160 30)" />
    <ellipse cx="175" cy="55" rx="55" ry="38" fill="rgba(126,23,224,0.07)" transform="rotate(10 175 55)" />
    <ellipse cx="140" cy="15" rx="45" ry="28" fill="rgba(147,197,253,0.15)" transform="rotate(-30 140 15)" />
  </svg>
)

// 4BROS logo lockup with wave underline
const LogoLockup = () => (
  <div className="flex flex-col" style={{ width: 88 }}>
    <div className="flex items-baseline gap-0.5">
      <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#0E2337', letterSpacing: '-1px', lineHeight: 1 }}>4</span>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#0E2337', letterSpacing: '0.1em', lineHeight: 1 }}>BROS</span>
    </div>
    <svg width="72" height="8" viewBox="0 0 72 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: 3 }}>
      <path d="M2 5 C10 1.5, 18 1.5, 26 5 C34 8.5, 42 8.5, 50 5 C58 1.5, 64 1.5, 70 5"
        stroke="#0E2337" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  </div>
)

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

  const signedAt = contract.employeeSignedAt
    ? new Date(contract.employeeSignedAt).toLocaleDateString('cs-CZ')
    : null
  const mgmtSignedAt = contract.managementSignedAt
    ? new Date(contract.managementSignedAt).toLocaleDateString('cs-CZ')
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Modal chrome header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[contract.status]}`}>
              {STATUS_LABEL[contract.status]}
            </span>
            <span className="text-sm text-slate-400">·</span>
            <span className="text-sm text-slate-500">{contract.employeeName}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-navy rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable document area */}
        <div className="flex-1 overflow-y-auto bg-slate-100/60">

          {/* Timeline strip */}
          <div className="px-6 py-3 border-b border-slate-200/70 bg-white/90 flex gap-2 flex-wrap">
            {timeline.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                  <span className={`text-xs ${step.done ? 'text-navy font-medium' : 'text-slate-400'}`}>{step.label}</span>
                  {step.date && <span className="text-[10px] text-slate-400">({new Date(step.date).toLocaleDateString('cs-CZ')})</span>}
                  {i < timeline.length - 1 && <span className="text-slate-200 mx-0.5 text-xs">›</span>}
                </div>
              )
            })}
          </div>

          {/* Document sheet */}
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] overflow-hidden">

              {/* Document header with logo + blob */}
              <div className="relative px-10 pt-8 pb-6 border-b border-slate-100 overflow-hidden">
                <WatercolorBlob />
                <div className="relative z-10 flex items-start justify-between">
                  <LogoLockup />
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Interní dokument</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{contract.createdAt.toLocaleDateString('cs-CZ')}</p>
                  </div>
                </div>

                {/* Doc title */}
                <div className="relative z-10 mt-10 mb-1">
                  <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#0E2337', letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                    {contract.templateName}
                  </h1>
                </div>
                <div className="relative z-10 mt-3 flex gap-4 text-xs text-slate-500">
                  <span>Připraveno pro: <strong className="text-navy">{contract.employeeName}</strong></span>
                  <span>·</span>
                  <span>Připraveno kým: <strong className="text-navy">Four Bros s.r.o.</strong></span>
                </div>
              </div>

              {/* Body */}
              <div className="px-10 py-8 contract-body text-[13.5px] leading-relaxed text-[#1e3a52]"
                dangerouslySetInnerHTML={{ __html: filledBody }}
              />

              {/* Signature section */}
              <div className="px-10 pb-10 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5">NA DŮKAZ ČEHOŽ SMLUVNÍ STRANY PŘIPOJUJÍ SVÉ PODPISY</p>
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { role: 'Za zaměstnavatele', name: contract.managementSignedBy ?? 'Four Bros s.r.o.', signed: !!mgmtSignedAt, date: mgmtSignedAt },
                    { role: 'Zaměstnanec', name: contract.employeeName, signed: !!signedAt, date: signedAt },
                  ].map(({ role, name, signed, date }) => (
                    <div key={role}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-6">{role}</p>
                      {signed ? (
                        <div className="border border-green-200 rounded-lg px-4 py-3 bg-green-50/60">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.8 1.8 3-3.3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <span className="text-xs font-semibold text-navy">{name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 pl-6">Podepsáno: {date}</p>
                        </div>
                      ) : (
                        <div>
                          <div className="border-b border-dashed border-slate-300 mb-2 h-8" />
                          <p className="text-xs text-slate-400">{name}</p>
                          <p className="text-[10px] text-slate-300">Čeká na podpis</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-white">
          {contract.status === 'PENDING_MANAGEMENT' && (
            <button
              onClick={() => { onSign(contract.id); onClose() }}
              className="flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <Pen className="w-4 h-4" />
              Podepsat jako vedení
            </button>
          )}
          <button
            onClick={() => printContract(contract, template)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Stáhnout PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Zavřít
          </button>
        </div>

      </div>

      <style>{`
        .contract-body h2 {
          font-family: Georgia, serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #0E2337;
          margin-top: 28px;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1.5px solid #0E2337;
        }
        .contract-body h3 {
          font-size: 13px;
          font-weight: 600;
          color: #7e17e0;
          margin-top: 16px;
          margin-bottom: 6px;
          padding-left: 10px;
          border-left: 3px solid #7e17e0;
        }
        .contract-body p { margin-bottom: 10px; }
        .contract-body ul, .contract-body ol { padding-left: 20px; margin-bottom: 10px; }
        .contract-body li { margin-bottom: 4px; }
        .contract-body strong { font-weight: 700; color: #0E2337; }
      `}</style>
    </div>
  )
}
