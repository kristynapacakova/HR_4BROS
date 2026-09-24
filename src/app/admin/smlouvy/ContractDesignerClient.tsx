'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Trash2, RotateCcw, Save, Eye, Palette, Type, Image as ImageIcon, Building2, ChevronDown } from 'lucide-react'

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

const DESIGN_KEY = 'fourBros_contractDesign'

const DEFAULT_HEADING: TypographyStyle = { fontFamily: 'serenity', fontSize: 13, fontWeight: 500, italic: false }
const DEFAULT_SUBHEADING: TypographyStyle = { fontFamily: 'roboto', fontSize: 12, fontWeight: 700, italic: false }
const DEFAULT_BODY: TypographyStyle = { fontFamily: 'roboto', fontSize: 12, fontWeight: 300, italic: false }

export const DEFAULT_DESIGN: ContractDesign = {
  logoDataUrl: null,
  decorDataUrl: null,
  primaryColor: '#194669',
  accentColor: '#7e17e0',
  fontFamily: 'serenity',
  companyName: 'Four Bros s.r.o.',
  companyAddress: 'Náměstí Míru 5, 120 00 Praha 2',
  companyIco: '12345678',
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

const FONT_OPTIONS: { value: TypographyStyle['fontFamily']; label: string }[] = [
  { value: 'serenity', label: 'Serenity' },
  { value: 'roboto',   label: 'Roboto' },
  { value: 'georgia',  label: 'Georgia' },
]

const WEIGHT_OPTIONS: { value: TypographyStyle['fontWeight']; label: string }[] = [
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'SemiBold (600)' },
  { value: 700, label: 'Bold (700)' },
]

function UploadZone({
  label, hint, value, onChange, onClear,
}: {
  label: string
  hint: string
  value: string | null
  onChange: (dataUrl: string) => void
  onClear: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => { if (e.target?.result) onChange(e.target.result as string) }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <img src={value} alt="" className="h-12 object-contain rounded-lg bg-white p-1 border border-slate-100" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500">Nahráno</p>
            <button onClick={() => ref.current?.click()} className="text-xs text-violet hover:underline">Změnit</button>
          </div>
          <button onClick={onClear} className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${drag ? 'border-violet bg-violet/5' : 'border-slate-200 hover:border-violet/40'}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => ref.current?.click()}
        >
          <Upload className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-400">Přetáhněte nebo klikněte</p>
          <p className="text-[10px] text-slate-300 mt-0.5">{hint}</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white" />
        </div>
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          className="input flex-1 font-mono text-sm uppercase"
          maxLength={7}
        />
      </div>
    </div>
  )
}

function TypographyEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: TypographyStyle
  onChange: (v: TypographyStyle) => void
}) {
  const [open, setOpen] = useState(false)
  const preview = `${value.fontFamily} · ${value.fontSize}px · ${value.fontWeight}${value.italic ? ' · kurzíva' : ''}`

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="text-left">
          <p className="text-xs font-semibold text-navy">{label}</p>
          <p
            className="text-[11px] text-slate-400 mt-0.5"
            style={{ fontFamily: fontStack(value.fontFamily), fontWeight: value.fontWeight, fontStyle: value.italic ? 'italic' : 'normal', fontSize: 11 }}
          >
            {preview}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 py-4 space-y-3 bg-white border-t border-slate-100">
          {/* Font family */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Písmo</label>
            <div className="flex gap-2 flex-wrap">
              {FONT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...value, fontFamily: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${value.fontFamily === opt.value ? 'border-violet bg-violet/10 text-violet font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  style={{ fontFamily: fontStack(opt.value) }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Velikost — {value.fontSize}px
            </label>
            <input
              type="range" min={8} max={28} step={0.5}
              value={value.fontSize}
              onChange={e => onChange({ ...value, fontSize: parseFloat(e.target.value) })}
              className="w-full accent-violet"
            />
            <div className="flex justify-between text-[9px] text-slate-300 mt-0.5">
              <span>8px</span><span>28px</span>
            </div>
          </div>

          {/* Font weight */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Tloušťka</label>
            <div className="grid grid-cols-3 gap-1.5">
              {WEIGHT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...value, fontWeight: opt.value })}
                  className={`px-2 py-1.5 rounded-lg text-[10px] border transition-all ${value.fontWeight === opt.value ? 'border-violet bg-violet/10 text-violet' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  style={{ fontWeight: opt.value }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Italic toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...value, italic: !value.italic })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all ${value.italic ? 'border-violet bg-violet/10 text-violet font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>I</span>
              Kurzíva
            </button>
            <span
              className="text-xs text-slate-400"
              style={{ fontFamily: fontStack(value.fontFamily), fontWeight: value.fontWeight, fontStyle: value.italic ? 'italic' : 'normal', fontSize: value.fontSize * 0.85 }}
            >
              Ukázka textu
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Live preview of the document header
function HeaderPreview({ design }: { design: ContractDesign }) {
  const hStyle = design.typo.heading
  const sStyle = design.typo.subheading
  const bStyle = design.typo.body

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Header area */}
      <div className="relative p-6 border-b border-slate-100 overflow-hidden" style={{ minHeight: 120 }}>
        <img
          src={design.decorDataUrl ?? '/brand/watercolor.png'}
          alt=""
          className="absolute top-0 right-0 h-28 object-contain pointer-events-none select-none opacity-80"
        />
        <div className="relative z-10 flex items-start justify-between">
          {design.logoDataUrl ? (
            <img src={design.logoDataUrl} alt="Logo" className="h-10 object-contain" />
          ) : (
            <img src="/brand/logo.png" alt="4BROS" style={{ height: 40, objectFit: 'contain' }} />
          )}
          <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', letterSpacing: '0.04em' }}>
            Interní dokument — Důvěrné<br />1. 1. 2026
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <div style={{ fontFamily: fontStack(hStyle.fontFamily), fontSize: 18, fontWeight: hStyle.fontWeight, fontStyle: hStyle.italic ? 'italic' : 'normal', color: design.primaryColor, letterSpacing: '-0.3px', lineHeight: 1.3 }}>
            Pracovní smlouva — Ukázka
          </div>
          <div style={{ fontFamily: fontStack(bStyle.fontFamily), fontSize: 11, fontWeight: bStyle.fontWeight, color: '#64748b', marginTop: 6 }}>
            Připraveno pro: <strong style={{ color: design.primaryColor, fontWeight: 700 }}>Jan Novák</strong>
            &nbsp;·&nbsp; Připraveno kým: <strong style={{ color: design.primaryColor, fontWeight: 700 }}>{design.companyName}</strong>
          </div>
        </div>
      </div>

      {/* Body sample */}
      <div className="px-6 py-4">
        <div style={{ fontFamily: fontStack(hStyle.fontFamily), fontSize: hStyle.fontSize, fontWeight: hStyle.fontWeight, fontStyle: hStyle.italic ? 'italic' : 'normal', textTransform: 'uppercase', letterSpacing: '0.1em', color: design.primaryColor, borderBottom: `1.5px solid ${design.primaryColor}`, paddingBottom: 6, marginBottom: 8 }}>
          Předmět smlouvy
        </div>
        <p style={{ fontFamily: fontStack(bStyle.fontFamily), fontSize: bStyle.fontSize, fontWeight: bStyle.fontWeight, fontStyle: bStyle.italic ? 'italic' : 'normal', color: '#1e3a52', lineHeight: 1.75, marginBottom: 8 }}>
          Zaměstnavatel přijímá zaměstnance na pozici <strong style={{ fontWeight: 700 }}>Frontend Developer</strong> s místem výkonu práce Praha.
        </p>
        <div style={{ fontFamily: fontStack(sStyle.fontFamily), fontSize: sStyle.fontSize, fontWeight: sStyle.fontWeight, fontStyle: sStyle.italic ? 'italic' : 'normal', color: design.accentColor, borderLeft: `3px solid ${design.accentColor}`, paddingLeft: 8, marginBottom: 6 }}>
          Základní mzdové podmínky
        </div>
        <p style={{ fontFamily: fontStack(bStyle.fontFamily), fontSize: bStyle.fontSize, fontWeight: bStyle.fontWeight, fontStyle: bStyle.italic ? 'italic' : 'normal', color: '#1e3a52', lineHeight: 1.75 }}>
          Zaměstnanci náleží základní měsíční mzda ve výši <strong style={{ fontWeight: 700 }}>XX 000 Kč</strong> hrubého.
        </p>
      </div>

      {/* Footer sample */}
      <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center" style={{ background: design.primaryColor }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{design.companyName}</strong>
          &nbsp;·&nbsp; IČO: {design.companyIco} &nbsp;·&nbsp; {design.companyAddress}
        </div>
        <img
          src={design.logoDataUrl ?? '/brand/logo.png'}
          alt=""
          style={{ height: 20, objectFit: 'contain', opacity: 0.45, filter: 'brightness(10)' }}
        />
      </div>
    </div>
  )
}

export function ContractDesignerClient() {
  const [design, setDesign] = useState<ContractDesign>(DEFAULT_DESIGN)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setDesign(loadDesign()) }, [])

  const update = useCallback((patch: Partial<ContractDesign>) => {
    setDesign(prev => ({ ...prev, ...patch }))
    setSaved(false)
  }, [])

  const updateTypo = useCallback((key: keyof ContractDesign['typo'], value: TypographyStyle) => {
    setDesign(prev => ({ ...prev, typo: { ...prev.typo, [key]: value } }))
    setSaved(false)
  }, [])

  const handleSave = () => {
    saveDesign(design)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    setDesign(DEFAULT_DESIGN)
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left: editor */}
        <div className="space-y-5">

          {/* Images */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="w-4 h-4 text-violet" />
              <h3 className="font-headline font-semibold text-navy text-sm">Obrázky</h3>
            </div>
            <UploadZone
              label="Logo firmy"
              hint="PNG, SVG — zobrazí se vlevo nahoře a v zápatí"
              value={design.logoDataUrl}
              onChange={v => update({ logoDataUrl: v })}
              onClear={() => update({ logoDataUrl: null })}
            />
            <UploadZone
              label="Dekorativní prvek (watercolor, brush…)"
              hint="PNG s průhledností — zobrazí se vpravo nahoře"
              value={design.decorDataUrl}
              onChange={v => update({ decorDataUrl: v })}
              onClear={() => update({ decorDataUrl: null })}
            />
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-violet" />
              <h3 className="font-headline font-semibold text-navy text-sm">Barvy</h3>
            </div>
            <ColorInput label="Primární barva (nadpisy, záhlaví, zápatí)" value={design.primaryColor} onChange={v => update({ primaryColor: v })} />
            <ColorInput label="Akcentová barva (podnadpisy, zvýraznění)" value={design.accentColor} onChange={v => update({ accentColor: v })} />
          </div>

          {/* Typography */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-violet" />
              <h3 className="font-headline font-semibold text-navy text-sm">Typografie</h3>
            </div>
            <TypographyEditor
              label="Nadpis (H2 — název sekce)"
              value={design.typo.heading}
              onChange={v => updateTypo('heading', v)}
            />
            <TypographyEditor
              label="Podnadpis (H3 — podnázev sekce)"
              value={design.typo.subheading}
              onChange={v => updateTypo('subheading', v)}
            />
            <TypographyEditor
              label="Text odstavce (p, li)"
              value={design.typo.body}
              onChange={v => updateTypo('body', v)}
            />
          </div>

          {/* Company info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-violet" />
              <h3 className="font-headline font-semibold text-navy text-sm">Údaje firmy v zápatí</h3>
            </div>
            {[
              { key: 'companyName', label: 'Název firmy' },
              { key: 'companyIco',  label: 'IČO' },
              { key: 'companyAddress', label: 'Adresa' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                <input className="input" value={(design as unknown as Record<string, string>)[key]}
                  onChange={e => update({ [key]: e.target.value })} />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              Obnovit výchozí
            </button>
            <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-green-500 text-white' : 'bg-violet text-white hover:bg-violet/90'}`}>
              <Save className="w-3.5 h-3.5" />
              {saved ? 'Uloženo ✓' : 'Uložit nastavení'}
            </button>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="lg:sticky lg:top-6 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-medium text-slate-500">Živý náhled</p>
          </div>
          <HeaderPreview design={design} />
          <p className="text-xs text-slate-400 text-center">Náhled se aktualizuje v reálném čase. Uložte nastavení tlačítkem výše.</p>
        </div>

      </div>
    </div>
  )
}
