/**
 * Smlouvy a dohody ve vzhledu „Šablona dokumentů Four Bros – brand 2026“
 * (podklad: HR | 4B smlouvy/4Bros_sablona_dokumentu — SABLONA_4Bros.md + Vzor_dokumentu_4Bros.pdf).
 *
 * Vzhled:
 * - A4, okraje 18 mm, text 174 mm = 4sloupcový grid po 43,5 mm, řádkování 1,15, odstavce do bloku.
 * - Tělo Funnel Sans 9,5 pt; nadpisy Funnel Display SemiBold (titulek 30 pt, příloha 17 pt, článek 12 pt, mezititulek 11 pt).
 * - Barvy: veškerý text navy #0D214F; čísla článků, odrážky ■ a popisky „Připraveno pro/kým“ fialová #834DFB;
 *   žlutá #F0E100 JEN pro pole k doplnění […]; záhlaví tabulek #F3F0FD, jemné linky #D9D5EA.
 * - Pozadí: titulní strana /brand/doc/bg_cover.png (logo, slogan, schody, rožky), ostatní /brand/doc/bg_page.png.
 * - Patička: „Four Bros s.r.o. · IČO · adresa · fourbros.cz“ vlevo, „X z Y“ vpravo (na titulce bez čísla).
 *
 * Struktura: titulní strana → úvodní věta (velké, tučné, na střed) → smluvní strany (tabulka bez linek,
 * popisek 1 sloupec, údaj tučně 3 sloupce, „(dále jen …)“, mezi nimi „a“) → uvozující věta → články
 * („1.“ fialově + název; body „1.1“ tučně s odsazením) → závěrečná věta → podpisy vedle sebe (linka, strana tučně, jméno).
 *
 * Ostrá verze: PDF/DOCX generovat na serveru stejnou šablonou (technicka_sablona: docx 9.6.1 + finalize.py),
 * tenhle HTML výstup slouží pro náhled v aplikaci a tisk do PDF z prohlížeče.
 */

export const DOC_COMPANY_DEFAULT = {
  name: 'Four Bros s.r.o.',
  ico: '05834252',
  address: 'Křídlovická 371/68, 603 00 Brno',
  web: 'fourbros.cz',
  signPlace: 'Brně',
  /** jednatel, který za firmu podepisuje */
  signatory: '',
}
export type DocCompany = typeof DOC_COMPANY_DEFAULT

export interface DocParty {
  rows: [string, string][] // [popisek, údaj]
  alias: string // „Zaměstnavatel“
}
export interface DocArticleItem {
  kind: 'pt' | 'p' | 'li' // pt = číslovaný bod 1.1, p = odstavec bez čísla, li = odrážka ■
  html: string
}
export interface DocArticle {
  title: string
  items: DocArticleItem[]
}
export interface DocSignature {
  place: string
  date: string
  party: string
  name: string
  note?: string // např. „Podepsáno elektronicky 15. 1. 2026“
}
export interface ContractDocModel {
  title: string
  preparedFor: string
  preparedBy: string
  intro: string
  parties: DocParty[]
  lead: string
  articles: DocArticle[]
  closing: string
  signatures: DocSignature[]
  company: DocCompany
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
/** Nezlomitelná mezera po jednopísmenných předložkách a spojkách. */
function nbsp(html: string): string {
  return html.replace(/(^|[\s(„>])([aikosuvzAIKOSUVZ]) (?=\S)/g, '$1$2 ')
}
/** Pole k doplnění […] podbarvit žlutě. */
function marks(html: string): string {
  return html.replace(/\[([^\]<]+)\]/g, '<mark>[$1]</mark>')
}
const rich = (html: string) => marks(nbsp(html))

const LABELS: Record<string, string> = {
  ZAMESTNAVATEL: 'zaměstnavatel', JMENO: 'jméno a příjmení', POZICE: 'pozice', MISTO_VYKONU: 'místo výkonu práce',
  MZDA: 'mzda', DATUM_NASTUPU: 'datum nástupu', ZKUSEBNI_DOBA: 'zkušební doba', TYDENNI_UVAZEK: 'počet hodin',
  MISTO_PODPISU: 'místo', DATUM_PODPISU: 'datum', HODINOVA_SAZBA: 'odměna', MAX_HODIN: 'počet hodin',
  DATUM_UKONCENI: 'datum ukončení', CISLO_DODATKU: 'číslo', DATUM_PUVODNI_SMLOUVY: 'datum', POPIS_ZMENY: 'popis změny',
  DATUM_UCINNOSTI: 'datum účinnosti', NOVA_MZDA: 'nová mzda',
}
/** {{KLIC}} → hodnota, prázdné → [popisek k doplnění] (žlutě). */
export function fillValues(body: string, values: Record<string, string>, labels: Record<string, string> = {}): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => (values[k]?.trim() ? esc(values[k]) : `[${labels[k] ?? LABELS[k] ?? k.toLowerCase().replace(/^f_/, '').replace(/_/g, ' ')}]`))
}
export function placeholderLabel(k: string, labels: Record<string, string> = {}): string {
  const l = labels[k] ?? LABELS[k] ?? k.toLowerCase().replace(/^f_/, '').replace(/_/g, ' ')
  return l.charAt(0).toUpperCase() + l.slice(1)
}

