import type { Contract, ContractTemplate } from './mock-data'
import type { ContractDesign } from '@/app/admin/smlouvy/ContractDesignerClient'
import { DEFAULT_DESIGN, loadDesign } from '@/app/admin/smlouvy/ContractDesignerClient'

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
  return `<span style="display:inline-block;padding:3px 11px;border-radius:999px;font-size:10.5px;font-weight:700;letter-spacing:0.03em;background:${bg};color:${color};">${labels[status]}</span>`
}

function sigBox(role: string, name: string, signedDate: string | null, accentColor: string): string {
  return signedDate ? `
    <div style="border:1.5px solid #86efac;border-radius:10px;padding:16px 18px;background:linear-gradient(135deg,#f0fdf4 0%,#fff 100%);">
      <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:10px;">${role}</p>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <div style="width:18px;height:18px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.2 2.2 3.8-4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span style="font-size:13px;font-weight:700;color:#0E2337;">${name}</span>
      </div>
      <p style="font-size:10px;color:#64748b;padding-left:26px;">Podepsáno: ${signedDate}</p>
    </div>` : `
    <div style="padding:0 4px;">
      <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:20px;">${role}</p>
      <div style="height:1px;background:repeating-linear-gradient(to right,#cbd5e1 0,#cbd5e1 5px,transparent 5px,transparent 10px);margin-bottom:8px;margin-top:28px;"></div>
      <p style="font-size:12px;color:#64748b;">${name}</p>
      <p style="font-size:10px;color:#94a3b8;">Čeká na podpis</p>
    </div>`
}

function fontFaceBlock(origin: string): string {
  return `
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Book.otf') format('opentype'); font-weight:400; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-Medium.otf') format('opentype'); font-weight:500; }
    @font-face { font-family:'Serenity'; src:url('${origin}/fonts/Serenity-SemiBold.otf') format('opentype'); font-weight:600; }
  `
}

function fontStack(d: ContractDesign): string {
  if (d.fontFamily === 'georgia') return "Georgia, 'Times New Roman', serif"
  if (d.fontFamily === 'roboto')  return "'Roboto', sans-serif"
  return "'Serenity', sans-serif"
}

