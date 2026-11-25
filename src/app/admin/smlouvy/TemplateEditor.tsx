'use client'

import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, Upload, Trash2, Eye, Save } from 'lucide-react'
import type { Contract, ContractTemplate } from '@/lib/mock-data'
import { templateTextToHtml, templateHtmlToText, docxToTemplateText, plainFileToTemplateText } from '@/lib/template-text'
import { saveContractTemplate, removeContractTemplate } from '@/lib/contract-template-client'
import { contractDocModel } from '@/lib/print-contract'
import { openContractDocPrint, placeholderLabel } from '@/lib/contract-doc'
import { ContractDocPreview } from '@/components/ContractDocPreview'

const TYPES: [string, string][] = [['HPP', 'HPP'], ['DPP', 'DPP'], ['DPC', 'DPČ'], ['ICO', 'IČO'], ['OBECNA', 'Dodatek / obecná']]

const EXAMPLE = `# Pracovní smlouva

## Předmět smlouvy
1.1 Zaměstnavatel přijímá zaměstnance na pozici [pozice] s místem výkonu práce [místo výkonu práce].

## Mzda
2.1 Zaměstnanci náleží základní měsíční mzda ve výši **[mzda]**.

## Povinnosti zaměstnance
Zaměstnanec se zavazuje zejména:
- dodržovat pracovní dobu,
- chránit důvěrné informace.`