/**
 * Šablona v HTML (h2 název, h3 sekce, p odstavce) → články.
 * Sekce „Smluvní strany“ a závěrečné „V … dne …“ se vynechají — strany i podpisy má šablona zvlášť.
 */
export function articlesFromTemplate(filledHtml: string): { heading: string; articles: DocArticle[] } {
  const heading = (filledHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? '').trim()
  const parts = filledHtml.split(/<h3[^>]*>/i).slice(1)
  const articles: DocArticle[] = []
  for (const part of parts) {
    const [titleRaw, rest = ''] = part.split(/<\/h3>/i)
    const title = titleRaw.replace(/<[^>]+>/g, '').trim()
    if (/smluvní strany/i.test(title)) continue
    const items = (rest.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? []).map(m => {
      const cls = m.match(/^<p[^>]*class="(\w+)"/i)?.[1]
      const kind: DocArticleItem['kind'] = cls === 'li' ? 'li' : cls === 'p' ? 'p' : 'pt'
      return { kind, html: m.replace(/^<p[^>]*>|<\/p>$/gi, '').trim() }
    }).filter(it => it.html && !/^V\s.*\sdne\s/.test(it.html.replace(/<[^>]+>/g, '')))
    if (items.length) articles.push({ title, items })
  }
  return { heading, articles }
}

