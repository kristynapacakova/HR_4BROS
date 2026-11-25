'use client'

import { useRef, useState } from 'react'
import { Upload, Eye, Download, Trash2, X, Check, PenLine, ChevronDown, Search } from 'lucide-react'
import { DEMO_TEAM, TEAM_DEPARTMENTS, CONTRACT_TEMPLATES } from '@/lib/mock-data'
import { useFlowContracts, flowAsStored, isFlowItem, flowIdOf, removeFlowContract } from '@/lib/contract-flow-client'
import { useContractTemplates } from '@/lib/contract-template-client'
import { printFlowContract } from '@/lib/print-contract'
import { Avatar, personView, useProfiles } from '@/app/team/teamPeople'
import { departmentColor } from '@/lib/team-colors'
import { pushNotification } from '@/lib/notifications-client'
import { useIsActive } from '@/lib/user-status-client'
import {
  useStoredContracts, addStoredContract, updateStoredContract, removeStoredContract,
  openStoredContract, downloadStoredContract, CONTRACT_DOC_TYPES, type StoredContract, type StoredContractStatus,
} from '@/lib/contract-file-client'

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('cs-CZ') : '—')
const TYPE_BY_EMPLOYMENT: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'IČO' }

/* ── povinné dokumenty podle typu spolupráce (NDA je součástí smlouvy) ── */
type DocKind = { key: string; label: string; type: string; name: (et: string) => string }
const MAIN_NAME: Record<string, string> = { HPP: 'Pracovní smlouva (HPP)', DPP: 'Dohoda o provedení práce', DPC: 'Dohoda o pracovní činnosti', ICO: 'Smlouva o poskytování služeb' }
export const DOC_KINDS: DocKind[] = [
  { key: 'main', label: 'Smlouva', type: '', name: et => MAIN_NAME[et] ?? 'Smlouva' },
  { key: 'wage', label: 'Mzdový výměr', type: 'Mzdový výměr', name: () => 'Mzdový výměr' },
  { key: 'office', label: 'Nájem kanceláře', type: 'Nájem kanceláře', name: () => 'Smlouva o nájmu kancelářského místa' },
  { key: 'dpa', label: 'Zpracovatelská', type: 'Zpracovatelská', name: () => 'Zpracovatelská smlouva' },
  { key: 'handover', label: 'Předávací protokol', type: 'Předávací protokol', name: () => 'Předávací protokol' },
  { key: 'gdpr', label: 'GDPR', type: 'GDPR', name: () => 'Souhlas se zpracováním osobních údajů' },
]
/** HPP: smlouva, mzdový výměr, předávací protokol, GDPR · IČO: smlouva o službách, nájem kanceláře, zpracovatelská, předávací protokol, GDPR · DPP/DPČ: dohoda, předávací protokol, GDPR (k potvrzení) */
export const REQUIRED_BY_TYPE: Record<string, string[]> = {
  HPP: ['main', 'wage', 'handover', 'gdpr'],
  ICO: ['main', 'office', 'dpa', 'handover', 'gdpr'],
  DPP: ['main', 'handover', 'gdpr'],
  DPC: ['main', 'handover', 'gdpr'],
}
const kindType = (k: DocKind, et: string) => (k.key === 'main' ? TYPE_BY_EMPLOYMENT[et] ?? 'Jiné' : k.type)
const matchKind = (k: DocKind) => (c: StoredContract) => (k.key === 'main' ? ['HPP', 'DPP', 'DPČ', 'IČO'].includes(c.type) : c.type === k.type)
const requiredFor = (et: string) => DOC_KINDS.filter(k => (REQUIRED_BY_TYPE[et] ?? ['main', 'gdpr']).includes(k.key))
const isRequiredDoc = (c: StoredContract) => DOC_KINDS.some(k => matchKind(k)(c))

