'use client'

import { useMemo, useRef, useState } from 'react'
import { Upload, Eye, Download, Trash2, X } from 'lucide-react'
import { DEMO_TEAM } from '@/lib/mock-data'
import { Avatar, personView, useProfiles } from '@/app/team/teamPeople'
import { pushNotification } from '@/lib/notifications-client'
import {
  useStoredContracts, addStoredContract, updateStoredContract, removeStoredContract,
  openStoredContract, downloadStoredContract, CONTRACT_DOC_TYPES, type StoredContractStatus,
} from '@/lib/contract-file-client'

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('cs-CZ') : '—')
const TYPE_BY_EMPLOYMENT: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ', ICO: 'IČO' }

/** Přehled všech smluv všech lidí + nahrání podepsané (naskenované) smlouvy k člověku. */
export function ContractOverview() {
  const profiles = useProfiles()
  const contracts = useStoredContracts()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | StoredContractStatus | 'NONE'>('')
  const [showUpload, setShowUpload] = useState(false)
  const [presetPerson, setPresetPerson] = useState('')

  const people = [...DEMO_TEAM].sort((a, b) => a.name.localeCompare(b.name, 'cs'))
  const person = (id: string) => { const m = DEMO_TEAM.find(x => x.id === id)!; return personView(m, profiles[m.id]) }

  const rows = useMemo(() => people
    .filter(m => !query.trim() || m.name.toLowerCase().includes(query.trim().toLowerCase()))
    .map(m => ({ m, list: contracts.filter(c => c.personId === m.id) }))
    .filter(({ list }) => statusFilter === '' ? true : statusFilter === 'NONE' ? list.length === 0 : list.some(c => c.status === statusFilter))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [contracts, query, statusFilter])
  // bez výběru se otevře první člověk ze seznamu
  const selectedId = selected || rows[0]?.m.id || ''
  const sel = DEMO_TEAM.find(m => m.id === selectedId) ?? null
  const selList = contracts.filter(c => c.personId === selectedId)

  const signed = contracts.filter(c => c.status === 'SIGNED').length
  const unsigned = contracts.filter(c => c.status === 'UNSIGNED').length
  const withNone = people.filter(m => !contracts.some(c => c.personId === m.id)).length

  return (
    <div className="space-y-5">
      {/* souhrn + akce */}
      <div className="flex flex-wrap items-stretch gap-3">
        {[
          { k: 'SIGNED' as const, l: 'Podepsané', n: signed, cls: 'bg-mint' },
          { k: 'UNSIGNED' as const, l: 'Čeká na podpis', n: unsigned, cls: 'bg-gold' },
          { k: 'NONE' as const, l: 'Lidé bez smlouvy v portálu', n: withNone, cls: 'bg-alice' },
        ].map(t => (
          <button key={t.k} type="button" onClick={() => setStatusFilter(f => (f === t.k ? '' : t.k))}
            className={`text-left px-5 py-3 border min-w-[170px] transition-colors ${statusFilter === t.k ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-[rgba(13,33,79,0.14)] hover:border-navy'}`}>
            <span className="flex items-center gap-2 text-xs font-semibold"><span className={`w-2.5 h-2.5 ${t.cls}`} />{t.l}</span>
            <span className="block font-headline text-[26px] leading-tight mt-1" style={{ fontWeight: 600 }}>{t.n}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button type="button" onClick={() => { setPresetPerson(''); setShowUpload(true) }}
          className="self-center flex items-center gap-2 px-5 py-3 bg-navy text-white text-sm font-semibold hover:bg-violet transition-colors">
          <Upload className="w-4 h-4" /> Nahrát smlouvu
        </button>
      </div>

      {/* vlevo lidé, vpravo karta vybraného člověka se všemi smlouvami */}
      <div className="grid lg:grid-cols-[320px_1fr] gap-5 items-start">
        <section className="bg-white border border-[rgba(13,33,79,0.14)]">
          <div className="p-3 border-b border-[rgba(13,33,79,0.08)]">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Hledat člověka…" className="w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy focus:outline-none focus:border-violet" />
          </div>
          <ul className="max-h-[560px] overflow-y-auto divide-y divide-[rgba(13,33,79,0.08)]">
            {rows.length === 0 && <li className="px-4 py-6 text-sm text-navy/55 text-center">Nic neodpovídá filtru.</li>}
            {rows.map(({ m, list }) => {
              const p = person(m.id)
              const nSigned = list.filter(c => c.status === 'SIGNED').length
              const nWaiting = list.length - nSigned
              const active = selectedId === m.id
              return (
                <li key={m.id}>
                  <button type="button" onClick={() => setSelected(m.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active ? 'bg-alice' : 'hover:bg-alice/50'}`}>
                    <Avatar p={p} size={34} fontSize={11} />
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold truncate ${active ? 'text-violet' : 'text-navy'}`}>{m.name}</span>
                      <span className="block text-[11px] text-navy/55">{TYPE_BY_EMPLOYMENT[m.employmentType] ?? m.employmentType} · {m.department}</span>
                    </span>
                    {list.length === 0
                      ? <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-navy/40">žádná</span>
                      : <span className="flex items-center gap-1">
                          {nSigned > 0 && <span className="text-[10px] font-bold bg-mint text-navy px-1.5 py-0.5" title="Podepsané">{nSigned}</span>}
                          {nWaiting > 0 && <span className="text-[10px] font-bold bg-gold text-navy px-1.5 py-0.5" title="Čeká na podpis">{nWaiting}</span>}
                        </span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="bg-white border border-[rgba(13,33,79,0.14)] min-h-[300px]">
          {!sel ? (
            <div className="h-full min-h-[300px] flex items-center justify-center text-sm text-navy/50 p-8 text-center">Vyber vlevo člověka — uvidíš všechny jeho smlouvy a můžeš nahrát další.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 px-6 py-5 border-b border-[rgba(13,33,79,0.08)]">
                <Avatar p={person(sel.id)} size={52} fontSize={16} />
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-navy text-[20px] leading-tight" style={{ fontWeight: 600 }}>{sel.name}</p>
                  <p className="text-sm text-navy/60">{sel.position} · {TYPE_BY_EMPLOYMENT[sel.employmentType] ?? sel.employmentType} · nástup {fmtDate(sel.startDate.toISOString())}</p>
                </div>
                <button type="button" onClick={() => { setPresetPerson(sel.id); setShowUpload(true) }} className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold hover:bg-violet transition-colors">
                  <Upload className="w-4 h-4" /> Nahrát smlouvu
                </button>
              </div>
              {selList.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-navy/55">Zatím tu nemá žádnou smlouvu. Nahraj první — podepsanou nebo naskenovanou.</div>
              ) : (
                <ul className="divide-y divide-[rgba(13,33,79,0.08)]">
                  {selList.map(c => (
                    <li key={c.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                      <span className="flex-1 min-w-[200px]">
                        <button type="button" onClick={() => openStoredContract(c)} className="block font-semibold text-navy hover:text-violet text-left">{c.name}</button>
                        <span className="block text-[11px] text-navy/55">{c.type} · nahráno {fmtDate(c.uploadedAt)}{c.notes ? ` · ${c.notes}` : ''}</span>
                      </span>
                      {c.status === 'SIGNED' ? (
                        <span className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.06em] bg-mint text-navy px-2 py-1">Podepsaná {fmtDate(c.signedAt)}</span>
                          <button type="button" onClick={() => updateStoredContract(c.id, { status: 'UNSIGNED', signedAt: null })} className="text-[11px] text-navy/45 hover:text-navy">zrušit podpis</button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => updateStoredContract(c.id, { status: 'SIGNED', signedAt: new Date().toISOString().slice(0, 10) })}
                          className="text-[11px] font-bold uppercase tracking-[0.06em] bg-gold text-navy px-2.5 py-1.5 hover:bg-navy hover:text-white" title="Označit jako podepsanou">
                          Čeká na podpis · označit jako podepsanou ✓
                        </button>
                      )}
                      <span className="flex items-center">
                        <button type="button" onClick={() => openStoredContract(c)} title="Otevřít" className="p-1.5 text-navy/50 hover:text-navy"><Eye className="w-4 h-4" /></button>
                        <button type="button" onClick={() => downloadStoredContract(c)} title="Stáhnout" className="p-1.5 text-navy/50 hover:text-navy"><Download className="w-4 h-4" /></button>
                        <button type="button" onClick={() => { if (confirm(`Smazat smlouvu „${c.name}“ (${sel.name})?`)) removeStoredContract(c.id) }} title="Smazat" className="p-1.5 text-navy/50 hover:text-navy"><Trash2 className="w-4 h-4" /></button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
      <p className="text-xs text-navy/45">Demo — soubory se zatím ukládají jen v tomto prohlížeči. Po napojení se uloží do úložiště a uvidí je i daný člověk v Můj účet → Dokumenty na svém zařízení.</p>

      {showUpload && <UploadModal people={people} presetPerson={presetPerson} onClose={() => setShowUpload(false)} />}
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