const CSS = `
  @page { size: A4; margin: 15mm 18mm 20mm;
    @bottom-left { content: "FOOT"; font-family: 'Funnel Sans', sans-serif; font-size: 7pt; font-weight: 600; color: #0d214f; vertical-align: top; padding-top: 8mm; }
    @bottom-right { content: counter(page) " z " counter(pages); font-family: 'Funnel Sans', sans-serif; font-size: 9pt; color: #0d214f; vertical-align: top; padding-top: 7.5mm; }
  }
  @page :first { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  body { font-family: 'Funnel Sans', system-ui, sans-serif; color: #0d214f; font-size: 9.5pt; line-height: 1.15;
    -webkit-print-color-adjust: exact; print-color-adjust: exact; -webkit-font-smoothing: antialiased; }
  .hd { font-family: 'Funnel Display', 'Funnel Sans', sans-serif; font-weight: 600; }
  mark { background: #f0e100; color: #0d214f; padding: 0 0.4mm; }
  strong, b { font-weight: 700; }

  /* titulní strana */
  .cover { position: relative; width: 210mm; height: 297mm; background: #fff url(BG_COVER) center / 100% 100% no-repeat; break-after: page; overflow: hidden; z-index: 2; }
  .cover h1 { position: absolute; left: 18mm; top: 101mm; width: 130mm; font-size: 30pt; line-height: 1.08; letter-spacing: -0.01em; }
  .cover .prep { position: absolute; left: 18mm; top: 126mm; width: 120mm; font-size: 10.5pt; line-height: 1.3; }
  .cover .prep p.l { color: #834dfb; font-weight: 700; font-size: 8pt; margin-top: 4.5mm; }
  .cover .prep p.l:first-child { margin-top: 0; }
  .cover .foot { position: absolute; left: 18mm; bottom: 14mm; font-size: 7pt; font-weight: 600; }

  /* obsahové strany v tisku: logo a slogan = hlavička tabulky (thead se opakuje na každé straně), schody = position:fixed.
     Geometrie jako bg_page.png: čtverce 43,5 mm (1 sloupec gridu), dolní hrana 277 mm, souřadnice vůči ploše textu (okraj 18 / 15 mm). */
  .pagebg { position: fixed; left: 0; top: 0; width: 174mm; height: 262mm; z-index: 0; }
  table.frame { width: 100%; border-collapse: collapse; position: relative; z-index: 1; }
  table.frame > thead td, table.frame > tbody > tr > td { padding: 0; vertical-align: top; }
  .phead { height: 19mm; display: flex; justify-content: space-between; align-items: flex-start; }
  .phead img { width: 32mm; height: auto; display: block; }
  .phead .tag { font-family: 'Funnel Display', sans-serif; font-weight: 600; font-size: 8.5pt; line-height: 1.25; text-align: right; margin-top: -0.6mm; }
  .pagebg i { position: absolute; width: 43.5mm; height: 43.5mm; background: #f8f6fe; }
  .content { position: relative; z-index: 1; text-align: justify; hyphens: auto; }

  .intro { text-align: center; font-weight: 700; text-transform: uppercase; margin: 2mm 0 7mm; }
  .party { width: 100%; border-collapse: collapse; }
  .party td { padding: 0.9mm 0; vertical-align: top; text-align: left; }
  .party td:first-child { width: 43.5mm; }
  .party td:last-child { font-weight: 700; }
  .alias { margin: 2.5mm 0 5mm; }
  .and { text-align: center; margin: 0 0 5mm; }
  .lead { font-weight: 700; text-transform: uppercase; margin: 7mm 0 2mm; text-align: left; }
  .art { break-inside: auto; }
  .art h2 { font-size: 12pt; display: flex; gap: 0; margin: 7mm 0 3mm; break-after: avoid; text-align: left; }
  .art h2 .n { color: #834dfb; width: 18mm; flex-shrink: 0; }
  .pt { display: flex; margin-bottom: 2.6mm; }
  .pt .n { font-weight: 700; width: 18mm; flex-shrink: 0; }
  .pt .t { flex: 1; }
  .p { margin-bottom: 2.6mm; }
  ul.b { list-style: none; margin: 0 0 2.6mm 3mm; }
  ul.b li { display: flex; gap: 4mm; margin-bottom: 1.4mm; }
  ul.b li::before { content: "■"; color: #834dfb; font-size: 7pt; line-height: 1.6; }
  h3.sub { font-size: 11pt; margin: 6mm 0 2mm; }
  .annex h2 { font-size: 17pt; margin: 9mm 0 4mm; }
  table.t { width: 100%; border-collapse: collapse; font-size: 9pt; }
  table.t th { background: #f3f0fd; text-align: left; font-weight: 700; padding: 2.4mm 2mm; border-bottom: 0.8pt solid #0d214f; }
  table.t td { padding: 2.4mm 2mm; border-bottom: 0.5pt solid #d9d5ea; }

  .closing { font-weight: 700; text-transform: uppercase; margin: 9mm 0 5mm; text-align: left; break-after: avoid; }
  .sigs { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; break-inside: avoid; text-align: left; }
  .sig .space { height: 22mm; border-bottom: 0.8pt solid #0d214f; margin-top: 3mm; }
  .sig .party { font-weight: 700; margin-top: 2mm; }
  .sig .note { font-size: 7.5pt; color: rgba(13,33,79,0.6); margin-top: 1mm; }

  /* náhled na obrazovce: strany jako listy A4 */
  @media screen {
    body { background: #ebe8f6; padding: 16px 0; }
    .cover, .sheet { margin: 0 auto 16px; box-shadow: 0 1px 3px rgba(13,33,79,0.15); }
    .sheet { position: relative; width: 210mm; min-height: 297mm; padding: 34mm 18mm 26mm; background: #fff url(BG_PAGE) top center / 210mm 297mm no-repeat; }
    .pagebg, table.frame > thead { display: none; }
    .sheet .sfoot { position: absolute; left: 18mm; right: 18mm; bottom: 12mm; display: flex; justify-content: space-between; font-size: 7pt; font-weight: 600; }
  }
  @media print { .sheet .sfoot { display: none; } .sheet { padding: 0; } }
`