type PState = 'ok' | 'waiting' | 'missing'
/** chybí povinný dokument → chybí; jinak nějaký nepodepsaný → čeká na podpis; jinak v pořádku */
function personState(list: StoredContract[], et: string): PState {
  if (requiredFor(et).some(k => !list.some(matchKind(k)))) return 'missing'
  return list.some(c => c.status === 'UNSIGNED') ? 'waiting' : 'ok'
}
const STATE_UI: Record<PState, { label: string; bar: string }> = {
  missing: { label: 'Chybí dokument', bar: 'bg-navy' },
  waiting: { label: 'Čeká na podpis', bar: 'bg-gold' },
  ok: { label: 'V pořádku', bar: 'bg-[rgba(13,33,79,0.08)]' },
}

/** značky stavu dokumentu — stejné v buňkách i ve vysvětlivkách */
function Mark({ kind, small }: { kind: 'ok' | 'sign' | 'missing' | 'na'; small?: boolean }) {
  const box = small ? 'w-4 h-4' : 'w-7 h-7'
  const ic = small ? 'w-3 h-3' : 'w-4 h-4'
  if (kind === 'ok') return <span className={`${box} flex items-center justify-center text-navy/45`}><Check className={ic} /></span>
  if (kind === 'sign') return <span className={`${box} flex items-center justify-center bg-gold text-navy`}><PenLine className={small ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} /></span>
  if (kind === 'missing') return <span className={`${box} flex items-center justify-center bg-navy text-white`}><X className={ic} /></span>
  return <span className={`${box} flex items-center justify-center text-navy/20`}>–</span>
}

const GRID = 'grid grid-cols-[minmax(190px,1.3fr)_repeat(6,104px)_minmax(120px,1fr)_80px] gap-2'

