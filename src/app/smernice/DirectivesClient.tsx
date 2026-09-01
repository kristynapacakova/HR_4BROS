'use client'

import { useState } from 'react'
import {
  FileText,
  AlertTriangle,
  Shield,
  HardHat,
  Gift,
  Sparkles,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { Directive, DirectiveTheme, DirectiveAcknowledgement } from '@/lib/mock-data'

interface DirectivesClientProps {
  directives: Directive[]
  currentEmployeeId: string
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
        label: 'Obecná',
      }
    case 'IMPORTANT':
      return {
        icon: AlertTriangle,
        borderColor: 'border-l-orange-500',
        iconColor: 'text-orange-500',
        badgeBg: 'bg-orange-100 text-orange-700',
        headerBg: 'bg-orange-500',
        label: 'Důležitá',
      }
    case 'GDPR':
      return {
        icon: Shield,
        borderColor: 'border-l-violet-600',
        iconColor: 'text-violet-600',
        badgeBg: 'bg-violet-100 text-violet-700',
        headerBg: 'bg-violet-700',
        label: 'GDPR',
      }
    case 'BOZP':
      return {
        icon: HardHat,
        borderColor: 'border-l-amber-500',
        iconColor: 'text-amber-600',
        badgeBg: 'bg-amber-100 text-amber-700',
        headerBg: 'bg-amber-500',
        label: 'BOZP',
      }
    case 'BENEFIT':
      return {
        icon: Gift,
        borderColor: 'border-l-emerald-500',
        iconColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-100 text-emerald-700',
        headerBg: 'bg-emerald-600',
        label: 'Benefity',
      }
    case 'WELCOME':
      return {
        icon: Sparkles,
        borderColor: 'border-l-violet-500',
        iconColor: 'text-violet-500',
        badgeBg: 'bg-violet-100 text-violet-700',
        headerBg: 'bg-gradient-to-r from-[#1e3a5f] to-violet-700',
        label: 'Uvítání',
      }
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

interface DirectiveModalProps {
  directive: Directive
  isAcknowledged: boolean
  onClose: () => void
  onAcknowledge: (directiveId: string) => void
}

function DirectiveModal({ directive, isAcknowledged, onClose, onAcknowledge }: DirectiveModalProps) {
  const [checked, setChecked] = useState(false)
  const config = getThemeConfig(directive.theme)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className={`${config.headerBg} text-white px-6 py-5 flex items-start justify-between`}>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <config.icon className="w-5 h-5 opacity-80 flex-shrink-0" />
              <span className="text-sm font-medium opacity-80">{config.label}</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">{directive.title}</h2>
            <div className="flex gap-4 mt-2 text-sm opacity-80">
              <span>Vydáno: {formatDate(directive.publishedAt)}</span>
              <span>Platnost od: {formatDate(directive.validFrom)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div
            className="prose prose-slate max-w-none
              prose-h2:text-xl prose-h2:font-bold prose-h2:text-[#1e3a5f] prose-h2:mt-0
              prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-800
              prose-p:text-slate-700 prose-p:leading-relaxed
              prose-ul:text-slate-700 prose-ol:text-slate-700
              prose-li:leading-relaxed prose-strong:text-slate-800"
            dangerouslySetInnerHTML={{ __html: directive.body }}
          />
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          {directive.mustAcknowledge && !isAcknowledged && (
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                  Přečetl/a jsem tuto směrnici a souhlasím s jejím obsahem
                </span>
              </label>
            </div>
          )}
          {isAcknowledged && (
            <div className="mb-4 flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tato směrnice byla odsouhlasena</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
            >
              Zavřít
            </button>
            {directive.mustAcknowledge && !isAcknowledged && (
              <button
                disabled={!checked}
                onClick={() => {
                  onAcknowledge(directive.id)
                  onClose()
                }}
                className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Potvrdit souhlas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DirectivesClient({ directives: initialDirectives, currentEmployeeId }: DirectivesClientProps) {
  const [directives, setDirectives] = useState<Directive[]>(initialDirectives)
  const [selectedDirective, setSelectedDirective] = useState<Directive | null>(null)

  function isAcknowledged(directive: Directive): boolean {
    return directive.acknowledgements.some((a) => a.employeeId === currentEmployeeId)
  }

  function handleAcknowledge(directiveId: string) {
    const newAck: DirectiveAcknowledgement = {
      employeeId: currentEmployeeId,
      employeeName: 'Aktuální uživatel',
      acknowledgedAt: new Date(),
    }
    setDirectives((prev) =>
      prev.map((d) =>
        d.id === directiveId
          ? { ...d, acknowledgements: [...d.acknowledgements, newAck] }
          : d
      )
    )
  }

  const totalMustAck = directives.filter((d) => d.mustAcknowledge).length
  const ackedCount = directives.filter((d) => d.mustAcknowledge && isAcknowledged(d)).length
  const progressPct = totalMustAck > 0 ? Math.round((ackedCount / totalMustAck) * 100) : 100

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Přehled souhlasů</h2>
            <p className="text-sm text-slate-500">
              {ackedCount} z {totalMustAck} směrnic odsouhlaseno
            </p>
          </div>
          <div className="text-2xl font-bold text-[#1e3a5f]">{progressPct}%</div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Directives List */}
      <div className="space-y-3">
        {directives.map((directive) => {
          const config = getThemeConfig(directive.theme)
          const acked = isAcknowledged(directive)
          const needsAck = directive.mustAcknowledge && !acked

          return (
            <button
              key={directive.id}
              onClick={() => setSelectedDirective(directive)}
              className={`w-full text-left bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${config.borderColor} px-5 py-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 ${config.iconColor} flex-shrink-0`}>
                  <config.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-slate-800">{directive.title}</h3>
                    {directive.mustAcknowledge && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Vyžaduje souhlas
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className={`font-medium px-2 py-0.5 rounded-full ${config.badgeBg}`}>
                      {config.label}
                    </span>
                    <span>{directive.category}</span>
                    <span>Vydáno {formatDate(directive.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {acked ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Odsouhlaseno
                    </span>
                  ) : needsAck ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      Vyžaduje souhlas
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {selectedDirective && (
        <DirectiveModal
          directive={selectedDirective}
          isAcknowledged={isAcknowledged(selectedDirective)}
          onClose={() => setSelectedDirective(null)}
          onAcknowledge={handleAcknowledge}
        />
      )}
    </div>
  )
}
