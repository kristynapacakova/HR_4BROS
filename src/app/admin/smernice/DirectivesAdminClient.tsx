'use client'

import { useState, useCallback } from 'react'
import {
  FileText,
  AlertTriangle,
  Shield,
  HardHat,
  Gift,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Plus,
  ArrowLeft,
} from 'lucide-react'
import type { Directive, DirectiveTemplate, DirectiveTheme, DirectiveAcknowledgement } from '@/lib/mock-data'

interface DirectivesAdminClientProps {
  directives: Directive[]
  templates: DirectiveTemplate[]
}

function getThemeConfig(theme: DirectiveTheme) {
  switch (theme) {
    case 'STANDARD':
      return {
        icon: FileText,
        borderColor: 'border-l-[#1e3a5f]',
        iconColor: 'text-slate-700',
        badgeBg: 'bg-slate-100 text-slate-700',
        headerBg: 'bg-[#1e3a5f]',
        cardHeaderBg: 'bg-slate-800',
        previewBg: 'bg-white',
        previewBorder: 'border-l-4 border-[#1e3a5f]',
        headingColor: 'text-[#1e3a5f]',
        label: 'Obecná',
      }
    case 'IMPORTANT':
      return {
        icon: AlertTriangle,
        borderColor: 'border-l-orange-500',
        iconColor: 'text-orange-500',
        badgeBg: 'bg-orange-100 text-orange-700',
        headerBg: 'bg-orange-500',
        cardHeaderBg: 'bg-orange-500',
        previewBg: 'bg-amber-50',
        previewBorder: 'border-l-4 border-orange-500',
        headingColor: 'text-orange-700',
        label: 'Důležitá',
      }
    case 'GDPR':
      return {
        icon: Shield,
        borderColor: 'border-l-violet-600',
        iconColor: 'text-violet-600',
        badgeBg: 'bg-violet-100 text-violet-700',
        headerBg: 'bg-gradient-to-r from-violet-700 to-purple-800',
        cardHeaderBg: 'bg-violet-700',
        previewBg: 'bg-purple-50',
        previewBorder: 'border-l-4 border-violet-600',
        headingColor: 'text-violet-800',
        label: 'GDPR',
      }
    case 'BOZP':
      return {
        icon: HardHat,
        borderColor: 'border-l-amber-500',
        iconColor: 'text-amber-600',
        badgeBg: 'bg-amber-100 text-amber-700',
        headerBg: 'bg-yellow-400',
        cardHeaderBg: 'bg-amber-500',
        previewBg: 'bg-amber-50',
        previewBorder: 'border-l-4 border-amber-500',
        headingColor: 'text-amber-900',
        label: 'BOZP',
      }
    case 'BENEFIT':
      return {
        icon: Gift,
        borderColor: 'border-l-emerald-500',
        iconColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-100 text-emerald-700',
        headerBg: 'bg-emerald-600',
        cardHeaderBg: 'bg-emerald-600',
        previewBg: 'bg-emerald-50',
        previewBorder: 'border-l-4 border-emerald-500',
        headingColor: 'text-emerald-800',
        label: 'Benefity',
      }
    case 'WELCOME':
      return {
        icon: Sparkles,
        borderColor: 'border-l-violet-500',
        iconColor: 'text-violet-500',
        badgeBg: 'bg-violet-100 text-violet-700',
        headerBg: 'bg-gradient-to-r from-[#1e3a5f] to-violet-700',
        cardHeaderBg: 'bg-gradient-to-r from-[#1e3a5f] to-violet-700',
        previewBg: 'bg-white',
        previewBorder: 'border-l-4 border-violet-500',
        headingColor: 'text-[#1e3a5f]',
        label: 'Uvítání',
      }
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

const TOTAL_EMPLOYEES = 15

// Tab 1 — Published directives
function PublishedDirectives({ directives }: { directives: Directive[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {directives.map((directive) => {
        const config = getThemeConfig(directive.theme)
        const isExpanded = expandedId === directive.id

        return (
          <div key={directive.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${config.borderColor} overflow-hidden`}>
            <button
              className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : directive.id)}
            >
              <config.icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-800">{directive.title}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badgeBg}`}>{config.label}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Vydáno {formatDate(directive.publishedAt)}</span>
                  <span>Platnost od {formatDate(directive.validFrom)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-800">
                    {directive.acknowledgements.length}/{TOTAL_EMPLOYEES}
                  </div>
                  <div className="text-xs text-slate-500">odsouhlasení</div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                  Zaměstnanci, kteří odsouhlasili
                </h4>
                {directive.acknowledgements.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Žádné záznamy o souhlasu.</p>
                ) : (
                  <div className="space-y-2">
                    {directive.acknowledgements.map((ack: DirectiveAcknowledgement, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="font-medium text-slate-700">{ack.employeeName}</span>
                        <span className="text-slate-400">—</span>
                        <span className="text-slate-500">{formatDate(ack.acknowledgedAt)}</span>
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
  )
}

// Live preview renderer
function DirectivePreview({
  template,
  values,
  title,
}: {
  template: DirectiveTemplate
  values: Record<string, string>
  title: string
}) {
  const config = getThemeConfig(template.theme)

  let rendered = template.body
  for (const [key, val] of Object.entries(values)) {
    rendered = rendered.replaceAll(`{{${key}}}`, val || `<span class="text-slate-300">[${key}]</span>`)
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 shadow-sm ${config.previewBg}`}>
      <div className={`${config.headerBg} text-white px-5 py-4`}>
        <div className="flex items-center gap-2 mb-1">
          <config.icon className="w-4 h-4 opacity-80" />
          <span className="text-xs font-medium opacity-80">{config.label}</span>
        </div>
        <h3 className="text-base font-bold">{title || template.name}</h3>
      </div>
      <div className={`p-5 ${config.previewBorder}`}>
        <div
          className={`prose prose-sm max-w-none
            prose-h2:text-lg prose-h2:font-bold prose-h2:${config.headingColor} prose-h2:mt-2 prose-h2:mb-2
            prose-h3:text-sm prose-h3:font-semibold prose-h3:${config.headingColor}
            prose-p:text-slate-700 prose-p:text-sm prose-p:leading-relaxed
            prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-sm`}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      </div>
    </div>
  )
}

// Tab 2 — Create new directive
function CreateDirective({
  templates,
  onPublish,
}: {
  templates: DirectiveTemplate[]
  onPublish: (directive: Directive) => void
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<DirectiveTemplate | null>(null)
  const [title, setTitle] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [mustAcknowledge, setMustAcknowledge] = useState(true)
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})

  const handleSelectTemplate = useCallback((template: DirectiveTemplate) => {
    setSelectedTemplate(template)
    setTitle(template.name)
    const initial: Record<string, string> = {}
    for (const p of template.placeholders) initial[p] = ''
    setPlaceholderValues(initial)
    setStep(2)
  }, [])

  const handlePublish = useCallback(() => {
    if (!selectedTemplate) return
    let body = selectedTemplate.body
    for (const [key, val] of Object.entries(placeholderValues)) {
      body = body.replaceAll(`{{${key}}}`, val)
    }
    const newDirective: Directive = {
      id: `dir-${Date.now()}`,
      templateId: selectedTemplate.id,
      title: title || selectedTemplate.name,
      category: selectedTemplate.category,
      theme: selectedTemplate.theme,
      body,
      publishedAt: new Date(),
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      mustAcknowledge,
      acknowledgements: [],
      createdBy: 'Administrátor',
    }
    onPublish(newDirective)
  }, [selectedTemplate, title, validFrom, mustAcknowledge, placeholderValues, onPublish])

  if (step === 1) {
    return (
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-4">Vyberte šablonu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((template) => {
            const config = getThemeConfig(template.theme)
            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="text-left rounded-xl overflow-hidden border-2 border-slate-200 hover:border-violet-400 transition-colors group"
              >
                <div className={`${config.cardHeaderBg} text-white px-4 py-3 flex items-center gap-2`}>
                  <config.icon className="w-4 h-4 opacity-90" />
                  <span className="text-sm font-semibold">{config.label}</span>
                </div>
                <div className="px-4 py-3 bg-white">
                  <div className="text-sm font-semibold text-slate-800 mb-1">{template.name}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{template.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.placeholders.map((p) => (
                      <span key={p} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (!selectedTemplate) return null

  return (
    <div>
      <button
        onClick={() => setStep(1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zpět na výběr šablony
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-800">Vyplňte údaje</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Název směrnice
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="Název směrnice"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Platnost od
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mustAck"
              checked={mustAcknowledge}
              onChange={(e) => setMustAcknowledge(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="mustAck" className="text-sm text-slate-700">
              Vyžadovat souhlas zaměstnanců
            </label>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Zástupné proměnné
            </h4>
            <div className="space-y-3">
              {selectedTemplate.placeholders.map((p) => (
                <div key={p}>
                  <label className="block text-xs font-medium text-slate-600 mb-1 font-mono">{`{{${p}}}`}</label>
                  <textarea
                    rows={2}
                    value={placeholderValues[p] ?? ''}
                    onChange={(e) =>
                      setPlaceholderValues((prev) => ({ ...prev, [p]: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                    placeholder={`Obsah pro ${p}...`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handlePublish}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Publikovat směrnici
          </button>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Náhled</h3>
          <DirectivePreview
            template={selectedTemplate}
            values={placeholderValues}
            title={title}
          />
        </div>
      </div>
    </div>
  )
}

export function DirectivesAdminClient({ directives: initialDirectives, templates }: DirectivesAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')
  const [directives, setDirectives] = useState<Directive[]>(initialDirectives)
  const [successBanner, setSuccessBanner] = useState(false)

  function handlePublish(directive: Directive) {
    setDirectives((prev) => [directive, ...prev])
    setActiveTab('list')
    setSuccessBanner(true)
    setTimeout(() => setSuccessBanner(false), 4000)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {successBanner && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          Směrnice byla úspěšně publikována.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'list'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Vydané směrnice
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'create'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Vytvořit novou
        </button>
      </div>

      {activeTab === 'list' && <PublishedDirectives directives={directives} />}
      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <CreateDirective templates={templates} onPublish={handlePublish} />
        </div>
      )}
    </div>
  )
}
