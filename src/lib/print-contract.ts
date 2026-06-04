import type { Contract, ContractTemplate } from './mock-data'
import { loadDesign, fontStack } from '@/app/admin/smlouvy/ContractDesignerClient'

function fillPlaceholders(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
}

function statusBadge(status: Contract['status']): string {
  const map: Record<Contract['status'], [string, string]> = {
    DRAFT:              ['#475569', '#f1f5f9'],
    PENDING_MANAGEMENT: ['#92400e', '#fef3c7'],
    PENDING_EMPLOYEE:   ['#1e40af', '#dbeafe'],
    SIGNED:             ['#166534', '#dcfce7'],
  }
  const labels: Record<Contract['status'], string> = {
    DRAFT: 'Návrh', PENDING_MANAGEMENT: 'Čeká na podpis vedení',
    PENDING_EMPLOYEE: 'Čeká na podpis zaměstnance', SIGNED: 'Podepsáno',
  }
  const [color, bg] = map[status]
  return `<span style="display:inline-block;padding:3px 12px;border-radius:999px;font-size:9.5px;font-weight:700;letter-spacing:0.04em;background:${bg};color:${color};">${labels[status]}</span>`
}

function pageFooter(companyName: string, ico: string, address: string, logoSrc: string, pc: string): string {
  return `
  <div style="position:absolute;bottom:0;left:0;right:0;height:36px;background:${pc};display:flex;align-items:center;justify-content:space-between;padding:0 52px;">
    <span style="font-size:8px;color:rgba(255,255,255,0.55);letter-spacing:0.03em;">
      <strong style="color:rgba(255,255,255,0.85);font-weight:600;">${companyName}</strong>
      &nbsp;·&nbsp; IČO: ${ico} &nbsp;·&nbsp; ${address}
    </span>
    <img src="${logoSrc}" alt="" style="height:16px;object-fit:contain;opacity:0.35;filter:brightness(10);" />
  </div>`
}