export function buildContractDocHtml(m: ContractDocModel, opts: { print?: boolean; origin?: string } = {}): string {
  const origin = opts.origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const foot = `${esc(m.company.name)} · IČO ${esc(m.company.ico)} · ${esc(m.company.address)} · ${esc(m.company.web)}`
  const css = CSS.replace('FOOT', foot.replace(/["\\]/g, ''))
    .replace(/BG_COVER/g, `${origin}/brand/doc/bg_cover.png`).replace(/BG_PAGE/g, `${origin}/brand/doc/bg_page.png`)
  const party = (p: DocParty) => `
    <table class="party">${p.rows.map(([l, v]) => `<tr><td>${esc(l)}</td><td>${rich(v)}</td></tr>`).join('')}</table>
    <p class="alias">(dále jen „${esc(p.alias)}“)</p>`
  const articles = m.articles.map((a, i) => {
    let n = 0
    let html = ''
    let list: string[] = []
    const flush = () => { if (list.length) { html += `<ul class="b">${list.map(l => `<li><span>${rich(l)}</span></li>`).join('')}</ul>`; list = [] } }
    for (const it of a.items) {
      if (it.kind === 'li') { list.push(it.html); continue }
      flush()
      html += it.kind === 'p'
        ? `<p class="p">${rich(it.html)}</p>`
        : `<div class="pt"><span class="n">${i + 1}.${++n}</span><span class="t">${rich(it.html)}</span></div>`
    }
    flush()
    return `
    <section class="art">
      <h2 class="hd"><span class="n">${i + 1}.</span><span>${rich(a.title)}</span></h2>
      ${html}
    </section>`
  }).join('')
  const sigs = m.signatures.map(s => `
    <div class="sig">
      <p>V ${rich(esc(s.place))} dne ${rich(esc(s.date))}</p>
      <div class="space"></div>
      <p class="party">${esc(s.party)}</p>
      <p>${rich(esc(s.name))}</p>
      ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
    </div>`).join('')

  return `<!DOCTYPE html>
<html lang="cs"><head><meta charset="UTF-8"/>
<title>${esc(m.title)} — ${esc(m.preparedFor)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@600&family=Funnel+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>${css}</style></head>
<body>
  <div class="cover">
    <h1 class="hd">${rich(esc(m.title))}</h1>
    <div class="prep">
      <p class="l">Připraveno pro:</p><p>${rich(esc(m.preparedFor))}</p>
      <p class="l">Připraveno kým:</p><p>${esc(m.preparedBy)}</p>
    </div>
    <div class="foot">${foot}</div>
  </div>
  <div class="pagebg">${[0, 1, 2, 3].map(i => `<i style="left:${(3 - i) * 43.5}mm;top:${103 - 15 + i * 43.5}mm"></i>`).join('')}</div>
  <div class="sheet">
    <table class="frame"><thead><tr><td><div class="phead"><img src="${origin}/brand/logo.svg" alt="4BROS"/><div class="tag">4 kroky k marketingu,<br/>který dává smysl.</div></div></td></tr></thead>
    <tbody><tr><td>
    <div class="content">
      <p class="intro">${rich(esc(m.intro))}</p>
      ${m.parties.map(party).join('<p class="and">a</p>')}
      <p class="lead">${rich(esc(m.lead))}</p>
      ${articles}
      <p class="closing">${esc(m.closing)}</p>
      <div class="sigs">${sigs}</div>
    </div>
    </td></tr></tbody></table>
    <div class="sfoot"><span>${foot}</span></div>
  </div>
  ${opts.print ? `<script>document.fonts.ready.then(function(){ setTimeout(function(){ window.print(); }, 250); });</script>` : ''}
</body></html>`
}

export function openContractDocPrint(m: ContractDocModel) {
  const win = window.open('', '_blank', 'width=960,height=900')
  if (!win) return
  win.document.write(buildContractDocHtml(m, { print: true }))
  win.document.close()
}
