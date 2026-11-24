'use client'

import { useState } from 'react'
import { X, CheckCircle2, Clock, Download } from 'lucide-react'
import { LetterheadSheet } from '@/components/Letterhead'
import { printDirective } from '@/lib/print-directive'
import type { Directive, DirectiveAcknowledgement } from '@/lib/mock-data'
import { CATEGORY_STYLES, CategoryTile } from './DirectiveIcons'
import { DirectivesStack } from './DirectivesStack'

interface DirectivesClientProps {
  directives: Directive[]
  currentEmployeeId: string
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
  const config = CATEGORY_STYLES[directive.theme]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60">
      <div className="bg-white border border-navy w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Lišta okna */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[rgba(13,33,79,0.14)]">
          <div className="flex items-center gap-3 min-w-0">
            <CategoryTile theme={directive.theme} />
            <p className="kicker text-navy truncate">{directive.category || config.label}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => printDirective(directive)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-navy border border-navy/30 hover:border-navy transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Stáhnout PDF
            </button>
            <button onClick={onClose} aria-label="Zavřít" className="p-1 text-navy/60 hover:text-navy transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Směrnice na hlavičkovém papíře 4Bros */}
        <div className="flex-1 overflow-y-auto bg-alice p-5">
          <LetterheadSheet
            variant="stairs"
            left={[<strong key="c">Four Bros s.r.o.</strong>, 'Interní směrnice', directive.category || config.label]}
            right={[`Vydáno ${formatDate(directive.publishedAt)}`, `Platnost od ${formatDate(directive.validFrom)}`]}
            title={directive.title}
            footer={<><strong className="text-navy">Four Bros s.r.o.</strong> · Interní dokument — nešiřte mimo firmu</>}
          >
            <div dangerouslySetInnerHTML={{ __html: directive.body }} />
          </LetterheadSheet>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[rgba(13,33,79,0.14)] px-6 py-4">
          {directive.mustAcknowledge && !isAcknowledged && (
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-violet cursor-pointer"
                />
                <span className="text-sm text-navy/80 group-hover:text-navy transition-colors">
                  Přečetl/a jsem tuto směrnici a souhlasím s jejím obsahem
                </span>
              </label>
            </div>
          )}
          {isAcknowledged && (
            <div className="mb-4 inline-flex items-center gap-2 bg-mint text-navy text-xs font-bold uppercase tracking-[0.06em] px-3 py-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tato směrnice byla odsouhlasena</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-navy border border-navy/30 hover:border-navy transition-colors"
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
                className="btn-pill px-6 py-2.5 bg-gold hover:bg-gold/85 text-navy font-bold uppercase tracking-[0.06em] text-[12px] disabled:bg-gold/40 disabled:text-navy/60 disabled:cursor-not-allowed transition-colors"
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

  const mustAckDirectives = directives.filter((d) => d.mustAcknowledge)
  const allDone = totalMustAck > 0 && ackedCount === totalMustAck

  return (
    <div className="w-full space-y-6">
      {/* Navy hlavička s přehledem souhlasů */}
      <div className="relative bg-navy text-white overflow-hidden rozky rozky-lg after:z-20 min-h-[256px] flex">
        <div className="relative z-10 flex-1 px-7 sm:px-9 py-7 flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1 min-w-0">
            <p className="kicker text-gold text-[11px] mb-2">Přehled souhlasů</p>
            <h2 className="text-2xl font-headline text-white mb-1" style={{ fontWeight: 600 }}>
              Interní směrnice
            </h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-md">
              {allDone
                ? 'Máš odsouhlaseno všechno, co je potřeba. Díky!'
                : 'Projdi si směrnice, které vyžadují tvůj souhlas — otevři je kliknutím a potvrď, že ses s nimi seznámil/a.'}
            </p>
          </div>
          <div className="hidden md:block flex-shrink-0 -mb-2">
            <DirectivesStack themes={mustAckDirectives.map(d => d.theme)} remaining={totalMustAck - ackedCount} />
          </div>
          <div className="flex-shrink-0 md:text-right">
            <div className="flex items-baseline gap-2 md:justify-end">
              <span className="font-headline text-5xl leading-none text-white" style={{ fontWeight: 600 }}>
                {ackedCount}
              </span>
              <span className="font-headline text-2xl leading-none text-white/50" style={{ fontWeight: 600 }}>
                / {totalMustAck}
              </span>
              <span className="ml-2 text-[12px] font-bold uppercase tracking-[0.06em] text-gold">{progressPct}%</span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {ackedCount} z {totalMustAck} směrnic odsouhlaseno
            </p>
          </div>
        </div>
        {/* Segmentovaný ukazatel — jeden čtverec za každou směrnici k odsouhlasení */}
        <div className="relative z-10 px-7 pb-7">
          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalMustAck}
            aria-valuenow={ackedCount}
            aria-label="Odsouhlasené směrnice"
          >
            {mustAckDirectives.map((d, i) => {
              const done = isAcknowledged(d)
              return (
                <div
                  key={d.id}
                  title={`${d.title} — ${done ? 'odsouhlaseno' : 'čeká na souhlas'}`}
                  className="h-4 flex-1 border border-white/30 relative overflow-hidden"
                >
                  {done && <span className="absolute inset-0 bg-mint" style={{ transformOrigin: 'left', animation: `dir-fill .6s cubic-bezier(.16,1,.3,1) ${0.9 + i * 0.15}s both` }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Seznam směrnic */}
      <div className="space-y-3">
        {directives.map((directive) => {
          const config = CATEGORY_STYLES[directive.theme]
          const acked = isAcknowledged(directive)
          const needsAck = directive.mustAcknowledge && !acked

          return (
            <button
              key={directive.id}
              onClick={() => setSelectedDirective(directive)}
              className={`group w-full text-left bg-white border px-5 py-4 transition-colors ${
                needsAck ? 'border-navy/30 hover:border-navy' : 'border-[rgba(13,33,79,0.14)] hover:border-navy/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <CategoryTile theme={directive.theme} />
                <div className="flex-1 min-w-0">
                  <p className="kicker mb-0.5">{directive.category || config.label}</p>
                  <h3 className="text-[15px] font-headline text-navy leading-snug group-hover:text-violet transition-colors" style={{ fontWeight: 600 }}>
                    {directive.title}
                  </h3>
                  <p className="text-xs text-navy/50 mt-1">Vydáno {formatDate(directive.publishedAt)}</p>
                </div>
                <div className="flex-shrink-0">
                  {acked ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-navy bg-mint px-2.5 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Odsouhlaseno
                    </span>
                  ) : needsAck ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-navy bg-gold-tint border border-gold px-2.5 py-1">
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