function sigBox(role: string, name: string, city: string, signedDate: string | null, pc: string): string {
  return `
  <div>
    <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${pc};opacity:0.45;margin-bottom:16px;">${role}</p>
    <p style="font-size:11px;color:${pc};opacity:0.5;margin-bottom:32px;">V ${city}, dne ${signedDate ?? '____________________'}</p>
    <div style="height:1px;width:240px;border-bottom:1.5px solid ${pc};opacity:0.2;margin-bottom:8px;"></div>
    <p style="font-size:12px;color:${pc};font-weight:${signedDate ? '600' : '400'};">${name}</p>
    ${signedDate ? `<p style="font-size:9.5px;color:#16a34a;margin-top:5px;font-weight:600;">✓ Podepsáno ${signedDate}</p>` : `<p style="font-size:9.5px;color:#94a3b8;margin-top:3px;">Čeká na podpis</p>`}
  </div>`
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

  const footer = pageFooter(design.companyName, design.companyIco, design.companyAddress, logoSrc, pc)

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

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      position: relative;
      padding-bottom: 36px; /* room for footer */
    }

    /* ── Gradient accent bar (top of every page) ── */
    .accent-bar {
      height: 5px;
      background: linear-gradient(90deg, ${pc} 0%, ${ac} 100%);
    }

    /* ── Header ── */
    .page-header {
      position: relative;
      padding: 24px 52px 18px;
      overflow: hidden;
    }
    .header-logo  { height: 44px; object-fit: contain; display: block; }
    .header-decor { position: absolute; top: 0; right: 0; height: 100px; object-fit: contain; pointer-events: none; }

    /* ── Cover ── */
    .cover-body {
      padding: 0 52px 52px;
      min-height: calc(297mm - 160px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cover-eyebrow {
      font-family: ${bFF};
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: ${ac};
      margin-top: 60px;
      margin-bottom: 14px;
    }
    .cover-title {
      font-family: ${hFF};
      font-size: 38px;
      font-weight: ${h.fontWeight};
      font-style: ${h.italic ? 'italic' : 'normal'};
      color: ${pc};
      line-height: 1.15;
      margin-bottom: 40px;
    }
    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border: 1px solid ${pc}18;
      border-radius: 8px;
      overflow: hidden;
      width: 380px;
    }
    .cover-meta-cell {
      padding: 14px 18px;
      border-right: 1px solid ${pc}18;
      border-bottom: 1px solid ${pc}18;
    }
    .cover-meta-cell:nth-child(even) { border-right: none; }
    .cover-meta-cell:nth-last-child(-n+2) { border-bottom: none; }
    .cover-meta-label {
      font-family: ${bFF};
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: ${pc};
      opacity: 0.4;
      margin-bottom: 3px;
    }
    .cover-meta-value {
      font-family: ${bFF};
      font-size: 12px;
      font-weight: 600;
      color: ${pc};
    }

    /* ── Content page ── */
    .content-page { padding: 12px 52px 52px; }

    .preamble {
      font-family: ${bFF};
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      color: ${pc};
      opacity: 0.55;
      letter-spacing: 0.05em;
      margin-bottom: 28px;
      line-height: 1.7;
    }

    /* Parties block */
    .party-block {
      background: #F7F8FE;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 12px;
    }
    .party-block-title {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: ${pc};
      opacity: 0.45;
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
    .parties-table td:first-child { width: 150px; opacity: 0.6; }

    .party-sep { margin: 12px 0; font-size: 13px; color: ${pc}; font-weight: 700; opacity: 0.5; text-align: center; }
    .party-note { font-size: ${b.fontSize}px; font-weight: ${b.fontWeight}; color: ${pc}; margin-top: 8px; opacity: 0.65; }

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
      border-bottom: 1px solid ${pc}25;
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

    /* Signature box */
    .sig-section {
      background: #F7F8FE;
      border-radius: 8px;
      padding: 20px 24px;
      margin-top: 36px;
    }
    .sig-preamble {
      font-family: ${bFF};
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: ${pc};
      opacity: 0.4;
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
<div class="page">

  <!-- ══ COVER PAGE ══ -->
  <div class="accent-bar"></div>
  <div class="page-header">
    <img class="header-logo" src="${logoSrc}" alt="4BROS" />
    <img class="header-decor" src="${decorSrc}" alt="" />
  </div>

  <div class="cover-body">
    <div>
      <div class="cover-eyebrow">Smlouva · Interní dokument</div>
      <div class="cover-title">${contract.templateName}</div>
      <div class="cover-meta-grid">
        <div class="cover-meta-cell">
          <div class="cover-meta-label">Připraveno pro</div>
          <div class="cover-meta-value">${contract.employeeName}</div>
        </div>
        <div class="cover-meta-cell">
          <div class="cover-meta-label">Připraveno kým</div>
          <div class="cover-meta-value">${design.companyName}</div>
        </div>
        <div class="cover-meta-cell">
          <div class="cover-meta-label">Datum vytvoření</div>
          <div class="cover-meta-value">${contract.createdAt.toLocaleDateString('cs-CZ')}</div>
        </div>
        <div class="cover-meta-cell">
          <div class="cover-meta-label">Stav</div>
          <div class="cover-meta-value">${statusBadge(contract.status)}</div>
        </div>
      </div>
    </div>
    <div style="font-size:9px;color:${pc};opacity:0.3;letter-spacing:0.06em;">DŮVĚRNÉ — INTERNÍ DOKUMENT</div>
  </div>

  ${footer}
</div>

<!-- ══ CONTENT PAGE ══ -->
<div class="page page-break">
  <div class="accent-bar"></div>
  <div class="page-header">
    <img class="header-logo" src="${logoSrc}" alt="4BROS" />
    <img class="header-decor" src="${decorSrc}" alt="" />
  </div>

  <div class="content-page">
    <div class="preamble">
      TATO ${contract.templateName.toUpperCase()} BYLA UZAVŘENA NÍŽE UVEDENÉHO DNE, MĚSÍCE A ROKU MEZI TĚMITO SMLUVNÍMI STRANAMI
    </div>

    <!-- Zaměstnanec -->
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

    <!-- Zaměstnavatel -->
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

    <!-- Signatures -->
    <div class="sig-section">
      <div class="sig-preamble">NA DŮKAZ ČEHOŽ SMLUVNÍ STRANY PŘIPOJUJÍ SVÉ PODPISY</div>
      <div class="sig-grid">
        ${sigBox('Zaměstnavatel — ' + design.companyName, design.companyName, 'Praze', mgmtAt, pc)}
        ${sigBox('Zaměstnanec', contract.employeeName, 'Praze', signedAt, pc)}
      </div>
    </div>
  </div>

  ${footer}
</div>

<script>document.fonts.ready.then(function(){ window.print(); });</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=960,height=900')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
