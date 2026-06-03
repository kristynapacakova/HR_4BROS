'use client'

import { useState } from 'react'
import { Directive, DirectiveTemplate, DirectiveTheme } from '@/lib/mock-data'
import {
  FileText, AlertTriangle, Shield, HardHat, Gift, Sparkles,
  Plus, ChevronDown, ChevronUp, CheckCircle2, Users, BookOpen,
} from 'lucide-react'

const THEME_CFG: Record<DirectiveTheme, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  borderColor: string
  badgeBg: string
  badgeText: string
  headerClass: string
  previewHeaderClass: string
  previewBodyClass: string
}> = {
  STANDARD: {
    icon: FileText, label: 'Obecná',
    borderColor: 'border-l-slate-700', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700',
    headerClass: 'bg-[#1e3a5f] text-white',
    previewHeaderClass: 'bg-[#1e3a5f] text-white px-5 py-3',
    previewBodyClass: 'bg-white border-l-4 border-slate-700',
  },
  IMPORTANT: {
    icon: AlertTriangle, label: 'Důležité',
    borderColor: 'border-l-orange-500', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700',
    headerClass: 'bg-orange-500 text-white',
    previewHeaderClass: 'bg-orange-500 text-white px-5 py-3',
    previewBodyClass: 'bg-orange-50 border-l-4 border-orange-500',
  },
  GDPR: {
    icon: Shield, label: 'GDPR',
    borderColor: 'border-l-violet-600', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700',
    headerClass: 'bg-violet-700 text-white',
    previewHeaderClass: 'bg-gradient-to-r from-violet-700 to-purple-800 text-white px-5 py-3',
    previewBodyClass: 'bg-purple-50 border-l-4 border-violet-600',
  },
  BOZP: {
    icon: HardHat, label: 'BOZP',
    borderColor: 'border-l-amber-500', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700',
    headerClass: 'bg-amber-400 text-navy',
    previewHeaderClass: 'bg-amber-400 text-[#1e3a5f] px-5 py-3',
    previewBodyClass: 'bg-amber-50 border-l-4 border-amber-500',
  },
  BENEFIT: {
    icon: Gift, label: 'Benefity',
    borderColor: 'border-l-emerald-500', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700',
    headerClass: 'bg-emerald-600 text-white',
    previewHeaderClass: 'bg-emerald-600 text-white px-5 py-3',
    previewBodyClass: 'bg-emerald-50 border-l-4 border-emerald-500',
  },
  WELCOME: {
    icon: Sparkles, label: 'Uvítání',
    borderColor: 'border-l-violet-500', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700',
    headerClass: 'bg-gradient-to-r from-[#1e3a5f] to-violet-700 text-white',
    previewHeaderClass: 'bg-gradient-to-r from-[#1e3a5f] to-violet-700 text-white px-5 py-3',
    previewBodyClass: 'bg-white border-l-4 border-violet-500',
  },
}

const TOTAL_EMPLOYEES = 15

function fillBody(body: string, values: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] || `<span class="text-slate-400 italic">{{${k}}}</span>`)
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))
}

