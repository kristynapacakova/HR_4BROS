import type { Contract, ContractTemplate } from './mock-data'
import { loadDesign } from '@/app/admin/smlouvy/ContractDesignerClient'

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
  return `<span style="display:inline-block;padding:3px 11px;border-radius:999px;font-size:10.5px;font-weight:700;background:${bg};color:${color};">${labels[status]}</span>`
}

function sigBox(role: string, name: string, city: string, signedDate: string | null): string {
  return `
  <div>
    <p style="font-size:12px;color:#1e3852;margin-bottom:24px;">V ${city}, dne ${signedDate ?? '____________________'}</p>
    <div style="height:1px;width:260px;border-bottom:1px solid #1e3852;margin-bottom:8px;"></div>
    <p style="font-size:12px;color:#1e3852;font-weight:${signedDate ? '600' : '400'};">${name}</p>
    <p style="font-size:11px;color:#64748b;">${role}</p>
    ${signedDate ? `<p style="font-size:10px;color:#22c55e;margin-top:4px;">✓ Podepsáno ${signedDate}</p>` : ''}
  </div>`
}

export function printContract(contract: Contract, template: ContractTemplate | undefined): void {
  const design = loadDesign()
  const body = fillPlaceholders(template?.body ?? '', contract.values)
  const signedAt = contract.employeeSignedAt   ? new Date(contract.employeeSignedAt).toLocaleDateString('cs-CZ')   : null
  const mgmtAt   = contract.managementSignedAt ? new Date(contract.managementSignedAt).toLocaleDateString('cs-CZ') : null
  const origin   = typeof window !== 'undefined' ? window.location.origin : ''

  // Use custom uploaded assets or fall back to extracted brand assets
  const logoSrc  = design.logoDataUrl  ?? `${origin}/brand/logo.png`
  const decorSrc = design.decorDataUrl ?? `${origin}/brand/watercolor.png`

  const fontName = design.fontFamily === 'georgia' ? 'Georgia' : design.fontFamily === 'roboto' ? 'Roboto' : 'Serenity'
  const ff = design.fontFamily === 'georgia'
    ? "Georgia, 'Times New Roman', serif"
    : design.fontFamily === 'roboto'
    ? "'Roboto', sans-serif"
    : "'Serenity', sans-serif"

  const pc = design.primaryColor  // navy
  const ac = design.accentColor   // violet

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8"/>
  <title>${contract.templateName} — ${contract.employeeName}</title>
  ${design.fontFamily === 'roboto' ? '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>' : ''}
  <style>
    ${design.fontFamily === 'serenity' ? `
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Book.otf') format('opentype'); font-weight:400; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Medium.otf') format('opentype'); font-weight:500; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-SemiBold.otf') format('opentype'); font-weight:600; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Light.otf') format('opentype'); font-weight:300; }
    ` : ''}

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${ff};
      color: ${pc};
      background: #fff;
      font-size: 12px;
      line-height: 1.75;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Page layout ── */
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      padding: 0;
      position: relative;
    }

    /* ── Header (every page) ── */
    .page-header {
      position: relative;
      padding: 28px 52px 20px;
      overflow: hidden;
    }
    .header-logo {
      height: 52px;
      object-fit: contain;
      display: block;
    }
    .header-decor {
      position: absolute;
      top: 0; right: 0;
      height: 90px;
      object-fit: contain;
      pointer-events: none;
    }

    /* ── Cover page ── */
    .cover-body {
      padding: 0 52px 52px;
      min-height: calc(297mm - 120px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cover-title {
      font-family: ${ff};
      font-size: 36px;
      font-weight: 700;
      color: ${pc};
      line-height: 1.2;
      margin-top: 100px;
      margin-bottom: 80px;
    }
    .cover-meta {
      font-size: 13px;
      color: ${pc};
    }
    .cover-meta p { margin-bottom: 4px; }
    .cover-meta strong { font-weight: 700; }

    /* ── Content pages ── */
    .content-page {
      padding: 20px 52px 52px;
    }
    .preamble {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      color: ${pc};
      margin-bottom: 32px;
      line-height: 1.6;
    }

    /* Parties table */
    .parties-table { width: 100%; margin-bottom: 20px; }
    .parties-table td {
      padding: 3px 0;
      font-size: 12px;
      color: ${pc};
      vertical-align: top;
    }
    .parties-table td:first-child {
      width: 160px;
      font-weight: 400;
      color: ${pc};
    }
    .parties-table td:last-child { color: ${pc}; }

    .party-title {
      font-size: 12px;
      font-weight: 700;
      color: ${pc};
      margin-bottom: 4px;
    }
    .party-sep { margin: 16px 0; font-size: 12px; color: ${pc}; font-weight: 700; }
    .party-note { font-size: 12px; color: ${pc}; margin-bottom: 20px; }

    .section-bold {
      font-size: 12px;
      font-weight: 700;
      color: ${pc};
      margin: 20px 0 12px;
    }

    /* Body content */
    .contract-content h2 {
      font-family: ${ff};
      font-size: 13px;
      font-weight: 700;
      color: ${pc};
      margin-top: 28px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid ${pc};
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .contract-content h3 {
      font-size: 12.5px;
      font-weight: 600;
      color: ${ac};
      margin-top: 16px;
      margin-bottom: 6px;
      padding-left: 10px;
      border-left: 3px solid ${ac};
    }
    .contract-content p  { margin-bottom: 10px; }
    .contract-content ul, .contract-content ol { padding-left: 20px; margin-bottom: 10px; }
    .contract-content li { margin-bottom: 4px; }
    .contract-content strong { font-weight: 700; }

    /* Signature section */
    .sig-preamble {
      font-size: 12px;
      font-weight: 700;
      color: ${pc};
      margin: 40px 0 28px;
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
  <div class="page-header">
    <img class="header-logo" src="${logoSrc}" alt="4BROS" />
    <img class="header-decor" src="${decorSrc}" alt="" />
  </div>

  <div class="cover-body">
    <div>
      <div class="cover-title">${contract.templateName}</div>
      <div class="cover-meta">
        <p><strong>Připraveno pro:</strong></p>
        <p>${contract.employeeName}</p>
        <br/>
        <p><strong>Připraveno kým:</strong></p>
        <p>${design.companyName}</p>
      </div>
    </div>
    <div style="font-size:10px;color:#94a3b8;">${statusBadge(contract.status)} &nbsp; ${contract.createdAt.toLocaleDateString('cs-CZ')}</div>
  </div>

  <!-- ══ CONTENT PAGE ══ -->
  <div class="page-break"></div>
  <div class="page-header">
    <img class="header-logo" src="${logoSrc}" alt="4BROS" />
    <img class="header-decor" src="${decorSrc}" alt="" />
  </div>

  <div class="content-page">
    <!-- Preamble -->
    <div class="preamble">
      TATO ${contract.templateName.toUpperCase()} BYLA UZAVŘENA NÍŽE UVEDENÉHO DNE, MĚSÍCE A ROKU MEZI TĚMITO SMLUVNÍMI STRANAMI
    </div>

    <!-- Parties -->
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

    <p class="party-sep">a</p>

    <table class="parties-table">
      <tr><td>Firma:</td><td>${design.companyName}</td></tr>
      <tr><td>IČO:</td><td>${design.companyIco}</td></tr>
      <tr><td>Sídlo:</td><td>${design.companyAddress}</td></tr>
    </table>
    <p class="party-note">(dále jako <strong>„Zaměstnavatel"</strong>)</p>

    <p class="section-bold">SMLUVNÍ STRANY UJEDNÁVAJÍ NÁSLEDUJÍCÍ:</p>

    <!-- Body -->
    <div class="contract-content">${body}</div>

    <!-- Signatures -->
    <p class="sig-preamble">NA DŮKAZ ČEHOŽ SMLUVNÍ STRANY PŘIPOJUJÍ SVÉ PODPISY</p>
    <div class="sig-grid">
      ${sigBox('Zaměstnavatel — ' + design.companyName, design.companyName, 'Praze', mgmtAt)}
      ${sigBox('Zaměstnanec', contract.employeeName, 'Praze', signedAt)}
    </div>
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