/** Přehled smluv všech uživatelů po týmech — na první pohled vidět, co komu chybí nebo čeká na podpis. */
export function ContractOverview() {
  const profiles = useProfiles()
  const uploaded = useStoredContracts()
  // + smlouvy vytvořené ze šablony (od odeslání jednateli; podepsané uživatelem = podepsáno)
  const flow = useFlowContracts()
  const templates = useContractTemplates(CONTRACT_TEMPLATES)
  const contracts = [...uploaded, ...flow.map(flowAsStored).filter((x): x is StoredContract => !!x)]
  const flowOf = (c: StoredContract) => flow.find(f => f.id === flowIdOf(c))
  const openDoc = (c: StoredContract) => { const f = isFlowItem(c) ? flowOf(c) : null; if (f) printFlowContract(f, templates); else openStoredContract(c) }
  const downloadDoc = (c: StoredContract) => { const f = isFlowItem(c) ? flowOf(c) : null; if (f) printFlowContract(f, templates); else downloadStoredContract(c) }
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<PState | ''>('')
  const [hideOk, setHideOk] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [upload, setUpload] = useState<{ personId: string; type?: string; name?: string } | null>(null)

  const isActive = useIsActive()
  // neaktivní uživatelé (Admin → Uživatelé) se v přehledu neukazují; jejich smlouvy zůstávají uložené
  const TEAM = DEMO_TEAM.filter(m => isActive(m.id))
  const of = (id: string) => contracts.filter(c => c.personId === id)
  const stateOf = (m: typeof DEMO_TEAM[number]) => personState(of(m.id), m.employmentType)
  const person = (id: string) => { const m = DEMO_TEAM.find(x => x.id === id)!; return personView(m, profiles[m.id]) }
  const counts = { missing: 0, waiting: 0, ok: 0 } as Record<PState, number>
  TEAM.forEach(m => { counts[stateOf(m)]++ })
  const q = query.trim().toLowerCase()
  const people = [...TEAM]
    .filter(m => !q || m.name.toLowerCase().includes(q))
    .filter(m => !stateFilter || stateOf(m) === stateFilter)
    .filter(m => !hideOk || stateOf(m) !== 'ok')
    .sort((a, b) => a.name.localeCompare(b.name, 'cs'))

  /** buňka dokumentu — vždy ve stejném sloupci, ať jsou chybějící vidět pod sebou */
  const DocCell = ({ m, k }: { m: typeof DEMO_TEAM[number]; k: DocKind }) => {
    if (!requiredFor(m.employmentType).includes(k)) return <span className="flex justify-center" title="Netýká se"><Mark kind="na" /></span>
    const items = of(m.id).filter(matchKind(k))
    if (!items.length) {
      return (
        <button type="button" onClick={() => setUpload({ personId: m.id, type: kindType(k, m.employmentType), name: k.name(m.employmentType) })} title={`${k.name(m.employmentType)} chybí — nahrát`} className="flex justify-center hover:opacity-80">
          <Mark kind="missing" />
        </button>
      )
    }
    const waiting = items.find(c => c.status === 'UNSIGNED')
    return waiting
      ? <button type="button" onClick={() => setOpenId(m.id)} title={`${waiting.name} — čeká na podpis`} className="flex justify-center hover:opacity-80"><Mark kind="sign" /></button>
      : <span className="flex justify-center" title={`${items.map(c => c.name).join(', ')} — podepsáno`}><Mark kind="ok" /></span>
  }

  return (
    <div className="space-y-4">
      {/* souhrn — kliknutím filtruje */}
      <div className="grid grid-cols-3 gap-3">
        {(['missing', 'waiting', 'ok'] as PState[]).map(k => (
          <button key={k} type="button" onClick={() => setStateFilter(f => (f === k ? '' : k))}
            className={`text-left p-4 border transition-colors ${stateFilter === k ? 'border-navy bg-navy text-white' : 'border-[rgba(13,33,79,0.14)] bg-white text-navy hover:border-navy'}`}>
            <span className="flex items-center gap-2 text-xs font-semibold"><span className={`w-3 h-3 ${STATE_UI[k].bar}`} />{STATE_UI[k].label}</span>
            <span className="block font-headline text-[30px] leading-tight mt-1" style={{ fontWeight: 600 }}>{counts[k]}</span>
            <span className={`text-[11px] ${stateFilter === k ? 'text-white/60' : 'text-navy/50'}`}>{counts[k] === 1 ? 'uživatel' : counts[k] < 5 && counts[k] > 0 ? 'uživatelé' : 'uživatelů'}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-navy/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Hledat uživatele" className="w-full border border-[rgba(13,33,79,0.25)] bg-white pl-9 pr-3 py-2 text-sm text-navy focus:outline-none focus:border-violet" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-navy cursor-pointer">
          <input type="checkbox" checked={hideOk} onChange={e => setHideOk(e.target.checked)} className="w-4 h-4 accent-violet" />
          Skrýt uživatele, kteří mají vše v pořádku
        </label>
        <button type="button" onClick={() => setUpload({ personId: '' })} className="ml-auto inline-flex items-center gap-2 bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-violet"><Upload className="w-4 h-4" />Nahrát smlouvu</button>
      </div>

      {people.length === 0 && <p className="bg-white border border-[rgba(13,33,79,0.14)] px-5 py-6 text-sm text-navy/50 text-center">Nikdo neodpovídá filtru.</p>}

      {TEAM_DEPARTMENTS.map(dept => {
        const all = TEAM.filter(m => m.department === dept)
        const members = people.filter(m => m.department === dept)
        if (!members.length) return null
        const states = all.map(stateOf)
        const okCount = states.filter(s => s === 'ok').length
        const problems = all.length - okCount
        const isCollapsed = collapsed[dept] ?? false
        return (
          <section key={dept} className="bg-white border border-[rgba(13,33,79,0.14)]">
            {/* hlavička týmu se souhrnem */}
            <button type="button" onClick={() => setCollapsed(c => ({ ...c, [dept]: !isCollapsed }))}
              className="w-full flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-left hover:bg-alice/40">
              <span className="w-3 h-3 flex-shrink-0" style={{ background: departmentColor(dept) }} />
              <span className="font-headline text-navy text-[16px]" style={{ fontWeight: 600 }}>{dept}</span>
              <span className="text-sm text-navy/55"><b className="text-navy">{okCount}</b> / {all.length} v pořádku</span>
              {problems > 0
                ? <span className="text-[10px] font-bold uppercase tracking-[0.06em] bg-navy text-white px-1.5 py-0.5">{problems} řešit</span>
                : <span className="text-[11px] text-navy/45">✓ vše hotovo</span>}
              <span className="flex gap-0.5 ml-auto">
                {states.map((s, i) => <span key={i} className={`w-3 h-3 ${STATE_UI[s].bar}`} />)}
              </span>
              <ChevronDown className={`w-4 h-4 text-navy/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
            </button>

            {!isCollapsed && (
              <div className="overflow-x-auto"><div className="min-w-[1100px]">
                {/* záhlaví sloupců */}
                <div className={`${GRID} items-center px-5 py-3 border-t border-[rgba(13,33,79,0.08)] text-[11px] font-semibold whitespace-nowrap text-navy/50`}>
                  <span>Uživatel</span>
                  {DOC_KINDS.map(k => <span key={k.key} className="text-center">{k.label}</span>)}
                  <span>Další dokumenty</span>
                  <span />
                </div>
                <ul>
                  {members.map(m => {
                    const list = of(m.id)
                    const extras = list.filter(c => !isRequiredDoc(c))
                    const expanded = openId === m.id
                    const missingKinds = requiredFor(m.employmentType).filter(k => !list.some(matchKind(k)))
                    return (
                      <li key={m.id} className="border-t border-[rgba(13,33,79,0.06)]">
                        <div className={`${GRID} items-center px-5 py-2`}>
                          <button type="button" onClick={() => setOpenId(expanded ? null : m.id)} className="flex items-center gap-3 text-left group min-w-0">
                            <Avatar p={person(m.id)} size={32} fontSize={11} />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-navy truncate group-hover:text-violet">{m.name}</span>
                              <span className="block text-[11px] text-navy/50 truncate"><b className="font-semibold text-navy/70">{TYPE_BY_EMPLOYMENT[m.employmentType]}</b> · {m.position}</span>
                            </span>
                          </button>
                          {DOC_KINDS.map(k => <DocCell key={k.key} m={m} k={k} />)}
                          <span className="flex flex-wrap gap-1.5">
                            {extras.length === 0 && <span className="text-[11px] text-navy/30">—</span>}
                            {extras.map(c => (
                              <button key={c.id} type="button" onClick={() => setOpenId(m.id)} title={c.name}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border max-w-[160px] ${c.status === 'SIGNED' ? 'border-[rgba(13,33,79,0.14)] text-navy/65' : 'border-gold bg-gold text-navy'}`}>
                                {c.status === 'SIGNED' ? <Check className="w-3 h-3 flex-shrink-0" /> : <PenLine className="w-3 h-3 flex-shrink-0" />}
                                <span className="truncate">{c.name.replace(/ —.*/, '')}</span>
                              </button>
                            ))}
                          </span>
                          <button type="button" onClick={() => setUpload({ personId: m.id })} title="Nahrát dokument" className="text-xs font-semibold text-navy/55 hover:text-violet inline-flex items-center gap-1"><Upload className="w-3.5 h-3.5" />Nahrát</button>
                        </div>
                        {expanded && (
                          <div className="px-5 pb-4">
                            <ul className="ml-11 bg-white border border-[rgba(13,33,79,0.1)] divide-y divide-[rgba(13,33,79,0.06)]">
                              {list.length === 0 && missingKinds.length === 0 && <li className="px-4 py-3 text-sm text-navy/50">Zatím žádné dokumenty.</li>}
                              {list.map(c => (
                                <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                                  <span className="flex-1 min-w-[200px] text-sm text-navy"><b className="font-semibold">{c.name}</b> <span className="text-navy/50 text-xs">· {c.type}{c.signedAt ? ` · podepsáno ${fmtDate(c.signedAt)}` : ''} · nahráno {fmtDate(c.uploadedAt)}</span></span>
                                  {c.status !== 'SIGNED' && isFlowItem(c)
                                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] bg-gold text-navy px-1.5 py-0.5"><PenLine className="w-3 h-3" />{c.notes}</span>
                                    : c.status === 'SIGNED'
                                    ? <span className="inline-flex items-center gap-1 text-[11px] text-navy/55"><Check className="w-3 h-3" />Podepsaná</span>
                                    : <button type="button" onClick={() => updateStoredContract(c.id, { status: 'SIGNED', signedAt: new Date().toISOString().slice(0, 10) })} title="Označit jako podepsanou" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] bg-gold text-navy px-1.5 py-0.5 hover:bg-navy hover:text-white"><PenLine className="w-3 h-3" />Čeká na podpis · označit ✓</button>}
                                  <button type="button" onClick={() => openDoc(c)} className="p-1 text-navy/50 hover:text-navy" title="Otevřít"><Eye className="w-4 h-4" /></button>
                                  <button type="button" onClick={() => downloadDoc(c)} className="p-1 text-navy/50 hover:text-navy" title={isFlowItem(c) ? 'Stáhnout PDF' : 'Stáhnout'}><Download className="w-4 h-4" /></button>
                                  {isFlowItem(c)
                                    ? <button type="button" onClick={() => { if (confirm(c.status === 'SIGNED' ? `Smazat PODEPSANOU smlouvu „${c.name}“ u uživatele ${m.name}?\n\nZmizí i z jeho Dokumentů. Nejde to vrátit.` : `Smazat nepodepsanou smlouvu „${c.name}“ u uživatele ${m.name}?`)) removeFlowContract(flowIdOf(c)) }} className="p-1 text-navy/35 hover:text-navy" title="Smazat (jen HR)"><Trash2 className="w-4 h-4" /></button>
                                    : <button type="button" onClick={() => { if (confirm(`Smazat „${c.name}“ u uživatele ${m.name}?\n\nSoubor zmizí i z jeho Dokumentů. Nejde to vrátit.`)) removeStoredContract(c.id) }} className="p-1 text-navy/35 hover:text-navy" title="Smazat (jen HR)"><Trash2 className="w-4 h-4" /></button>}
                                </li>
                              ))}
                              {missingKinds.map(k => (
                                <li key={k.key} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                  <Mark kind="missing" small />
                                  <span className="flex-1 text-navy/60">{k.name(m.employmentType)} — chybí</span>
                                  <button type="button" onClick={() => setUpload({ personId: m.id, type: kindType(k, m.employmentType), name: k.name(m.employmentType) })} className="text-xs font-semibold bg-navy text-white px-3 py-1.5 hover:bg-violet">Nahrát</button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div></div>
            )}
          </section>
        )
      })}

      {/* vysvětlivky */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-navy/55">
        <span className="inline-flex items-center gap-1"><Mark kind="ok" small />podepsáno</span>
        <span className="inline-flex items-center gap-1"><Mark kind="sign" small />čeká na podpis</span>
        <span className="inline-flex items-center gap-1"><Mark kind="missing" small />chybí povinný dokument — klikni a nahraj</span>
        <span className="inline-flex items-center gap-1"><Mark kind="na" small />netýká se</span>
      </div>

      {upload && <UploadModal key={JSON.stringify(upload)} people={[...DEMO_TEAM].sort((a, b) => a.name.localeCompare(b.name, 'cs'))} presetPerson={upload.personId} presetType={upload.type} presetName={upload.name} onClose={() => setUpload(null)} />}
    </div>
  )
}

export function UploadModal({ people, presetPerson, presetType, presetName, onClose }: { people: typeof DEMO_TEAM; presetPerson: string; presetType?: string; presetName?: string; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [personId, setPersonId] = useState(presetPerson)
  const [name, setName] = useState(presetName ?? '')
  const [type, setType] = useState<string>(() => {
    if (presetType) return presetType
    const m = people.find(x => x.id === presetPerson)
    return m ? (TYPE_BY_EMPLOYMENT[m.employmentType] ?? 'Jiné') : 'HPP'
  })
  const [status, setStatus] = useState<StoredContractStatus>('SIGNED')
  const [signedAt, setSignedAt] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [drag, setDrag] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = (f?: File | null) => {
    if (!f) return
    setFile(f)
    if (!name) setName(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '))
  }
  const choosePerson = (id: string) => {
    setPersonId(id)
    const m = people.find(x => x.id === id)
    if (m) setType(TYPE_BY_EMPLOYMENT[m.employmentType] ?? type)
  }
  const ok = file && personId && name.trim()

  async function save() {
    if (!ok) return
    setSaving(true)
    await addStoredContract({ personId, name: name.trim(), type, status, signedAt: status === 'SIGNED' ? signedAt : null, notes: notes.trim() }, file!)
    const m = people.find(x => x.id === personId)
    if (m) pushNotification({ recipientEmail: m.email, title: 'Nová smlouva v Dokumentech', body: `${name.trim()} — najdeš ji v Můj účet → Dokumenty.`, href: '/profile?tab=dokumenty' })
    setSaving(false)
    onClose()
  }

  const label = 'block text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60 mb-1'
  const input = 'w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-violet'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60">
      <div className="bg-white border border-navy w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(13,33,79,0.14)]">
          <p className="font-headline text-navy text-[17px]" style={{ fontWeight: 600 }}>Nahrát smlouvu</p>
          <button type="button" onClick={onClose} aria-label="Zavřít" className="text-navy/60 hover:text-navy"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${drag ? 'border-violet bg-alice' : 'border-navy/25 hover:border-navy'}`}
          >
            <input ref={inputRef} type="file" accept="application/pdf,.pdf,image/*" className="hidden" onChange={e => pick(e.target.files?.[0])} />
            <Upload className="w-5 h-5 mx-auto text-navy/50" />
            <p className="text-sm text-navy mt-1">{file ? <b>{file.name}</b> : 'Přetáhni PDF nebo sken sem, nebo klikni'}</p>
          </div>
          <div>
            <label className={label}>Uživatel</label>
            <select value={personId} onChange={e => choosePerson(e.target.value)} className={input}>
              <option value="">Vyber uživatele</option>
              {people.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Název smlouvy</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="např. Pracovní smlouva, Dodatek č. 1" className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Typ</label>
              <select value={type} onChange={e => setType(e.target.value)} className={input}>
                {CONTRACT_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Stav</label>
              <select value={status} onChange={e => setStatus(e.target.value as StoredContractStatus)} className={input}>
                <option value="SIGNED">Podepsaná</option>
                <option value="UNSIGNED">Čeká na podpis</option>
              </select>
            </div>
          </div>
          {status === 'SIGNED' && (
            <div>
              <label className={label}>Datum podpisu</label>
              <input type="date" value={signedAt} onChange={e => setSignedAt(e.target.value)} className={input} />
            </div>
          )}
          <div>
            <label className={label}>Poznámka (nepovinné)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className={input} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[rgba(13,33,79,0.14)]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-navy border border-navy/30 hover:border-navy">Zrušit</button>
          <button type="button" onClick={save} disabled={!ok || saving} className="px-5 py-2 text-sm font-semibold bg-navy text-white hover:bg-violet disabled:opacity-40">
            {saving ? 'Ukládám…' : 'Uložit smlouvu'}
          </button>
        </div>
      </div>
    </div>
  )
}
