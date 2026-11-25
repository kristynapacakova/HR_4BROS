'use client'

import { ContractOverview } from './ContractOverview'
import { useState, useRef, useMemo } from 'react'
import { Contract, ContractTemplate, ContractStatus, DEMO_TEAM } from '@/lib/mock-data'
import { ContractDetailModal } from './ContractDetailModal'
import { ContractDesignerClient } from './ContractDesignerClient'
import { contractDocModel, companyFromDesign, printFlowContract } from '@/lib/print-contract'
import { useContractTemplates } from '@/lib/contract-template-client'
import { placeholderLabel } from '@/lib/contract-doc'
import { ContractDocPreview } from '@/components/ContractDocPreview'
import { TemplateEditor } from './TemplateEditor'
import { useFlowContracts, addFlowContract, editFlowContract, removeFlowContract, isLocked, sendToManagement, signAsManagement, signAsEmployee, type FlowContract } from '@/lib/contract-flow-client'
import { CONTRACT_DOC_TYPES } from '@/lib/contract-file-client'
import { loadDesign } from './ContractDesignerClient'

/** výchozí druh dokumentu (sloupec v Přehledu smluv) podle typu šablony */
const DOC_TYPE_BY_TEMPLATE: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'IČO', OBECNA: 'Dodatek' }
import { FilePen, FileText, Clock, CheckCircle2, ChevronRight, Plus, Send, Pen, X, ArrowLeft, Upload, Archive, ExternalLink, Trash2, Palette, Pencil } from 'lucide-react'

interface ArchivedContract {
  id: string
  name: string
  employeeName: string
  contractType: string
  notes: string
  uploadedAt: Date
  fileUrl: string
  fileName: string
}

const STATUS_LABEL: Record<ContractStatus, string> = {
  DRAFT: 'Návrh',
  PENDING_MANAGEMENT: 'Čeká na jednatele',
  PENDING_EMPLOYEE: 'Čeká na uživatele',
  SIGNED: 'Podepsáno',
}

const STATUS_COLOR: Record<ContractStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_MANAGEMENT: 'bg-gold-tint text-gold-dark',
  PENDING_EMPLOYEE: 'bg-violet/10 text-violet',
  SIGNED: 'bg-mint-tint text-mint-dark',
}

const TYPE_COLOR: Record<string, string> = {
  HPP: 'bg-navy/10 text-navy',
  DPP: 'bg-mint-tint text-mint-dark',
  DPC: 'bg-violet/10 text-violet',
  ICO: 'bg-gold-tint text-gold-dark',
  OBECNA: 'bg-slate-100 text-slate-600',
}

const FILTER_OPTIONS: { value: ContractStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Všechny' },
  { value: 'DRAFT', label: 'Návrh' },
  { value: 'PENDING_MANAGEMENT', label: 'Čeká na jednatele' },
  { value: 'PENDING_EMPLOYEE', label: 'Čeká na uživatele' },
  { value: 'SIGNED', label: 'Podepsáno' },
]

const PLACEHOLDER_LABELS: Record<string, string> = {
  ZAMESTNAVATEL: 'Zaměstnavatel (název + IČO + sídlo)',
  JMENO: 'Jméno zaměstnance',
  POZICE: 'Pracovní pozice',
  MZDA: 'Mzda (vč. jednotky, např. 70 000 Kč)',
  DATUM_NASTUPU: 'Datum nástupu',
  MISTO_VYKONU: 'Místo výkonu práce',
  TYDENNI_UVAZEK: 'Týdenní úvazek (hod)',
  ZKUSEBNI_DOBA: 'Zkušební doba (text)',
  DATUM_PODPISU: 'Datum podpisu',
  MISTO_PODPISU: 'Místo podpisu (např. V Praze)',
  HODINOVA_SAZBA: 'Hodinová sazba (vč. jednotky)',
  MAX_HODIN: 'Max. hodin ročně',
  DATUM_UKONCENI: 'Datum ukončení',
  CISLO_DODATKU: 'Číslo dodatku',
  DATUM_PUVODNI_SMLOUVY: 'Datum původní smlouvy',
  POPIS_ZMENY: 'Popis změny',
  DATUM_UCINNOSTI: 'Datum účinnosti',
  NOVA_MZDA: 'Nová mzda (vč. jednotky)',
}

