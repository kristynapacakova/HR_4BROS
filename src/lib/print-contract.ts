import type { Contract, ContractTemplate } from './mock-data'
import { loadDesign, fontStack } from '@/app/admin/smlouvy/ContractDesignerClient'

function fillPlaceholders(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
}

function sigBox(role: string, name: string, city: string, signedDate: string | null, pc: string): string {
  // Use rgba instead of opacity so children are not affected
  const muted = hexToRgba(pc, 0.45)
  const dim   = hexToRgba(pc, 0.25)
  return `
  <div>
    <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${muted};margin-bottom:16px;">${role}</p>
    <p style="font-size:11px;color:${muted};margin-bottom:32px;">V ${city}, dne ${signedDate ?? '____________________'}</p>
    <div style="height:0;width:240px;border-bottom:1px solid ${dim};margin-bottom:8px;"></div>
    <p style="font-size:12px;color:${pc};font-weight:${signedDate ? '600' : '400'};">${name}</p>
    ${signedDate
      ? `<p style="font-size:9.5px;color:#16a34a;margin-top:5px;font-weight:600;">✓ Podepsáno ${signedDate}</p>`
      : `<p style="font-size:9.5px;color:#94a3b8;margin-top:3px;">Čeká na podpis</p>`}
  </div>`
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function printContract(contract: Contract, template: ContractTemplate | undefined): void {
  const design = loadDesign()
  const body = fillPlaceholders(template?.body ?? '', contract.values)
  const signedAt = contract.employeeSignedAt   ? new Date(contract.employeeSignedAt).toLocaleDateString('cs-CZ')   : null
  const mgmtAt   = contract.managementSignedAt ? new Date(contract.managementSignedAt).toLocaleDateString('cs-CZ') : null
  const origin   = typeof window !== 'undefined' ? window.location.origin : ''

  const logoSrc  = design.logoDataUrl  ?? `${origin}/brand/logo.png`
  const decorSrc = design.decorDataUrl ?? `${origin}/brand/watercolor.png`

  const pc = design.primaryColor
  const ac = design.accentColor

  const h  = design.typo.heading
  const sh = design.typo.subheading
  const b  = design.typo.body

  const hFF  = fontStack(h.fontFamily)
  const shFF = fontStack(sh.fontFamily)
  const bFF  = fontStack(b.fontFamily)

  const needsRoboto   = [h.fontFamily, sh.fontFamily, b.fontFamily].includes('roboto')
  const needsSerenity = [h.fontFamily, sh.fontFamily, b.fontFamily].includes('serenity')

  const pcMuted  = hexToRgba(pc, 0.45)
  const pcDim    = hexToRgba(pc, 0.25)
  const pcSubtle = hexToRgba(pc, 0.15)

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8"/>
  <title>${contract.templateName} — ${contract.employeeName}</title>
  ${needsRoboto ? '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>' : ''}
  <style>
    ${needsSerenity ? `
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Light.otf') format('opentype'); font-weight:300; font-style:normal; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Book.otf') format('opentype'); font-weight:400; font-style:normal; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Regular.otf') format('opentype'); font-weight:450; font-style:normal; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Medium.otf') format('opentype'); font-weight:500; font-style:normal; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-SemiBold.otf') format('opentype'); font-weight:600; font-style:normal; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-SemiBold.otf') format('opentype'); font-weight:700; font-style:normal; }
    ` : ''}

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${bFF};
      font-weight: ${b.fontWeight};
      font-style: ${b.italic ? 'italic' : 'normal'};
      color: ${pc};
      background: #fff;
      font-size: ${b.fontSize}px;
      line-height: 1.8;
      -webkit-font-smoothing: antialiased;
    }

    /* Each .page is a flexbox column so footer sticks to bottom */
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      display: flex;
      flex-direction: column;
    }

    .page-main { flex: 1; }

    /* ── Header (no top bar — watercolor does the decoration) ── */
    .page-header {
      position: relative;
      padding: 28px 52px 16px;
      overflow: hidden;
    }
    .header-logo  { height: 44px; object-fit: contain; display: block; }
    .header-decor {
      position: absolute;
      top: 0; right: 0;
      height: 110px;
      object-fit: contain;
      pointer-events: none;
    }

    /* ── Footer ── */
    .page-footer {
      padding: 14px 52px;
      border-top: 1px solid ${pcSubtle};
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .footer-text {
      font-family: ${bFF};
      font-size: 8.5px;
      color: ${pcMuted};
      line-height: 1.6;
    }
    .footer-text strong { font-weight: 600; color: ${pc}; }
    .footer-logo { height: 22px; object-fit: contain; opacity: 0.3; }

    /* ── Cover page ── */
    .cover-body {
      padding: 0 52px 48px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .cover-byline {
      font-family: ${bFF};
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: ${ac};
      margin-bottom: 16px;
    }
    .cover-title {
      font-family: ${hFF};
      font-size: 40px;
      font-weight: ${h.fontWeight};
      font-style: ${h.italic ? 'italic' : 'normal'};
      color: ${pc};
      line-height: 1.1;
    }
    .cover-divider {
      width: 48px;
      height: 3px;
      background: ${ac};
      border-radius: 2px;
      margin: 28px 0;
    }
    .cover-date {
      font-family: ${bFF};
      font-size: 10px;
      color: ${pcMuted};
    }

    /* ── Content page ── */
    .content-page { padding: 8px 52px 40px; flex: 1; }

    .preamble {
      font-family: ${bFF};
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      color: ${pcMuted};
      letter-spacing: 0.05em;
      margin-bottom: 28px;
      line-height: 1.7;
    }

    /* Parties block */
    .party-block {
      background: #F7F8FE;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 10px;
    }
    .party-block-title {
      font-family: ${bFF};
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: ${pcMuted};
      margin-bottom: 10px;
    }
    .parties-table { width: 100%; }
    .parties-table td {
      padding: 3px 0;
      font-family: ${bFF};
      font-size: ${b.fontSize}px;
      font-weight: ${b.fontWeight};
      color: ${pc};
      vertical-align: top;
    }
    .parties-table td:first-child { width: 150px; color: ${pcMuted}; }

    .party-sep {
      margin: 10px 0;
      font-size: 13px;
      color: ${pcDim};
      font-weight: 700;
      text-align: center;
    }
    .party-note {
      font-size: ${b.fontSize}px;
      font-weight: ${b.fontWeight};
      color: ${pcMuted};
      margin-top: 8px;
    }

    .section-bold {
      font-size: ${b.fontSize}px;
      font-weight: 700;
      color: ${pc};
      margin: 20px 0 14px;
      letter-spacing: 0.04em;
    }

    /* Body content */
    .contract-content { color: ${pc}; }
    .contract-content h2 {
      font-family: ${hFF};
      font-size: ${h.fontSize}px;
      font-weight: ${h.fontWeight};
      font-style: ${h.italic ? 'italic' : 'normal'};
      color: ${pc};
      margin-top: 28px;
      margin-bottom: 10px;
      padding-bottom: 7px;
      border-bottom: 1px solid ${pcSubtle};
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    .contract-content h3 {
      font-family: ${shFF};
      font-size: ${sh.fontSize}px;
      font-weight: ${sh.fontWeight};
      font-style: ${sh.italic ? 'italic' : 'normal'};
      color: ${ac};
      margin-top: 16px;
      margin-bottom: 6px;
      padding-left: 10px;
      border-left: 3px solid ${ac};
    }
    .contract-content p  { font-family: ${bFF}; font-size: ${b.fontSize}px; font-weight: ${b.fontWeight}; font-style: ${b.italic ? 'italic' : 'normal'}; margin-bottom: 10px; color: ${pc}; }
    .contract-content ul, .contract-content ol { padding-left: 20px; margin-bottom: 10px; }
    .contract-content li { font-family: ${bFF}; font-size: ${b.fontSize}px; font-weight: ${b.fontWeight}; font-style: ${b.italic ? 'italic' : 'normal'}; margin-bottom: 4px; color: ${pc}; }
    .contract-content strong { font-weight: 700; }

    /* Signatures */
    .sig-section {
      background: #F7F8FE;
      border-radius: 8px;
      padding: 20px 24px;
      margin-top: 32px;
    }
    .sig-preamble {
      font-family: ${bFF};
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: ${pcMuted};
      margin-bottom: 24px;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    @media print {
      body { background: #fff; }
      .page { width: 100%; }
      @page { margin: 0; size: A4; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>

<!-- ══ COVER PAGE ══ -->
<div class="page">
  <div class="page-main">
    <div class="page-header">
      <img class="header-logo" src="${logoSrc}" alt="4BROS" />
      <img class="header-decor" src="${decorSrc}" alt="" />
    </div>

    <div class="cover-body">
      <div class="cover-byline">${design.companyName} &nbsp;·&nbsp; ${contract.employeeName}</div>
      <div class="cover-title">${contract.templateName}</div>
      <div class="cover-divider"></div>
      <div class="cover-date">${contract.createdAt.toLocaleDateString('cs-CZ')}</div>
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-text">
      <strong>${design.companyName}</strong> &nbsp;·&nbsp; IČO: ${design.companyIco} &nbsp;·&nbsp; ${design.companyAddress}
    </div>
    <img class="footer-logo" src="${logoSrc}" alt="" />
  </div>
</div>

<!-- ══ CONTENT PAGE ══ -->
<div class="page page-break">
  <div class="page-main">
    <div class="page-header">
      <img class="header-logo" src="${logoSrc}" alt="4BROS" />
      <img class="header-decor" src="${decorSrc}" alt="" />
    </div>

    <div class="content-page">
      <div class="preamble">
        TATO ${contract.templateName.toUpperCase()} BYLA UZAVŘENA NÍŽE UVEDENÉHO DNE, MĚSÍCE A ROKU MEZI TĚMITO SMLUVNÍMI STRANAMI
      </div>

      <div class="party-block">
        <div class="party-block-title">Zaměstnanec</div>
        <table class="parties-table">
          <tr><td>Jméno:</td><td>${contract.employeeName}</td></tr>
          ${contract.values.DATUM_NASTUPU ? `<tr><td>Datum nástupu:</td><td>${contract.values.DATUM_NASTUPU}</td></tr>` : ''}
          ${contract.values.POZICE ? `<tr><td>Pracovní pozice:</td><td>${contract.values.POZICE}</td></tr>` : ''}
          ${contract.values.MZDA ? `<tr><td>Mzda:</td><td>${contract.values.MZDA}</td></tr>` : ''}
          ${contract.values.HODINOVA_SAZBA ? `<tr><td>Hodinová sazba:</td><td>${contract.values.HODINOVA_SAZBA}</td></tr>` : ''}
          ${contract.values.MAX_HODIN ? `<tr><td>Max. hodin ročně:</td><td>${contract.values.MAX_HODIN}</td></tr>` : ''}
          ${contract.values.TYDENNI_UVAZEK ? `<tr><td>Týdenní úvazek:</td><td>${contract.values.TYDENNI_UVAZEK} hod</td></tr>` : ''}
        </table>
        <p class="party-note">(dále jako <strong>„Zaměstnanec"</strong>)</p>
      </div>

      <p class="party-sep">a</p>

      <div class="party-block">
        <div class="party-block-title">Zaměstnavatel</div>
        <table class="parties-table">
          <tr><td>Firma:</td><td>${design.companyName}</td></tr>
          <tr><td>IČO:</td><td>${design.companyIco}</td></tr>
          <tr><td>Sídlo:</td><td>${design.companyAddress}</td></tr>
        </table>
        <p class="party-note">(dále jako <strong>„Zaměstnavatel"</strong>)</p>
      </div>

      <p class="section-bold">SMLUVNÍ STRANY UJEDNÁVAJÍ NÁSLEDUJÍCÍ:</p>

      <div class="contract-content">${body}</div>

      <div class="sig-section">
        <div class="sig-preamble">NA DŮKAZ ČEHOŽ SMLUVNÍ STRANY PŘIPOJUJÍ SVÉ PODPISY</div>
        <div class="sig-grid">
          ${sigBox('Zaměstnavatel — ' + design.companyName, design.companyName, 'Praze', mgmtAt, pc)}
          ${sigBox('Zaměstnanec', contract.employeeName, 'Praze', signedAt, pc)}
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-text">
      <strong>${design.companyName}</strong> &nbsp;·&nbsp; IČO: ${design.companyIco} &nbsp;·&nbsp; ${design.companyAddress}
    </div>
    <img class="footer-logo" src="${logoSrc}" alt="" />
  </div>
</div>

<script>document.fonts.ready.then(function(){ window.print(); });</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=960,height=900')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
