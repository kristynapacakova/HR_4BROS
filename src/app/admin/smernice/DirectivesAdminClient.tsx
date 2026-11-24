'use client'

import { useState } from 'react'
import { LetterheadSheet } from '@/components/Letterhead'
import { Directive, DirectiveTemplate, DirectiveTheme } from '@/lib/mock-data'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DEMO_TEAM, PERSONA_EMAIL_BY_ID } from '@/lib/mock-data'
import { CATEGORY_STYLES, CategoryTile } from '@/app/smernice/DirectiveIcons'
import { Avatar, personView, useProfiles } from '@/app/team/teamPeople'

/** Potvrzení jsou v ukázce vedená pod přihlašovacím id nebo id člověka — sjednotit na člověka. */
const personIdOf = (id: string) => DEMO_TEAM.some(m => m.id === id) ? id : DEMO_TEAM.find(m => m.email === PERSONA_EMAIL_BY_ID[id])?.id ?? id

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
  const [esign, setEsign] = useState(false)
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
      requireESign: mustAck && esign,
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
      setEsign(false)
    }, 1500)
  }

  const profiles = useProfiles()
  const person = (id: string) => { const m = DEMO_TEAM.find(x => x.id === id); return m ? personView(m, profiles[m.id]) : null }

  const previewHtml = selectedTemplate ? fillBody(selectedTemplate.body, values) : ''

  return (
    <div className="w-full space-y-6">
      {/* Záložky */}
      <div className="flex flex-wrap gap-1 bg-white border border-[rgba(13,33,79,0.14)] p-1 w-fit">
        {(['list', 'create'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy'}`}
          >
            {t === 'list' ? 'Vydané směrnice' : '+ Vytvořit novou'}
          </button>
        ))}
      </div>

      {/* Seznam vydaných směrnic */}
      {tab === 'list' && (
        <div className="space-y-3">
          {directives.map(d => {
            const isOpen = expandedId === d.id
            const ackedIds = new Set(d.acknowledgements.map(a => personIdOf(a.employeeId)))
            const done = DEMO_TEAM.filter(m => ackedIds.has(m.id))
            const missing = DEMO_TEAM.filter(m => !ackedIds.has(m.id))
            const pct = Math.round((done.length / DEMO_TEAM.length) * 100)
            return (
              <div key={d.id} className="bg-white border border-[rgba(13,33,79,0.14)]">
                <button
                  onClick={() => setExpandedId(isOpen ? null : d.id)}
                  className="group w-full px-5 py-4 flex items-center gap-4 text-left"
                >
                  <CategoryTile theme={d.theme} />
                  <div className="flex-1 min-w-0">
                    <p className="kicker mb-0.5">{d.category || CATEGORY_STYLES[d.theme].label}</p>
                    <h3 className="text-[15px] font-headline text-navy leading-snug group-hover:text-violet transition-colors" style={{ fontWeight: 600 }}>{d.title}</h3>
                    <p className="text-xs text-navy/50 mt-1">Vydáno {formatDate(d.publishedAt)} · Platnost od {formatDate(d.validFrom)}{d.requireESign && <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.06em] bg-navy text-white px-1.5 py-0.5">Podpis DocuSign</span>}</p>
                  </div>
                  {d.mustAcknowledge ? (
                    <div className="flex-shrink-0 w-44">
                      <p className="text-xs text-navy/60 mb-1.5 text-right"><span className="font-headline text-navy text-[15px]" style={{ fontWeight: 600 }}>{done.length}</span> / {DEMO_TEAM.length} {d.requireESign ? 'podepsalo' : 'potvrdilo'}</p>
                      <div className="h-2 bg-alice"><div className="h-full bg-mint" style={{ width: `${pct}%` }} /></div>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy/50 bg-alice px-2 py-1">Bez souhlasu</span>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-navy/40" /> : <ChevronDown className="w-4 h-4 text-navy/40" />}
                </button>
                {isOpen && d.mustAcknowledge && (
                  <div className="border-t border-[rgba(13,33,79,0.08)] px-5 py-4 grid md:grid-cols-2 gap-6">
                    {[
                      { title: `Chybí (${missing.length})`, people: missing, tag: 'bg-gold text-navy', tagText: 'čeká' },
                      { title: `Potvrdili (${done.length})`, people: done, tag: 'bg-mint text-navy', tagText: '✓' },
                    ].map(g => (
                      <div key={g.title}>
                        <p className="kicker text-navy/55 mb-2">{g.title}</p>
                        {g.people.length === 0 ? <p className="text-sm text-navy/50">Nikdo.</p> : (
                          <ul className="space-y-1.5">
                            {g.people.map(m => {
                              const p = person(m.id)!
                              const ack = d.acknowledgements.find(a => personIdOf(a.employeeId) === m.id)
                              return (
                                <li key={m.id} className="flex items-center gap-2.5 text-sm">
                                  <Avatar p={p} size={26} fontSize={10} />
                                  <span className="flex-1 font-semibold text-navy truncate">{p.name}</span>
                                  {ack ? <span className="text-xs text-navy/50" title={ack.envelopeId ? `DocuSign obálka ${ack.envelopeId}` : undefined}>{ack.method === 'ESIGN' ? 'podepsáno · ' : ''}{formatDate(ack.acknowledgedAt)}</span> : <span className={`text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 ${g.tag}`}>{g.tagText}</span>}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    ))}
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
            <div className="bg-white border border-[rgba(13,33,79,0.14)] p-5">
              <p className="kicker text-navy/55 mb-3">1 · Vyberte šablonu</p>
              <div className="grid grid-cols-1 gap-3">
                {templates.map(tpl => {
                  const isSel = selectedTemplate?.id === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => selectTemplate(tpl)}
                      className={`text-left border p-3 flex items-center gap-3 transition-colors ${
                        isSel ? 'border-navy bg-alice' : 'border-[rgba(13,33,79,0.14)] hover:border-navy'
                      }`}
                    >
                      <CategoryTile theme={tpl.theme} size="sm" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-navy">{tpl.name}</span>
                        <span className="block text-xs text-navy/55">{tpl.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Fill in */}
            {selectedTemplate && (
              <div className="bg-white border border-[rgba(13,33,79,0.14)] p-5 space-y-4">
                <p className="kicker text-navy/55">2 · Vyplňte obsah</p>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60">Název směrnice</label>
                  <input
                    className="w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy focus:outline-none focus:border-violet"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Název..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60">Platnost od</label>
                  <input
                    type="date"
                    className="w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy focus:outline-none focus:border-violet"
                    value={validFrom}
                    onChange={e => setValidFrom(e.target.value)}
                  />
                </div>

                {selectedTemplate.placeholders.map(ph => (
                  <div key={ph} className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-navy/60">{ph.replace(/_/g, ' ')}</label>
                    <textarea
                      rows={ph === 'OBSAH' || ph.includes('OBSAH') || ph === 'POPIS_RIZIK' || ph === 'OCHRANA_OPATRENI' || ph === 'BENEFITY' || ph === 'PODMINKY' ? 3 : 1}
                      className="w-full border border-[rgba(13,33,79,0.25)] px-3 py-2 text-sm text-navy focus:outline-none focus:border-violet resize-none"
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
                    className="w-4 h-4 accent-violet"
                  />
                  <span className="text-sm text-navy">Vyžadovat souhlas od zaměstnanců</span>
                </label>
                {mustAck && (
                  <label className="flex items-start gap-3 cursor-pointer pl-7">
                    <input type="checkbox" checked={esign} onChange={e => setEsign(e.target.checked)} className="mt-0.5 w-4 h-4 accent-violet" />
                    <span className="text-sm text-navy">
                      Vyžadovat elektronický podpis (DocuSign)
                      <span className="block text-xs text-navy/55">Místo odkliknutí se směrnice podepíše. Hodí se třeba pro BOZP, kde kontrola chce doklad o seznámení.</span>
                    </span>
                  </label>
                )}

                <button
                  onClick={publish}
                  disabled={published}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-navy text-white text-sm font-semibold hover:bg-violet disabled:opacity-60 transition-colors"
                >
                  {published ? 'Publikováno ✓' : 'Publikovat směrnici'}
                </button>
              </div>
            )}
          </div>

          {/* Right: live preview */}
          <div className="space-y-3">
            <p className="kicker text-navy/55 px-1">Živý náhled</p>
            {selectedTemplate ? (
              <div className="max-h-[640px] overflow-y-auto bg-alice p-3">
                <LetterheadSheet
                  variant="stairs"
                  left={[<strong key="c">Four Bros s.r.o.</strong>, 'Interní směrnice', CATEGORY_STYLES[selectedTemplate.theme].label]}
                  right={[validFrom ? `Platnost od ${new Date(validFrom).toLocaleDateString('cs-CZ')}` : 'Platnost od —']}
                  title={title || selectedTemplate.name}
                  footer={<><strong className="text-navy">Four Bros s.r.o.</strong> · Interní dokument — nešiřte mimo firmu</>}
                >
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </LetterheadSheet>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[rgba(13,33,79,0.2)] h-64 flex items-center justify-center">
                <p className="text-sm text-navy/50">Vyberte šablonu vlevo pro živý náhled</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
