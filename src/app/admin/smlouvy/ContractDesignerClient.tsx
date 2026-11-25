'use client'

import { useState, useEffect, useMemo } from 'react'
import { RotateCcw, Save, Eye } from 'lucide-react'
import { CONTRACT_TEMPLATES, DEMO_CONTRACTS } from '@/lib/mock-data'
import { contractDocModel } from '@/lib/print-contract'
import { DOC_COMPANY_DEFAULT, openContractDocPrint } from '@/lib/contract-doc'
import { ContractDocPreview } from '@/components/ContractDocPreview'

export interface TypographyStyle {
  fontFamily: 'serenity' | 'roboto' | 'georgia'
  fontSize: number
  fontWeight: 300 | 400 | 500 | 600 | 700
  italic: boolean
}

export interface ContractDesign {
  logoDataUrl: string | null
  decorDataUrl: string | null
  primaryColor: string
  accentColor: string
  /** @deprecated use typo.heading.fontFamily */
  fontFamily: 'serenity' | 'roboto' | 'georgia'
  companyName: string
  companyAddress: string
  companyIco: string
  typo: {
    heading: TypographyStyle
    subheading: TypographyStyle
    body: TypographyStyle
  }
}

// v2 = šablona 4Bros 2026 (staré uložené údaje z předchozího vizuálu se nepoužijí)
const DESIGN_KEY = 'fourBros_contractDesign_v2'

const DEFAULT_HEADING: TypographyStyle = { fontFamily: 'serenity', fontSize: 13, fontWeight: 500, italic: false }
const DEFAULT_SUBHEADING: TypographyStyle = { fontFamily: 'roboto', fontSize: 12, fontWeight: 700, italic: false }
const DEFAULT_BODY: TypographyStyle = { fontFamily: 'roboto', fontSize: 12, fontWeight: 300, italic: false }

export const DEFAULT_DESIGN: ContractDesign = {
  logoDataUrl: null,
  decorDataUrl: null,
  primaryColor: '#0d214f',
  accentColor: '#834dfb',
  fontFamily: 'serenity',
  companyName: 'Four Bros s.r.o.',
  companyAddress: 'Křídlovická 371/68, 603 00 Brno',
  companyIco: '05834252',
  typo: {
    heading: DEFAULT_HEADING,
    subheading: DEFAULT_SUBHEADING,
    body: DEFAULT_BODY,
  },
}

export function loadDesign(): ContractDesign {
  if (typeof window === 'undefined') return DEFAULT_DESIGN
  try {
    const raw = localStorage.getItem(DESIGN_KEY)
    if (!raw) return DEFAULT_DESIGN
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_DESIGN,
      ...parsed,
      typo: {
        heading:    { ...DEFAULT_HEADING,    ...(parsed.typo?.heading    ?? {}) },
        subheading: { ...DEFAULT_SUBHEADING, ...(parsed.typo?.subheading ?? {}) },
        body:       { ...DEFAULT_BODY,       ...(parsed.typo?.body       ?? {}) },
      },
    }
  } catch { return DEFAULT_DESIGN }
}

export function saveDesign(d: ContractDesign) {
  localStorage.setItem(DESIGN_KEY, JSON.stringify(d))
}

export function fontStack(family: TypographyStyle['fontFamily']): string {
  if (family === 'georgia') return "Georgia, 'Times New Roman', serif"
  if (family === 'roboto')  return "'Roboto', sans-serif"
  return "'Serenity', sans-serif"
}

/* ═══ Vizuál PDF — šablona dokumentů Four Bros, brand 2026 ═══ */
const RULES: [string, string][] = [
  ['Písma', 'Funnel Sans 9,5 pt (text), Funnel Display SemiBold (nadpisy)'],
  ['Barvy', 'text navy, čísla článků a odrážky fialová, žlutě jen pole k doplnění […]'],
  ['Stránka', 'A4, okraje 18 mm, 4sloupcový grid, odstavce do bloku'],
  ['Titulní strana', 'název, Připraveno pro / kým, schody z kostiček, rožky'],
  ['Další strany', 'logo, slogan, schody; patička s firmou a číslem strany „X z Y“'],
  ['Struktura', 'úvodní věta, smluvní strany, články 1. / 1.1, podpisy vedle sebe'],
]

export function ContractDesignerClient() {
  const [design, setDesign] = useState<ContractDesign>(DEFAULT_DESIGN)
  const [saved, setSaved] = useState(false)
  useEffect(() => { setDesign(loadDesign()) }, [])
  const update = (patch: Partial<ContractDesign>) => { setDesign(d => ({ ...d, ...patch })); setSaved(false) }
  const save = () => { saveDesign(design); setSaved(true) }
  const sample = DEMO_CONTRACTS[0]
  const tpl = CONTRACT_TEMPLATES.find(t => t.id === sample.templateId)
  const company = { ...DOC_COMPANY_DEFAULT, name: design.companyName, ico: design.companyIco, address: design.companyAddress }
  const model = useMemo(() => contractDocModel(sample, tpl, company),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [design.companyName, design.companyIco, design.companyAddress])
  const input = 'w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-violet'

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-5 items-start">
      <div className="space-y-4">
        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-5">
          <h3 className="font-headline text-navy text-[15px] mb-1" style={{ fontWeight: 600 }}>Šablona Four Bros 2026</h3>
          <p className="text-xs text-navy/55 mb-4">Všechny smlouvy, dohody a dodatky se generují v tomhle vzhledu. Písma a barvy jsou dané brandem, nenastavují se.</p>
          <dl className="space-y-2.5">
            {RULES.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-violet">{k}</dt>
                <dd className="text-[13px] text-navy leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[12px] text-navy/60 flex items-center gap-2"><mark className="bg-gold text-navy px-1">[k doplnění]</mark> = údaj, který ve smlouvě ještě chybí</p>
        </div>

        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-5 space-y-3">
          <h3 className="font-headline text-navy text-[15px]" style={{ fontWeight: 600 }}>Údaje firmy</h3>
          <p className="text-xs text-navy/55 -mt-2">Propíšou se do smluvních stran a patičky každé strany.</p>
          {([['companyName', 'Obchodní firma'], ['companyIco', 'IČO'], ['companyAddress', 'Sídlo']] as const).map(([k, l]) => (
            <label key={k} className="block">
              <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60 mb-1">{l}</span>
              <input value={design[k]} onChange={e => update({ [k]: e.target.value } as Partial<ContractDesign>)} className={input} />
            </label>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={save} className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-violet"><Save className="w-4 h-4" />Uložit</button>
            <button type="button" onClick={() => { setDesign(DEFAULT_DESIGN); setSaved(false) }} className="inline-flex items-center gap-1.5 text-sm text-navy/55 hover:text-navy"><RotateCcw className="w-3.5 h-3.5" />Výchozí</button>
            {saved && <span className="text-xs text-navy/55">✓ Uloženo</span>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[rgba(13,33,79,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[rgba(13,33,79,0.08)]">
          <div>
            <p className="font-headline text-navy text-[15px]" style={{ fontWeight: 600 }}>Náhled: {model.title}</p>
            <p className="text-xs text-navy/55">Ukázková smlouva — přesně takhle vypadá PDF</p>
          </div>
          <button type="button" onClick={() => openContractDocPrint(model)} className="inline-flex items-center gap-2 border border-navy text-navy px-4 py-2 text-sm font-semibold hover:bg-navy hover:text-white"><Eye className="w-4 h-4" />Otevřít jako PDF</button>
        </div>
        <div className="bg-[#ebe8f6]"><ContractDocPreview model={model} /></div>
      </div>
    </div>
  )
}
