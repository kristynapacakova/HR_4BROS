'use client'

import { Contract, ContractStatus, ContractTemplate } from '@/lib/mock-data'
import { printContract } from '@/lib/print-contract'
import { loadDesign, fontStack } from '@/app/admin/smlouvy/ContractDesignerClient'
import { X, CheckCircle2, User, Building2, Download, Pen, Clock, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ContractDesign } from '@/app/admin/smlouvy/ContractDesignerClient'
import { SigniSimulationModal } from './SigniSimulationModal'

const STATUS_LABEL: Record<ContractStatus, string> = {
  DRAFT: 'Návrh',
  PENDING_MANAGEMENT: 'Čeká na vedení',
  PENDING_EMPLOYEE: 'Čeká na zaměstnance',
  SIGNED: 'Podepsáno',
}

const STATUS_COLOR: Record<ContractStatus, { pill: string; dot: string }> = {
  DRAFT:              { pill: 'bg-slate-100 text-slate-500',  dot: 'bg-slate-300' },
  PENDING_MANAGEMENT: { pill: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-400' },
  PENDING_EMPLOYEE:   { pill: 'bg-blue-50 text-blue-700',     dot: 'bg-blue-400' },
  SIGNED:             { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
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

const BrandLogo = () => <img src="/brand/logo.png" alt="4BROS" className="h-9 object-contain" />
const BrandWatercolor = ({ className }: { className?: string }) => (
  <img src="/brand/watercolor.png" alt="" className={className ?? 'absolute top-0 right-0 h-36 object-contain pointer-events-none select-none'} />
)

export function ContractDetailModal({ contract, template, onClose, onSign }: Props) {
  const filledBody = fillPlaceholders(template?.body ?? '', contract.values)
  const [design, setDesign] = useState<ContractDesign | null>(null)
  const [showSigni, setShowSigni] = useState(false)
  const [page, setPage] = useState(0)
  useEffect(() => { setDesign(loadDesign()) }, [])
  const d = design
  const pc  = d?.primaryColor ?? '#194669'
  const ac  = d?.accentColor  ?? '#7e17e0'
  const hStyle  = d?.typo?.heading    ?? { fontFamily: 'serenity' as const, fontSize: 13, fontWeight: 500,  italic: false }
  const shStyle = d?.typo?.subheading ?? { fontFamily: 'roboto'   as const, fontSize: 12, fontWeight: 700,  italic: false }
  const bStyle  = d?.typo?.body       ?? { fontFamily: 'roboto'   as const, fontSize: 12, fontWeight: 300,  italic: false }
  const ff  = fontStack(hStyle.fontFamily)
  const bff = fontStack(bStyle.fontFamily)

  const timeline = [
    { label: 'Vytvořeno',              date: contract.createdAt,           done: true,                          icon: Building2 },
    { label: 'Odesláno vedení',        date: contract.sentToManagementAt,  done: !!contract.sentToManagementAt, icon: Building2 },
    { label: contract.managementSignedBy ? `Podepsáno (${contract.managementSignedBy})` : 'Podpis vedení',
                                        date: contract.managementSignedAt,  done: !!contract.managementSignedAt, icon: Pen },
    { label: 'Odesláno zaměstnanci',   date: contract.sentToEmployeeAt,    done: !!contract.sentToEmployeeAt,   icon: User },
    { label: 'Podepsáno zaměstnancem', date: contract.employeeSignedAt,    done: !!contract.employeeSignedAt,   icon: CheckCircle2 },
  ]

  const signedAt    = contract.employeeSignedAt   ? new Date(contract.employeeSignedAt).toLocaleDateString('cs-CZ')   : null
  const mgmtSignedAt = contract.managementSignedAt ? new Date(contract.managementSignedAt).toLocaleDateString('cs-CZ') : null

  const sc = STATUS_COLOR[contract.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Modal chrome header ── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${sc.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {STATUS_LABEL[contract.status]}
            </span>
            <span className="text-slate-200">|</span>
            <span className="text-sm font-medium text-slate-600">{contract.employeeName}</span>
            <span className="text-slate-200">|</span>
            <span className="text-xs text-slate-400">{contract.templateName}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable area ── */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#F4F4F4' }}>

          {/* Timeline stepper */}
          <div className="px-6 py-3 bg-white border-b border-slate-100">
            <div className="flex items-center gap-0 overflow-x-auto">
              {timeline.map((step, i) => {
                const Icon = step.icon
                const isLast = i === timeline.length - 1
                return (
                  <div key={i} className="flex items-center flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${step.done ? 'text-white' : 'bg-slate-100 text-slate-300'}`}
                        style={step.done ? { background: pc } : undefined}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-semibold leading-tight ${step.done ? 'text-navy' : 'text-slate-400'}`}>{step.label}</span>
                        {step.date
                          ? <span className="text-[9px] text-slate-400">{new Date(step.date).toLocaleDateString('cs-CZ')}</span>
                          : <span className="text-[9px] text-slate-300">—</span>
                        }
                      </div>
                    </div>
                    {!isLast && (
                      <div className={`w-6 h-px mx-2 flex-shrink-0 ${step.done && timeline[i + 1]?.done ? '' : 'opacity-30'}`}
                        style={{ background: step.done && timeline[i + 1]?.done ? pc : '#cbd5e1' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Page navigation ── */}
          <div className="px-6 pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              aria-label="Předchozí strana"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1 bg-white rounded-full border border-slate-200 p-1 shadow-sm">
              {['Titulní strana', 'Smlouva a podpisy'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setPage(i)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    page === i ? 'text-white' : 'text-slate-500 hover:text-navy'
                  }`}
                  style={page === i ? { background: ac } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(1, p + 1))}
              disabled={page === 1}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              aria-label="Další strana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Document sheet */}
          <div className="p-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_32px_rgba(25,70,105,0.10)] flex flex-col" style={page === 0 ? { minHeight: 720 } : undefined}>

              {/* ═══ PAGE 1 — Cover (mirrors PDF) ═══ */}
              {page === 0 && (
                <>
                  {/* Header: logo + watercolor */}
                  <div className="relative px-10 pt-8 pb-4 overflow-hidden">
                    {d?.decorDataUrl
                      ? <img src={d.decorDataUrl} alt="" className="absolute top-0 right-0 h-40 object-contain pointer-events-none select-none opacity-70 z-0" />
                      : <BrandWatercolor className="absolute top-0 right-0 h-40 object-contain pointer-events-none select-none opacity-80 z-0" />
                    }
                    <div className="relative z-10">
                      {d?.logoDataUrl
                        ? <img src={d.logoDataUrl} alt="Logo" className="h-10 object-contain" />
                        : <BrandLogo />
                      }
                    </div>
                  </div>

                  {/* Centered cover block */}
                  <div className="flex-1 flex flex-col justify-center px-10 py-12">
                    <p className="text-[11px] font-semibold tracking-wide mb-4" style={{ color: ac }}>
                      {d?.companyName ?? 'Four Bros s.r.o.'} &nbsp;·&nbsp; {contract.employeeName}
                    </p>
                    <h1 style={{ fontFamily: ff, fontSize: 38, fontWeight: hStyle.fontWeight, fontStyle: hStyle.italic ? 'italic' : 'normal', color: pc, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
                      {contract.templateName}
                    </h1>
                    <div className="w-12 h-1 rounded-full my-7" style={{ background: ac }} />
                    <p className="text-[11px]" style={{ color: `${pc}99` }}>{contract.createdAt.toLocaleDateString('cs-CZ')}</p>
                  </div>

                  {/* Footer */}
                  <div className="px-10 py-4 border-t flex justify-between items-center" style={{ borderColor: `${pc}20` }}>
                    <div style={{ fontSize: 9, color: `${pc}80`, lineHeight: 1.7 }}>
                      <strong style={{ color: pc, fontWeight: 600 }}>{d?.companyName ?? 'Four Bros s.r.o.'}</strong>
                      {d?.companyIco && <span> &nbsp;·&nbsp; IČO: {d.companyIco}</span>}
                      {d?.companyAddress && <span> &nbsp;·&nbsp; {d.companyAddress}</span>}
                    </div>
                    {d?.logoDataUrl
                      ? <img src={d.logoDataUrl} alt="" style={{ height: 18, objectFit: 'contain', opacity: 0.3 }} />
                      : <img src="/brand/logo.png" alt="" style={{ height: 18, objectFit: 'contain', opacity: 0.3 }} />
                    }
                  </div>
                </>
              )}

              {/* ═══ PAGE 2 — Content (mirrors PDF) ═══ */}
              {page === 1 && (
                <>
                  {/* Slim header */}
                  <div className="relative px-10 pt-7 pb-3 overflow-hidden">
                    {d?.decorDataUrl
                      ? <img src={d.decorDataUrl} alt="" className="absolute top-0 right-0 h-28 object-contain pointer-events-none select-none opacity-70 z-0" />
                      : <BrandWatercolor className="absolute top-0 right-0 h-28 object-contain pointer-events-none select-none opacity-80 z-0" />
                    }
                    <div className="relative z-10">
                      {d?.logoDataUrl
                        ? <img src={d.logoDataUrl} alt="Logo" className="h-8 object-contain" />
                        : <img src="/brand/logo.png" alt="4BROS" className="h-8 object-contain" />
                      }
                    </div>
                  </div>

                  <div className="px-10 pt-4">
                    {/* Preamble */}
                    <p className="text-center font-bold text-[10px] tracking-wide mb-7 leading-relaxed" style={{ color: pc, fontFamily: bff }}>
                      TATO {contract.templateName.toUpperCase()} BYLA UZAVŘENA NÍŽE UVEDENÉHO DNE, MĚSÍCE A ROKU MEZI TĚMITO SMLUVNÍMI STRANAMI
                    </p>

                    {/* Party: employee */}
                    <div className="rounded-lg px-5 py-4 mb-2.5" style={{ background: '#F7F8FE' }}>
                      <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: pc }}>Zaměstnanec</p>
                      <table className="w-full" style={{ fontFamily: bff, fontSize: bStyle.fontSize, color: pc }}>
                        <tbody>
                          <tr><td className="py-0.5" style={{ width: 150 }}>Jméno:</td><td>{contract.employeeName}</td></tr>
                          {contract.values.DATUM_NASTUPU && <tr><td className="py-0.5">Datum nástupu:</td><td>{contract.values.DATUM_NASTUPU}</td></tr>}
                          {contract.values.POZICE && <tr><td className="py-0.5">Pracovní pozice:</td><td>{contract.values.POZICE}</td></tr>}
                          {contract.values.MZDA && <tr><td className="py-0.5">Mzda:</td><td>{contract.values.MZDA}</td></tr>}
                          {contract.values.HODINOVA_SAZBA && <tr><td className="py-0.5">Hodinová sazba:</td><td>{contract.values.HODINOVA_SAZBA}</td></tr>}
                          {contract.values.MAX_HODIN && <tr><td className="py-0.5">Max. hodin ročně:</td><td>{contract.values.MAX_HODIN}</td></tr>}
                          {contract.values.TYDENNI_UVAZEK && <tr><td className="py-0.5">Týdenní úvazek:</td><td>{contract.values.TYDENNI_UVAZEK} hod</td></tr>}
                        </tbody>
                      </table>
                      <p className="mt-2" style={{ fontFamily: bff, fontSize: bStyle.fontSize, color: pc }}>(dále jako <strong>„Zaměstnanec&ldquo;</strong>)</p>
                    </div>

                    <p className="text-center font-bold py-1" style={{ color: pc, fontSize: 13 }}>a</p>

                    {/* Party: employer */}
                    <div className="rounded-lg px-5 py-4 mb-5" style={{ background: '#F7F8FE' }}>
                      <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: pc }}>Zaměstnavatel</p>
                      <table className="w-full" style={{ fontFamily: bff, fontSize: bStyle.fontSize, color: pc }}>
                        <tbody>
                          <tr><td className="py-0.5" style={{ width: 150 }}>Firma:</td><td>{d?.companyName ?? 'Four Bros s.r.o.'}</td></tr>
                          <tr><td className="py-0.5">IČO:</td><td>{d?.companyIco ?? ''}</td></tr>
                          <tr><td className="py-0.5">Sídlo:</td><td>{d?.companyAddress ?? ''}</td></tr>
                        </tbody>
                      </table>
                      <p className="mt-2" style={{ fontFamily: bff, fontSize: bStyle.fontSize, color: pc }}>(dále jako <strong>„Zaměstnavatel&ldquo;</strong>)</p>
                    </div>

                    <p className="font-bold tracking-wide mb-4" style={{ color: pc, fontSize: bStyle.fontSize, fontFamily: bff }}>
                      SMLUVNÍ STRANY UJEDNÁVAJÍ NÁSLEDUJÍCÍ:
                    </p>
                  </div>

                  {/* Body */}
                  <div className="px-10 pb-4 contract-body leading-relaxed"
                    style={{ fontFamily: bff, fontSize: bStyle.fontSize, fontWeight: bStyle.fontWeight, fontStyle: bStyle.italic ? 'italic' : 'normal', color: pc }}
                    dangerouslySetInnerHTML={{ __html: filledBody }}
                  />

                  {/* Signature section */}
                  <div className="px-10 pb-8 pt-2">
                    <div className="rounded-xl p-5" style={{ background: '#F7F8FE' }}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-5" style={{ color: pc }}>
                        NA DŮKAZ ČEHOŽ SMLUVNÍ STRANY PŘIPOJUJÍ SVÉ PODPISY
                      </p>
                      <div className="grid grid-cols-2 gap-8">
                        {[
                          { role: 'Za zaměstnavatele', name: contract.managementSignedBy ?? d?.companyName ?? 'Four Bros s.r.o.', signed: !!mgmtSignedAt, date: mgmtSignedAt },
                          { role: 'Zaměstnanec',        name: contract.employeeName,                                               signed: !!signedAt,     date: signedAt },
                        ].map(({ role, name, signed, date }) => (
                          <div key={role}>
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: pc }}>{role}</p>
                            {signed ? (
                              <div className="rounded-xl px-4 py-3 border" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.8 1.8 3-3.3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </div>
                                  <span className="text-xs font-semibold" style={{ color: pc }}>{name}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 pl-6">Podepsáno: {date}</p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <div className="h-10 border-b-2 border-dashed" style={{ borderColor: `${pc}30` }} />
                                <p className="text-xs font-medium" style={{ color: pc }}>{name}</p>
                                <p className="text-[10px] flex items-center gap-1 text-slate-400">
                                  <Clock className="w-3 h-3" /> Čeká na podpis
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-10 py-4 border-t flex justify-between items-center" style={{ borderColor: `${pc}20` }}>
                    <div style={{ fontSize: 9, color: `${pc}80`, lineHeight: 1.7 }}>
                      <strong style={{ color: pc, fontWeight: 600 }}>{d?.companyName ?? 'Four Bros s.r.o.'}</strong>
                      {d?.companyIco && <span> &nbsp;·&nbsp; IČO: {d.companyIco}</span>}
                      {d?.companyAddress && <span> &nbsp;·&nbsp; {d.companyAddress}</span>}
                    </div>
                    {d?.logoDataUrl
                      ? <img src={d.logoDataUrl} alt="" style={{ height: 18, objectFit: 'contain', opacity: 0.3 }} />
                      : <img src="/brand/logo.png" alt="" style={{ height: 18, objectFit: 'contain', opacity: 0.3 }} />
                    }
                  </div>
                </>
              )}

            </div>

            {/* Page indicator */}
            <p className="text-center text-[10px] text-slate-400 mt-3">Strana {page + 1} z 2</p>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex justify-between items-center flex-shrink-0 bg-white">
          <span className="text-[10px] text-slate-300">
            Vytvořeno: {contract.createdAt.toLocaleDateString('cs-CZ')}
          </span>
          <div className="flex gap-2">
            {contract.status === 'PENDING_MANAGEMENT' && (
              <button
                onClick={() => { onSign(contract.id); onClose() }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors text-white"
                style={{ background: ac }}
              >
                <Pen className="w-3.5 h-3.5" />
                Podepsat jako vedení
              </button>
            )}
            {(contract.status === 'PENDING_EMPLOYEE' || contract.status === 'DRAFT') && (
              <button
                onClick={() => setShowSigni(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: '#0EA5A4', color: '#0EA5A4', background: '#0EA5A410' }}
              >
                <Send className="w-3.5 h-3.5" />
                Odeslat k e-podpisu
              </button>
            )}
            <button
              onClick={() => printContract(contract, template)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: pc }}
            >
              <Download className="w-3.5 h-3.5" />
              Stáhnout PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Zavřít
            </button>
          </div>
        </div>

      </div>

      <style>{`
        .contract-body h2 {
          font-family: ${ff};
          font-size: ${hStyle.fontSize}px;
          font-weight: ${hStyle.fontWeight};
          font-style: ${hStyle.italic ? 'italic' : 'normal'};
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: ${pc};
          margin-top: 32px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1.5px solid ${pc}30;
        }
        .contract-body h3 {
          font-family: ${fontStack(shStyle.fontFamily)};
          font-size: ${shStyle.fontSize}px;
          font-weight: ${shStyle.fontWeight};
          font-style: ${shStyle.italic ? 'italic' : 'normal'};
          color: ${ac};
          margin-top: 18px;
          margin-bottom: 6px;
          padding-left: 10px;
          border-left: 3px solid ${ac};
        }
        .contract-body p  { margin-bottom: 10px; }
        .contract-body ul, .contract-body ol { padding-left: 20px; margin-bottom: 10px; }
        .contract-body li { margin-bottom: 5px; }
        .contract-body strong { font-weight: 700; }
      `}</style>

      {showSigni && <SigniSimulationModal contract={contract} onClose={() => setShowSigni(false)} />}
    </div>
  )
}
