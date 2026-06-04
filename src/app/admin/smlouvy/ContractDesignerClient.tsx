'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Trash2, RotateCcw, Save, Eye, Palette, Type, Image as ImageIcon, Building2 } from 'lucide-react'

export interface ContractDesign {
  logoDataUrl: string | null
  decorDataUrl: string | null
  primaryColor: string
  accentColor: string
  fontFamily: 'serenity' | 'roboto' | 'georgia'
  companyName: string
  companyAddress: string
  companyIco: string
}

const DESIGN_KEY = 'fourBros_contractDesign'

export const DEFAULT_DESIGN: ContractDesign = {
  logoDataUrl: null,
  decorDataUrl: null,
  primaryColor: '#0E2337',
  accentColor: '#7e17e0',
  fontFamily: 'serenity',
  companyName: 'Four Bros s.r.o.',
  companyAddress: 'Náměstí Míru 5, 120 00 Praha 2',
  companyIco: '12345678',
}

export function loadDesign(): ContractDesign {
  if (typeof window === 'undefined') return DEFAULT_DESIGN
  try {
    const raw = localStorage.getItem(DESIGN_KEY)
    if (!raw) return DEFAULT_DESIGN
    return { ...DEFAULT_DESIGN, ...JSON.parse(raw) }
  } catch { return DEFAULT_DESIGN }
}

export function saveDesign(d: ContractDesign) {
  localStorage.setItem(DESIGN_KEY, JSON.stringify(d))
}

const FONT_OPTIONS = [
  { value: 'serenity', label: 'Serenity (váš brand font)' },
  { value: 'georgia',  label: 'Georgia (serif, formální)' },
  { value: 'roboto',   label: 'Roboto (sans-serif)' },
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

// Live preview of the document header
function HeaderPreview({ design }: { design: ContractDesign }) {
  const fontStack = design.fontFamily === 'georgia'
    ? 'Georgia, serif'
    : design.fontFamily === 'roboto'
    ? 'Roboto, sans-serif'
    : 'Serenity, sans-serif'

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Header area */}
      <div className="relative p-6 border-b border-slate-100 overflow-hidden" style={{ minHeight: 120 }}>
        {/* Decoration image — custom or brand default */}
        <img
          src={design.decorDataUrl ?? '/brand/watercolor.png'}
          alt=""
          className="absolute top-0 right-0 h-28 object-contain pointer-events-none select-none opacity-80"
        />

        <div className="relative z-10 flex items-start justify-between">
          {/* Logo or text fallback */}
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
          <div style={{ fontFamily: fontStack, fontSize: 18, fontWeight: 700, color: design.primaryColor, letterSpacing: '-0.3px', lineHeight: 1.3 }}>
            Pracovní smlouva — Ukázka
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
            Připraveno pro: <strong style={{ color: design.primaryColor }}>Jan Novák</strong>
            &nbsp;·&nbsp; Připraveno kým: <strong style={{ color: design.primaryColor }}>{design.companyName}</strong>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50">
        {[['Zaměstnanec', 'Jan Novák'], ['Typ', 'HPP'], ['Datum', '1. 1. 2026'], ['Stav', 'Podepsáno']].map(([l, v]) => (
          <div key={l} className="px-4 py-2.5 border-r last:border-r-0 border-slate-100">
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 2 }}>{l}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: design.primaryColor }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Body sample */}
      <div className="px-6 py-4">
        <div style={{ fontFamily: fontStack, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: design.primaryColor, borderBottom: `1.5px solid ${design.primaryColor}`, paddingBottom: 6, marginBottom: 8 }}>
          Předmět smlouvy
        </div>
        <p style={{ fontSize: 11, color: '#1e3a52', lineHeight: 1.7 }}>
          Zaměstnavatel přijímá zaměstnance na pozici <strong>Frontend Developer</strong> s místem výkonu práce Praha.
        </p>
        <div style={{ fontFamily: fontStack, fontSize: 11, fontWeight: 600, color: design.accentColor, borderLeft: `3px solid ${design.accentColor}`, paddingLeft: 8, marginTop: 10 }}>
          Základní mzdové podmínky
        </div>
        <p style={{ fontSize: 11, color: '#1e3a52', lineHeight: 1.7, marginTop: 4 }}>
          Zaměstnanci náleží základní měsíční mzda ve výši <strong>XX 000 Kč</strong> hrubého.
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
            <ColorInput label="Akcentová barva (h3, zvýraznění)" value={design.accentColor} onChange={v => update({ accentColor: v })} />
          </div>

          {/* Font */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Type className="w-4 h-4 text-violet" />
              <h3 className="font-headline font-semibold text-navy text-sm">Font</h3>
            </div>
            <div className="grid gap-2">
              {FONT_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${design.fontFamily === opt.value ? 'border-violet bg-violet/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="font" value={opt.value} checked={design.fontFamily === opt.value}
                    onChange={() => update({ fontFamily: opt.value as ContractDesign['fontFamily'] })} className="accent-violet" />
                  <span className="text-sm text-navy">{opt.label}</span>
                </label>
              ))}
            </div>
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
