/**
 * Hlavičkový papír 4Bros pro tisk / PDF (Brand 2026, varianta s tenkou mřížkou).
 * Stejný vzhled jako komponenta <LetterheadSheet> v aplikaci.
 */

export const LETTERHEAD_COMPANY = {
  name: 'Four Bros s.r.o.',
  ico: '',
  address: '',
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export type LetterheadVariant = 'grid' | 'stairs'

export interface LetterheadDoc {
  /** 'grid' = tenká mřížka (smlouvy), 'stairs' = čtverce do schodů (směrnice) */
  variant?: LetterheadVariant
  /** <title> okna / název souboru při uložení do PDF */
  docTitle: string
  left: string[]
  right: string[]
  title: string
  subtitle?: string
  /** HTML obsah dokumentu (už ošetřený) */
  bodyHtml: string
  /** HTML patičky na konci dokumentu (firma, IČO, sídlo) */
  footerHtml?: string
}

export function buildLetterheadHtml(doc: LetterheadDoc): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const lines = (arr: string[]) => arr.map((l) => `<p>${l}</p>`).join('')
  // Schody: 4 čtverce 46,6 mm, sestupují zprava doleva (jen první stránka)
  const stairs = [[157, 90], [111, 138], [65, 187], [19, 235]]
    .map(([x, y]) => `<div class="stair" style="left:${x}mm;top:${y}mm"></div>`).join('')
  const decor = (doc.variant ?? 'grid') === 'grid' ? '<div class="grid"></div>' : stairs
  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8"/>
<title>${escapeHtml(doc.docTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@400;600&family=Funnel+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
  @page { size: A4; margin: 16mm 0 18mm; }
  @page :first { margin-top: 0; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  body {
    font-family: 'Funnel Sans', system-ui, sans-serif;
    color: #0d214f;
    font-size: 9.5pt;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  /* Tenká mřížka — position:fixed se v tisku opakuje na každé straně */
  .grid {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(to right, #ebe7f8 0.6pt, transparent 0.6pt),
      linear-gradient(to bottom, #ebe7f8 0.6pt, transparent 0.6pt);
    background-size: 25% 100%, 100% 74mm;
    background-position: 0 0, 0 52mm;
  }
  .stair { position: absolute; width: 46.6mm; height: 46.6mm; background: #f4f2fc; z-index: 0; }
  .sheet { position: relative; z-index: 1; padding: 16mm 18mm 0; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 11mm; }
  .logo { height: 8mm; display: block; }
  .slogan { font-weight: 700; font-size: 8.5pt; line-height: 1.35; text-align: right; }
  .contacts { display: grid; grid-template-columns: 25% 25%; font-size: 8.5pt; line-height: 1.4; margin-bottom: 14mm; }
  .contacts p { margin: 0; }
  h1.title {
    font-family: 'Funnel Display', 'Funnel Sans', sans-serif; font-weight: 600;
    font-size: 24pt; line-height: 1.12; letter-spacing: -0.01em; width: 75%; margin-bottom: 5mm;
  }
  .subtitle { font-family: 'Funnel Display', 'Funnel Sans', sans-serif; font-weight: 600; font-size: 13pt; line-height: 1.25; width: 75%; margin-bottom: 8mm; }
  .body { width: 75%; }
  .body h2 { font-family: 'Funnel Display', sans-serif; font-weight: 600; font-size: 12pt; margin: 7mm 0 2.5mm; break-after: avoid; }
  .body h3 { font-family: 'Funnel Display', sans-serif; font-weight: 600; font-size: 10.5pt; margin: 5mm 0 2mm; break-after: avoid; }
  .body p { margin-bottom: 2.5mm; }
  .body ul, .body ol { padding-left: 5mm; margin-bottom: 2.5mm; }
  .body li { margin-bottom: 1mm; }
  .body strong { font-weight: 700; }
  .body table { border-collapse: collapse; }
  .footer { margin-top: 12mm; padding: 3mm 0 0; border-top: 0.6pt solid rgba(13,33,79,0.2); font-size: 7.5pt; color: rgba(13,33,79,0.6); width: 75%; }
  /* Podpisy */
  .sigs { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 12mm; break-inside: avoid; }
  .sig-role { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9mm; }
  .sig-line { border-bottom: 0.8pt solid #0d214f; height: 10mm; }
  .sig-name { font-weight: 600; margin-top: 1.5mm; }
  .sig-meta { font-size: 7.5pt; color: rgba(13,33,79,0.6); }
  .sig-ok { color: #1e7e46; font-weight: 700; }
  /* Smluvní strany */
  .parties { width: 100%; margin-bottom: 6mm; }
  .parties td { padding: 0.6mm 0; vertical-align: top; }
  .parties td:first-child { width: 38mm; color: rgba(13,33,79,0.65); }
  .kicker { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin: 6mm 0 2mm; }
</style>
</head>
<body>
${decor}
<div class="sheet">
  <div class="top">
    <img class="logo" src="${origin}/brand/logo.svg" alt="4BROS"/>
    <div class="slogan">4 kroky k marketingu,<br/>který dává smysl.</div>
  </div>
  <div class="contacts"><div>${lines(doc.left)}</div><div>${lines(doc.right)}</div></div>
  <h1 class="title">${doc.title}</h1>
  ${doc.subtitle ? `<div class="subtitle">${doc.subtitle}</div>` : ''}
  <div class="body">${doc.bodyHtml}</div>
  ${doc.footerHtml ? `<div class="footer">${doc.footerHtml}</div>` : ''}
</div>
<script>document.fonts.ready.then(function(){ setTimeout(function(){ window.print(); }, 150); });</script>
</body>
</html>`
}

/** Otevře dokument v novém okně a vyvolá tisk (odtud „Uložit jako PDF“). */
export function openLetterheadPrint(doc: LetterheadDoc): void {
  const win = window.open('', '_blank', 'width=960,height=900')
  if (!win) return
  win.document.write(buildLetterheadHtml(doc))
  win.document.close()
}