export function DirectivesAdminClient({ directives: initial, templates }: {
  directives: Directive[]
  templates: DirectiveTemplate[]
}) {
  const [tab, setTab] = useState<'list' | 'create'>('list')
  const [directives, setDirectives] = useState<Directive[]>(initial)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Create form state
  const [selectedTemplate, setSelectedTemplate] = useState<DirectiveTemplate | null>(null)
  const [title, setTitle] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [mustAck, setMustAck] = useState(true)
  const [values, setValues] = useState<Record<string, string>>({})
  const [published, setPublished] = useState(false)

  function selectTemplate(tpl: DirectiveTemplate) {
    setSelectedTemplate(tpl)
    setTitle(tpl.name)
    setValues({})
  }

  function publish() {
    if (!selectedTemplate) return
    const newDir: Directive = {
      id: `dir-${Date.now()}`,
      templateId: selectedTemplate.id,
      title: title || selectedTemplate.name,
      category: selectedTemplate.category,
      theme: selectedTemplate.theme,
      body: fillBody(selectedTemplate.body, values).replace(/<span class="text-slate-400 italic">.*?<\/span>/g, ''),
      publishedAt: new Date(),
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      mustAcknowledge: mustAck,
      acknowledgements: [],
      createdBy: 'Petra Nováková',
    }
    setDirectives(prev => [newDir, ...prev])
    setPublished(true)
    setTimeout(() => {
      setPublished(false)
      setTab('list')
      setSelectedTemplate(null)
      setTitle('')
      setValidFrom('')
      setValues({})
    }, 1500)
  }

  const previewHtml = selectedTemplate ? fillBody(selectedTemplate.body, values) : ''

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-600" />
          <h2 className="font-headline font-bold text-[#1e3a5f] text-lg">Interní směrnice</h2>
        </div>
        <div className="flex gap-2">
          {(['list', 'create'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'create' && <Plus className="w-3.5 h-3.5" />}
              {t === 'list' ? 'Vydané směrnice' : 'Vytvořit novou'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: List */}
      {tab === 'list' && (
        <div className="space-y-3">
          {directives.map(d => {
            const cfg = THEME_CFG[d.theme]
            const Icon = cfg.icon
            const isOpen = expandedId === d.id
            return (
              <div key={d.id} className={`bg-white rounded-xl border border-slate-100 shadow-sm border-l-4 ${cfg.borderColor} overflow-hidden`}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : d.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.badgeBg}`}>
                    <Icon className={`w-4 h-4 ${cfg.badgeText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1e3a5f]">{d.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-[11px] font-medium mr-2 ${cfg.badgeBg} ${cfg.badgeText}`}>{cfg.label}</span>
                      Vydáno {formatDate(d.publishedAt)} · Platnost od {formatDate(d.validFrom)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      {d.acknowledgements.length}/{TOTAL_EMPLOYEES} odsouhlasilo
                    </span>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full"
                        style={{ width: `${Math.round((d.acknowledgements.length / TOTAL_EMPLOYEES) * 100)}%` }}
                      />
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                    {d.acknowledgements.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Zatím nikdo neodsouhlasil.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500 mb-2">Potvrzené souhlasy:</p>
                        {d.acknowledgements.map(a => (
                          <div key={a.employeeId} className="flex items-center gap-3 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className="font-medium text-[#1e3a5f]">{a.employeeName}</span>
                            <span className="text-slate-400 text-xs">{formatDate(a.acknowledgedAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tab: Create */}
      {tab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: form */}
          <div className="space-y-5">
            {/* Step 1: Pick template */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1e3a5f] mb-3">1. Vyberte šablonu</h3>
              <div className="grid grid-cols-1 gap-3">
                {templates.map(tpl => {
                  const cfg = THEME_CFG[tpl.theme]
                  const Icon = cfg.icon
                  const isSel = selectedTemplate?.id === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => selectTemplate(tpl)}
                      className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                        isSel ? 'border-violet-600 ring-2 ring-violet-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`${cfg.headerClass} px-4 py-2.5 flex items-center gap-2`}>
                        <Icon className="w-4 h-4 flex-shrink-0 opacity-90" />
                        <span className="text-sm font-semibold">{tpl.name}</span>
                      </div>
                      <div className="px-4 py-2 bg-white">
                        <p className="text-xs text-slate-500">{tpl.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Fill in */}
            {selectedTemplate && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#1e3a5f]">2. Vyplňte obsah</h3>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Název směrnice</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Název..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Platnost od</label>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    value={validFrom}
                    onChange={e => setValidFrom(e.target.value)}
                  />
                </div>

                {selectedTemplate.placeholders.map(ph => (
                  <div key={ph} className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">{ph.replace(/_/g, ' ')}</label>
                    <textarea
                      rows={ph === 'OBSAH' || ph.includes('OBSAH') || ph === 'POPIS_RIZIK' || ph === 'OCHRANA_OPATRENI' || ph === 'BENEFITY' || ph === 'PODMINKY' ? 3 : 1}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                      placeholder={`{{${ph}}}`}
                      value={values[ph] || ''}
                      onChange={e => setValues(v => ({ ...v, [ph]: e.target.value }))}
                    />
                  </div>
                ))}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mustAck}
                    onChange={e => setMustAck(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-slate-700">Vyžadovat souhlas od zaměstnanců</span>
                </label>

                <button
                  onClick={publish}
                  disabled={published}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors"
                >
                  {published ? (
                    <><CheckCircle2 className="w-4 h-4" />Publikováno!</>
                  ) : (
                    <><Plus className="w-4 h-4" />Publikovat směrnici</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: live preview */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Živý náhled</p>
            {selectedTemplate ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className={THEME_CFG[selectedTemplate.theme].previewHeaderClass}>
                  <div className="flex items-center gap-2 mb-0.5">
                    {(() => { const Icon = THEME_CFG[selectedTemplate.theme].icon; return <Icon className="w-4 h-4 opacity-80" /> })()}
                    <span className="text-xs font-medium opacity-80">{THEME_CFG[selectedTemplate.theme].label}</span>
                  </div>
                  <p className="font-semibold">{title || selectedTemplate.name}</p>
                  {validFrom && <p className="text-xs opacity-70 mt-0.5">Platnost od {new Date(validFrom).toLocaleDateString('cs-CZ')}</p>}
                </div>
                <div className={`${THEME_CFG[selectedTemplate.theme].previewBodyClass} px-5 py-5 max-h-[500px] overflow-y-auto`}>
                  <div
                    className="prose prose-sm max-w-none text-slate-700 prose-h2:text-base prose-h2:font-bold prose-h3:text-sm prose-h3:font-semibold"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 h-64 flex items-center justify-center">
                <p className="text-sm text-slate-400">Vyberte šablonu vlevo pro živý náhled</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