export function printContract(contract: Contract, template: ContractTemplate | undefined): void {
  const design = loadDesign()
  const body = fillPlaceholders(template?.body ?? '', contract.values)
  const generatedAt = new Date().toLocaleString('cs-CZ')
  const signedAt = contract.employeeSignedAt   ? new Date(contract.employeeSignedAt).toLocaleDateString('cs-CZ')   : null
  const mgmtAt   = contract.managementSignedAt ? new Date(contract.managementSignedAt).toLocaleDateString('cs-CZ') : null
  const origin   = typeof window !== 'undefined' ? window.location.origin : ''
  const ff = fontStack(design)
  const pc = design.primaryColor
  const ac = design.accentColor

  const logoHtml = design.logoDataUrl
    ? `<img src="${design.logoDataUrl}" alt="Logo" style="height:40px;object-fit:contain;" />`
    : `<div>
        <div style="font-family:${ff};font-size:24px;font-weight:700;color:${pc};letter-spacing:-0.5px;line-height:1;">4<span style="font-size:16px;letter-spacing:0.1em;">BROS</span></div>
        <svg width="66" height="8" viewBox="0 0 66 8" fill="none" style="margin-top:4px;display:block;">
          <path d="M2 5.5 C8 2,15 2,22 5.5 C29 9,36 9,43 5.5 C50 2,57 2,64 5.5" stroke="${pc}" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        </svg>
       </div>`

  const footerLogoHtml = design.logoDataUrl
    ? `<img src="${design.logoDataUrl}" alt="Logo" style="height:20px;object-fit:contain;opacity:0.5;" />`
    : `<span style="font-family:${ff};font-size:13px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:-0.3px;">4BROS</span>`

  const decorHtml = design.decorDataUrl
    ? `<img src="${design.decorDataUrl}" alt="" style="position:absolute;top:0;right:0;height:160px;object-fit:contain;pointer-events:none;select:none;" />`
    : ''

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8"/>
  <title>${contract.templateName} — ${contract.employeeName}</title>
  ${design.fontFamily === 'roboto' ? '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>' : ''}
  <style>
    ${design.fontFamily === 'serenity' ? fontFaceBlock(origin) : ''}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${ff};
      color: #1e3a52;
      background: #f0f2f5;
      font-size: 13.5px;
      line-height: 1.75;
      -webkit-font-smoothing: antialiased;
    }
    .sheet {
      max-width: 800px;
      margin: 40px auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 48px rgba(14,35,55,0.12), 0 2px 8px rgba(14,35,55,0.06);
    }
    .doc-header {
      position: relative;
      padding: 40px 52px 32px;
      border-bottom: 1px solid #e9edf2;
      overflow: hidden;
      background: #fff;
    }
    .header-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }
    .header-meta {
      text-align: right;
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.7;
      letter-spacing: 0.04em;
    }
    .doc-title-area {
      position: relative;
      z-index: 1;
      margin-top: 44px;
    }
    .doc-title {
      font-family: ${ff};
      font-size: 28px;
      font-weight: 700;
      color: ${pc};
      letter-spacing: -0.5px;
      line-height: 1.25;
      margin-bottom: 12px;
    }
    .doc-parties {
      font-size: 12.5px;
      color: #64748b;
    }
    .doc-parties strong { color: ${pc}; font-weight: 600; }
    .status-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: #f8fafc;
      border-bottom: 1px solid #e9edf2;
    }
    .status-cell {
      padding: 12px 20px;
      border-right: 1px solid #e9edf2;
    }
    .status-cell:last-child { border-right: none; }
    .status-cell-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 3px;
    }
    .status-cell-value {
      font-size: 12.5px;
      font-weight: 600;
      color: ${pc};
    }
    .doc-body { padding: 40px 52px 36px; }
    .doc-body h2 {
      font-family: ${ff};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${pc};
      margin-top: 32px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1.5px solid ${pc};
    }
    .doc-body h3 {
      font-size: 13px;
      font-weight: 600;
      color: ${ac};
      margin-top: 18px;
      margin-bottom: 7px;
      padding-left: 11px;
      border-left: 3px solid ${ac};
    }
    .doc-body p  { margin-bottom: 11px; }
    .doc-body ul, .doc-body ol { padding-left: 22px; margin-bottom: 11px; }
    .doc-body li { margin-bottom: 5px; }
    .doc-body strong { font-weight: 700; color: ${pc}; }
    .sig-area {
      margin: 8px 52px 44px;
      padding-top: 28px;
      border-top: 1px solid #e9edf2;
    }
    .sig-heading {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #94a3b8;
      margin-bottom: 22px;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .doc-footer {
      background: ${pc};
      padding: 14px 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .doc-footer-left {
      font-size: 10px;
      color: rgba(255,255,255,0.45);
      line-height: 1.6;
    }
    .doc-footer-left strong { color: rgba(255,255,255,0.7); font-weight: 600; }
    @media print {
      body { background: #fff; }
      .sheet { margin: 0; border-radius: 0; box-shadow: none; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
<div class="sheet">
  <div class="doc-header">
    ${decorHtml}
    <div class="header-top">
      ${logoHtml}
      <div class="header-meta">Interní dokument — Důvěrné<br/>${contract.createdAt.toLocaleDateString('cs-CZ')}</div>
    </div>
    <div class="doc-title-area">
      <div class="doc-title">${contract.templateName}</div>
      <div class="doc-parties">
        Připraveno pro: <strong>${contract.employeeName}</strong>
        &nbsp;·&nbsp; Připraveno kým: <strong>${design.companyName}</strong>
      </div>
    </div>
  </div>
  <div class="status-bar">
    <div class="status-cell"><div class="status-cell-label">Zaměstnanec</div><div class="status-cell-value">${contract.employeeName}</div></div>
    <div class="status-cell"><div class="status-cell-label">Typ smlouvy</div><div class="status-cell-value">${template?.type ?? '—'}</div></div>
    <div class="status-cell"><div class="status-cell-label">Datum vytvoření</div><div class="status-cell-value">${contract.createdAt.toLocaleDateString('cs-CZ')}</div></div>
    <div class="status-cell"><div class="status-cell-label">Stav dokumentu</div><div class="status-cell-value">${statusBadge(contract.status)}</div></div>
  </div>
  <div class="doc-body">${body}</div>
  <div class="sig-area">
    <div class="sig-heading">Na důkaz čehož smluvní strany připojují své podpisy</div>
    <div class="sig-grid">
      ${sigBox('Za zaměstnavatele', contract.managementSignedBy ?? design.companyName, mgmtAt, ac)}
      ${sigBox('Zaměstnanec', contract.employeeName, signedAt, ac)}
    </div>
  </div>
  <div class="doc-footer">
    <div class="doc-footer-left">
      <strong>${design.companyName}</strong> &nbsp;·&nbsp; IČO: ${design.companyIco} &nbsp;·&nbsp; ${design.companyAddress}<br/>
      Vygenerováno: ${generatedAt}
    </div>
    ${footerLogoHtml}
  </div>
</div>
<script>document.fonts.ready.then(function(){ window.print(); });</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=960,height=820')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