// Step 1: pick template, Step 2: fill form
type CreateStep = 'pick-template' | 'fill-form'

const CONTRACT_TYPES = ['HPP', 'DPP', 'DPC', 'ICO', 'Dodatek', 'Jiné']

export function ContractsClient({ templates: baseTemplates, contracts: initialContracts }: {
  templates: ContractTemplate[]
  contracts: Contract[]
}) {
  // vestavěné šablony + šablony nahrané / upravené HR
  const templates = useContractTemplates(baseTemplates)
  const [editing, setEditing] = useState<ContractTemplate | 'new' | null>(null)
  const [tab, setTab] = useState<'prehled' | 'sablony' | 'smlouvy' | 'archiv' | 'vizual'>('prehled')
  // smlouvy vytvořené ze šablony se ukládají (ukázkové jen jako náhled)
  const seed = useMemo<FlowContract[]>(() => initialContracts.map(c => ({ ...c, personId: '', docType: 'HPP' })), [initialContracts])
  const contracts = useFlowContracts(seed)
  const [filter, setFilter] = useState<ContractStatus | 'ALL'>('ALL')
  const [selected, setSelected] = useState<Contract | null>(null)

  // Archive
  const [archived, setArchived] = useState<ArchivedContract[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadEmployee, setUploadEmployee] = useState('')
  const [uploadType, setUploadType] = useState('HPP')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDrag, setUploadDrag] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setUploadDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setUploadFile(f)
  }

  function submitUpload() {
    if (!uploadFile || !uploadName || !uploadEmployee) return
    const fileUrl = URL.createObjectURL(uploadFile)
    setArchived(prev => [{
      id: `arch-${Date.now()}`,
      name: uploadName,
      employeeName: uploadEmployee,
      contractType: uploadType,
      notes: uploadNotes,
      uploadedAt: new Date(),
      fileUrl,
      fileName: uploadFile.name,
    }, ...prev])
    setShowUpload(false)
    setUploadName('')
    setUploadEmployee('')
    setUploadType('HPP')
    setUploadNotes('')
    setUploadFile(null)
  }

  function deleteArchived(id: string) {
    setArchived(prev => {
      const item = prev.find(a => a.id === id)
      if (item) URL.revokeObjectURL(item.fileUrl)
      return prev.filter(a => a.id !== id)
    })
  }

  // Create flow
  const [createStep, setCreateStep] = useState<CreateStep | null>(null)
  const [createTemplate, setCreateTemplate] = useState<ContractTemplate | null>(null)
  const [createValues, setCreateValues] = useState<Record<string, string>>({})
  const [createEmployee, setCreateEmployee] = useState('') // id uživatele
  const [createDocType, setCreateDocType] = useState('HPP')
  const createPerson = DEMO_TEAM.find(m => m.id === createEmployee)
  const [createNotes, setCreateNotes] = useState('')

  const draftModel = useMemo(() => createTemplate ? contractDocModel({
    id: 'draft', templateId: createTemplate.id, templateName: createTemplate.name, employeeId: 'new', employeeName: createPerson?.name ?? '',
    status: 'DRAFT', createdAt: new Date(), sentToManagementAt: null, managementSignedAt: null, managementSignedBy: null,
    sentToEmployeeAt: null, employeeSignedAt: null, values: { ...createValues, JMENO: createValues.JMENO || createPerson?.name || '' }, notes: null,
  }, createTemplate) : null, [createTemplate, createPerson, createValues])

  const filtered = filter === 'ALL' ? contracts : contracts.filter(c => c.status === filter)

  function advance(id: string) {
    const c = contracts.find(x => x.id === id)
    if (!c) return
    if (c.status === 'DRAFT') sendToManagement(c)
    else if (c.status === 'PENDING_MANAGEMENT') signAsManagement(c, loadDesign().signatoryName?.trim() || 'Jednatel Four Bros s.r.o.')
    else if (c.status === 'PENDING_EMPLOYEE') signAsEmployee(c)
  }

  function openCreate(tpl?: ContractTemplate) {
    setCreateTemplate(tpl ?? null)
    setCreateDocType(DOC_TYPE_BY_TEMPLATE[tpl?.type ?? ''] ?? 'Jiné')
    setCreateValues({})
    setCreateEmployee('')
    setCreateNotes('')
    setEditingId(null)
    setCreateStep(tpl ? 'fill-form' : 'pick-template')
    setTab('smlouvy')
  }

  // úprava existující smlouvy (jen HR, jen nepodepsaná)
  const [editingId, setEditingId] = useState<string | null>(null)
  function openEdit(c: FlowContract) {
    const tpl = c.snapshot ? { ...c.snapshot, createdAt: new Date(0) } as ContractTemplate : templates.find(t => t.id === c.templateId)
    if (!tpl) return
    if (c.status !== 'DRAFT' && !confirm('Smlouva už je odeslaná k podpisu. Po úpravě se podpisy zruší a smlouva se vrátí do návrhu. Pokračovat?')) return
    setEditingId(c.id)
    setCreateTemplate(tpl)
    setCreateDocType(c.docType)
    setCreateValues(c.values)
    setCreateEmployee(c.personId)
    setCreateNotes(c.notes ?? '')
    setCreateStep('fill-form')
  }
  function deleteContract(c: FlowContract) {
    const msg = isLocked(c)
      ? `Smazat PODEPSANOU smlouvu „${c.templateName}“ (${c.employeeName})?\n\nZmizí z Přehledu smluv i z jeho Dokumentů. Nejde to vrátit.`
      : `Smazat smlouvu „${c.templateName}“ (${c.employeeName})?`
    if (confirm(msg)) removeFlowContract(c.id)
  }

  function submitCreate() {
    if (!createTemplate || !createPerson) return
    if (editingId) {
      editFlowContract(editingId, {
        employeeId: createPerson.id, employeeName: createPerson.name, personId: createPerson.id, docType: createDocType,
        values: { ...createValues, JMENO: createValues.JMENO || createPerson.name }, notes: createNotes || null,
      })
      setEditingId(null)
      setCreateStep(null)
      setFilter('DRAFT')
      return
    }
    addFlowContract({
      id: `c-${Date.now()}`,
      templateId: createTemplate.id,
      templateName: createTemplate.name,
      employeeId: createPerson.id,
      employeeName: createPerson.name,
      personId: createPerson.id,
      docType: createDocType,
      status: 'DRAFT',
      createdAt: new Date(),
      sentToManagementAt: null,
      managementSignedAt: null,
      managementSignedBy: null,
      sentToEmployeeAt: null,
      employeeSignedAt: null,
      values: { ...createValues, JMENO: createValues.JMENO || createPerson.name },
      notes: createNotes || null,
      // zmrazit znění šablony a údaje firmy
      snapshot: { ...createTemplate, createdAt: undefined } as unknown as FlowContract['snapshot'],
      company: companyFromDesign(),
    })
    setCreateStep(null)
    setFilter('DRAFT')
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-[rgba(13,33,79,0.14)] p-1">
        {([['prehled', 'Přehled smluv'], ['smlouvy', 'Nová ze šablony'], ['sablony', 'Šablony'], ['vizual', 'Vizuál PDF']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setCreateStep(null); setEditing(null) }}
            className={`flex-1 py-2 text-sm font-medium  transition-all ${
              tab === id ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Přehled všech smluv všech lidí + nahrání podepsané smlouvy */}
      {tab === 'prehled' && <ContractOverview />}

      {/* Šablony */}
      {tab === 'sablony' && editing && (
        <TemplateEditor template={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
      {tab === 'sablony' && !editing && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-navy/60 flex-1 min-w-[240px]">Šablony smluv, ze kterých vytváříš smlouvy. Nahraj vlastní z Wordu nebo textu — vzhled dodá šablona 4Bros 2026 a vpravo hned uvidíš náhled.</p>
            <button type="button" onClick={() => setEditing('new')} className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-violet"><Upload className="w-4 h-4" />Nahrát šablonu</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(tpl => (
              <div key={tpl.id} className="bg-white border border-[rgba(13,33,79,0.14)] p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 bg-alice flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-navy" />
                  </div>
                  <span className="flex items-center gap-1.5">
                    {tpl.custom && <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-violet">Vlastní</span>}
                    <span className={`text-xs px-2 py-0.5 font-medium ${TYPE_COLOR[tpl.type] ?? 'bg-slate-100 text-slate-600'}`}>{tpl.type === 'ICO' ? 'IČO' : tpl.type === 'DPC' ? 'DPČ' : tpl.type}</span>
                  </span>
                </div>
                <div>
                  <p className="font-headline font-semibold text-navy">{tpl.name}</p>
                  {tpl.description && <p className="text-xs text-navy/50 mt-1 leading-relaxed">{tpl.description}</p>}
                </div>
                <div className="flex items-center justify-between gap-3 mt-auto pt-2 border-t border-[rgba(13,33,79,0.06)]">
                  <span className="text-xs text-navy/45">{tpl.placeholders.length} polí</span>
                  <span className="flex items-center gap-3">
                    <button onClick={() => setEditing(tpl)} className="text-xs font-semibold text-navy/60 hover:text-violet">Upravit · náhled</button>
                    <button onClick={() => openCreate(tpl)} className="flex items-center gap-1 text-xs font-semibold text-violet hover:text-navy"><Plus className="w-3.5 h-3.5" />Použít šablonu</button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smlouvy */}
      {tab === 'smlouvy' && !createStep && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5  text-sm font-medium transition-all ${
                    filter === opt.value ? 'bg-violet text-white' : 'bg-white text-slate-500 border border-slate-200 hover:text-navy'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => openCreate()}
              className="flex items-center gap-2 px-4 py-2 bg-violet text-white text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nová smlouva
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy">
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Zaměstnanec</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Šablona</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Stav</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Datum</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet flex items-center justify-center flex-shrink-0">
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[c.status]}`}>
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
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gold-tint text-gold-dark text-xs font-medium hover:bg-gold/20 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              Odeslat jednateli
                            </button>
                          )}
                          {c.status === 'PENDING_MANAGEMENT' && (
                            <button
                              onClick={() => advance(c.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet text-white text-xs font-medium hover:bg-violet/90 transition-colors"
                            >
                              <Pen className="w-3 h-3" />
                              Podepsat za jednatele (demo)
                            </button>
                          )}
                          {c.status === 'PENDING_EMPLOYEE' && (
                            <button
                              onClick={() => advance(c.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet/10 text-violet text-xs font-medium hover:bg-violet/20 transition-colors"
                              title="Uživatel podepisuje u sebe v Můj účet → Dokumenty. Tady jen simulace."
                            >
                              <Pen className="w-3 h-3" />
                              Simulovat podpis uživatele
                            </button>
                          )}
                          {c.status === 'SIGNED' && (
                            <button
                              onClick={() => printFlowContract(c, templates)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-mint-tint text-mint-dark text-xs font-medium hover:bg-mint/20 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              PDF
                            </button>
                          )}
                          {c.personId && !isLocked(c) && (
                            <button onClick={() => openEdit(c)} title="Upravit (jen HR)" className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors"><Pencil className="w-4 h-4" /></button>
                          )}
                          {c.personId && (
                            <button onClick={() => deleteContract(c)} title={isLocked(c) ? 'Smazat podepsanou smlouvu (jen HR)' : 'Smazat (jen HR)'} className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          )}
                          <button
                            onClick={() => setSelected(c)}
                            className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors"
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

      {/* Create — step 1: pick template */}
      {tab === 'smlouvy' && createStep === 'pick-template' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setCreateStep(null)} className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-headline font-semibold text-navy">Vyberte šablonu</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => { setCreateTemplate(tpl); setCreateDocType(DOC_TYPE_BY_TEMPLATE[tpl.type] ?? 'Jiné'); setCreateValues({}); setCreateStep('fill-form') }}
                className="bg-white border border-[rgba(13,33,79,0.14)] p-5 flex flex-col gap-3 text-left hover:border-violet/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 bg-violet/10 flex items-center justify-center flex-shrink-0 group-hover:bg-violet/20 transition-colors">
                    <FileText className="w-5 h-5 text-violet" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 font-medium ${TYPE_COLOR[tpl.type] ?? 'bg-slate-100 text-slate-600'}`}>{tpl.type}</span>
                </div>
                <div>
                  <p className="font-headline font-semibold text-navy">{tpl.name}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create — step 2: fill form */}
      {tab === 'smlouvy' && createStep === 'fill-form' && createTemplate && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setCreateStep('pick-template')} className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="font-headline font-semibold text-navy">{editingId ? 'Upravit smlouvu' : 'Nová smlouva'} — {createTemplate.name}</h3>
              <p className="text-xs text-slate-400">Vyplňte pole níže. Smlouva se uloží jako návrh. Pak ji odešleš jednateli k podpisu a po jeho podpisu přijde uživateli do Můj účet → Dokumenty.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] gap-5 items-start">
          <div className="bg-white border border-[rgba(13,33,79,0.14)] p-6 space-y-5">
            {/* Employee */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Uživatel *</label>
              <select
                value={createEmployee}
                onChange={e => setCreateEmployee(e.target.value)}
                className="input"
              >
                <option value="">— vyberte uživatele —</option>
                {DEMO_TEAM.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.position}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Druh dokumentu (sloupec v Přehledu smluv)</label>
              <select value={createDocType} onChange={e => setCreateDocType(e.target.value)} className="input">
                {CONTRACT_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Placeholders */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* zaměstnavatele doplní šablona sama, jméno se bere z výběru zaměstnance */}
              {createTemplate.placeholders.filter(k => k !== 'ZAMESTNAVATEL' && k !== 'JMENO').map(key => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {PLACEHOLDER_LABELS[key] ?? placeholderLabel(key, createTemplate.labels)}
                  </label>
                  <input
                    className="input"
                    value={createValues[key] ?? ''}
                    onChange={e => setCreateValues(v => ({ ...v, [key]: e.target.value }))}
                    placeholder={placeholderLabel(key, createTemplate.labels)}
                  />
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Interní poznámka (volitelná)</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={createNotes}
                onChange={e => setCreateNotes(e.target.value)}
                placeholder="Např. navýšení mzdy po zkušební době..."
              />
            </div>

          </div>


          {/* živý náhled — mění se, jak se vyplňuje */}
          <div className="bg-white border border-[rgba(13,33,79,0.14)] lg:sticky lg:top-4">
            <div className="px-5 py-3 border-b border-[rgba(13,33,79,0.08)]">
              <p className="font-headline text-navy text-[15px]" style={{ fontWeight: 600 }}>Náhled smlouvy</p>
              <p className="text-xs text-navy/55">Takhle bude vypadat · žlutě = ještě nevyplněno</p>
            </div>
            <div className="bg-[#ebe8f6] lg:max-h-[calc(100vh-140px)] overflow-y-auto">
              {draftModel && <ContractDocPreview model={draftModel} />}
            </div>
          </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCreateStep(null)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={submitCreate}
              disabled={!createEmployee}
              className="flex items-center gap-2 px-5 py-2 bg-violet text-white text-sm font-medium hover:bg-violet/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FilePen className="w-4 h-4" />
              {editingId ? 'Uložit změny' : 'Uložit jako návrh'}
            </button>
          </div>
        </div>
      )}

      {/* Vizuál PDF */}
      {tab === 'vizual' && <ContractDesignerClient />}

      {/* Archiv PDF */}
      {tab === 'archiv' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{archived.length === 0 ? 'Žádné nahrané smlouvy.' : `${archived.length} ${archived.length === 1 ? 'smlouva' : archived.length < 5 ? 'smlouvy' : 'smluv'} v archivu`}</p>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet text-white text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Nahrát PDF
            </button>
          </div>

          {archived.length === 0 && (
            <div
              className="border-2 border-dashed border-slate-200 p-12 text-center cursor-pointer hover:border-violet/40 transition-colors"
              onClick={() => setShowUpload(true)}
            >
              <Archive className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">Archiv externích smluv</p>
              <p className="text-slate-300 text-xs mt-1">Nahrajte již podepsané smlouvy ve formátu PDF pro evidenci</p>
              <p className="text-violet text-xs mt-3 font-medium">+ Nahrát první smlouvu</p>
            </div>
          )}

          {archived.length > 0 && (
            <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy">
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Dokument</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Zaměstnanec</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Typ</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Nahráno</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-white/70 uppercase tracking-wider">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {archived.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-navy">{a.name}</p>
                            <p className="text-xs text-slate-400">{a.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-violet flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">
                              {a.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-navy">{a.employeeName}</span>
                        </div>
                        {a.notes && <p className="text-xs text-slate-400 mt-0.5 italic pl-8">{a.notes}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${TYPE_COLOR[a.contractType] ?? 'bg-slate-100 text-slate-600'}`}>
                          {a.contractType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {a.uploadedAt.toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={a.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-navy/5 text-navy text-xs font-medium hover:bg-navy/10 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Otevřít
                          </a>
                          <button
                            onClick={() => deleteArchived(a.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Odstranit z archivu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-headline font-semibold text-navy">Nahrát existující smlouvu</h2>
              <button onClick={() => setShowUpload(false)} className="p-1 text-slate-400 hover:text-navy transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${uploadDrag ? 'border-violet bg-violet/5' : uploadFile ? 'border-mint bg-mint-tint' : 'border-slate-200 hover:border-violet/40'}`}
                onDragOver={e => { e.preventDefault(); setUploadDrag(true) }}
                onDragLeave={() => setUploadDrag(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setUploadFile(f) }}
                />
                {uploadFile ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">{uploadFile.name}</p>
                    <p className="text-xs text-green-500 mt-0.5">{(uploadFile.size / 1024).toFixed(0)} KB · klikněte pro změnu</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">Přetáhněte PDF nebo klikněte</p>
                    <p className="text-xs text-slate-300 mt-0.5">Pouze soubory .pdf</p>
                  </>
                )}
              </div>

              {/* Fields */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Název smlouvy *</label>
                <input
                  className="input"
                  placeholder="Např. Pracovní smlouva — Jan Novák"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Zaměstnanec *</label>
                <select
                  className="input"
                  value={uploadEmployee}
                  onChange={e => setUploadEmployee(e.target.value)}
                >
                  <option value="">— vyberte zaměstnance —</option>
                  {DEMO_TEAM.map(m => (
                    <option key={m.id} value={m.name}>{m.name} — {m.position}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Typ smlouvy</label>
                <select
                  className="input"
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                >
                  {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Poznámka (volitelná)</label>
                <input
                  className="input"
                  placeholder="Např. Podepsáno 1. 1. 2024, archivní kopie"
                  value={uploadNotes}
                  onChange={e => setUploadNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={submitUpload}
                disabled={!uploadFile || !uploadName || !uploadEmployee}
                className="flex items-center gap-2 px-5 py-2 bg-violet text-white text-sm font-medium hover:bg-violet/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Archive className="w-4 h-4" />
                Uložit do archivu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
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