/** Nahrání / úprava šablony smlouvy — vlevo text, vpravo živý náhled ve vizuálu 4Bros 2026. */
export function TemplateEditor({ template, onClose }: { template: ContractTemplate | null; onClose: () => void }) {
  const isNew = !template
  const [name, setName] = useState(template?.name ?? '')
  const [type, setType] = useState(template?.type ?? 'HPP')
  const [description, setDescription] = useState(template?.description ?? '')
  const [text, setText] = useState(() => (template ? templateHtmlToText(template.body, template.labels) : ''))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const parsed = useMemo(() => templateTextToHtml(text || ''), [text])
  const draft: ContractTemplate = {
    id: template?.id ?? `tpl-custom-${Date.now()}`,
    name: name.trim() || parsed.title || 'Nová šablona',
    type, description: description.trim(),
    body: parsed.body, placeholders: parsed.placeholders, labels: parsed.labels,
    custom: template?.custom ?? true,
    createdAt: template?.createdAt ?? new Date(),
  }
  const sample: Contract = {
    id: 'preview', templateId: draft.id, templateName: draft.name, employeeId: 'preview', employeeName: '',
    status: 'DRAFT', createdAt: new Date(), sentToManagementAt: null, managementSignedAt: null, managementSignedBy: null,
    sentToEmployeeAt: null, employeeSignedAt: null, values: {}, notes: null,
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const model = useMemo(() => contractDocModel(sample, draft), [parsed, name, type])

  async function load(file?: File | null) {
    if (!file) return
    setErr(''); setBusy(true)
    try {
      const t = /\.docx$/i.test(file.name) ? await docxToTemplateText(file) : await plainFileToTemplateText(file)
      setText(t)
      if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Soubor se nepodařilo načíst.')
    } finally { setBusy(false) }
  }

  const save = () => { saveContractTemplate(draft); onClose() }
  const del = () => { if (template && confirm(`Smazat šablonu „${template.name}“?`)) { removeContractTemplate(template.id); onClose() } }
  const label = 'block text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60 mb-1'
  const input = 'w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-violet'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onClose} className="p-1.5 text-navy/50 hover:text-navy" aria-label="Zpět"><ArrowLeft className="w-4 h-4" /></button>
        <h3 className="font-headline text-navy text-[17px]" style={{ fontWeight: 600 }}>{isNew ? 'Nová šablona' : `Upravit šablonu — ${template.name}`}</h3>
        <div className="ml-auto flex items-center gap-2">
          {template && template.custom && <button type="button" onClick={del} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-navy/55 hover:text-navy"><Trash2 className="w-4 h-4" />Smazat</button>}
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-navy/60 hover:text-navy">Zrušit</button>
          <button type="button" onClick={save} disabled={!parsed.body} className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-violet disabled:opacity-40"><Save className="w-4 h-4" />Uložit šablonu</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(340px,1fr)_minmax(0,1.15fr)] gap-5 items-start">
        {/* vlevo: údaje a text */}
        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-5 space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); load(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${drag ? 'border-violet bg-alice' : 'border-navy/25 hover:border-navy'}`}
          >
            <input ref={fileRef} type="file" accept=".docx,.txt,.md" className="hidden" onChange={e => load(e.target.files?.[0])} />
            <Upload className="w-5 h-5 mx-auto text-navy/50" />
            <p className="text-sm text-navy mt-1">{busy ? 'Načítám…' : <>Nahraj šablonu z <b>Wordu (.docx)</b> nebo textu — přetáhni sem nebo klikni</>}</p>
            <p className="text-[11px] text-navy/50 mt-0.5">Text se převezme beze změny, vzhled dodá šablona 4Bros. Pak ho můžeš doladit níž.</p>
            {err && <p className="text-[12px] text-navy font-semibold mt-1">{err}</p>}
          </div>

          <div className="grid grid-cols-[1fr_150px] gap-3">
            <label className="block"><span className={label}>Název šablony</span><input value={name} onChange={e => setName(e.target.value)} placeholder="např. Smlouva o poskytování služeb" className={input} /></label>
            <label className="block"><span className={label}>Typ</span>
              <select value={type} onChange={e => setType(e.target.value)} className={input}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
          </div>
          <label className="block"><span className={label}>Popis (nepovinné)</span><input value={description} onChange={e => setDescription(e.target.value)} placeholder="Kdy se šablona používá" className={input} /></label>

          <label className="block">
            <span className={label}>Text šablony</span>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={18} placeholder={EXAMPLE} spellCheck={false}
              className={`${input} font-mono text-[12.5px] leading-relaxed resize-y`} />
          </label>
          <div className="text-[11.5px] text-navy/60 leading-relaxed bg-alice/60 px-3 py-2.5">
            <p className="font-semibold text-navy mb-1">Jak psát šablonu</p>
            <p><code># Název</code> — název dokumentu · <code>## Název článku</code> — nový článek (čísluje se sám)</p>
            <p><code>1.1 text</code> — číslovaný bod · <code>- text</code> — odrážka · <code>**text**</code> — tučně</p>
            <p><code>[Jméno a příjmení]</code> — pole, které se vyplní při vytváření smlouvy (jinak zůstane žlutě)</p>
          </div>
          {parsed.placeholders.length > 0 && (
            <div>
              <p className={label}>Pole k doplnění ({parsed.placeholders.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.placeholders.map(k => <span key={k} className="text-[11px] bg-gold text-navy px-1.5 py-0.5">{placeholderLabel(k, parsed.labels)}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* vpravo: náhled */}
        <div className="bg-white border border-[rgba(13,33,79,0.14)] lg:sticky lg:top-4">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[rgba(13,33,79,0.08)]">
            <div>
              <p className="font-headline text-navy text-[15px]" style={{ fontWeight: 600 }}>Náhled</p>
              <p className="text-xs text-navy/55">Takhle bude smlouva vypadat — mění se, jak píšeš</p>
            </div>
            <button type="button" onClick={() => openContractDocPrint(model)} disabled={!parsed.body} className="inline-flex items-center gap-2 border border-navy text-navy px-3 py-1.5 text-sm font-semibold hover:bg-navy hover:text-white disabled:opacity-40"><Eye className="w-4 h-4" />Jako PDF</button>
          </div>
          <div className="bg-[#ebe8f6] lg:max-h-[calc(100vh-140px)] overflow-y-auto">
            {parsed.body
              ? <ContractDocPreview model={model} />
              : <p className="px-6 py-16 text-center text-sm text-navy/50">Nahraj soubor nebo začni psát — náhled se ukáže tady.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
