import type { Directive } from './mock-data'
import { escapeHtml, openLetterheadPrint } from './letterhead'

const fmt = (d: Date) => new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))

/** Interní směrnice na hlavičkovém papíře 4Bros — otevře tisk / uložení do PDF. */
export function printDirective(directive: Directive): void {
  openLetterheadPrint({
    variant: 'stairs',
    docTitle: directive.title,
    left: ['<strong>Four Bros s.r.o.</strong>', 'Interní směrnice', escapeHtml(directive.category)],
    right: [`Vydáno ${fmt(directive.publishedAt)}`, `Platnost od ${fmt(directive.validFrom)}`, directive.mustAcknowledge ? 'Vyžaduje souhlas' : ''].filter(Boolean),
    title: escapeHtml(directive.title),
    bodyHtml: directive.body,
    footerHtml: '<strong>Four Bros s.r.o.</strong> · Interní dokument — nešiřte mimo firmu',
  })
}
