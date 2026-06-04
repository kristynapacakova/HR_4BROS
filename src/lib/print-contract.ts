import type { Contract, ContractTemplate } from './mock-data'

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

export function printContract(contract: Contract, template: ContractTemplate | undefined): void {
  const body = fillPlaceholders(template?.body ?? '', contract.values)
  const generatedAt = new Date().toLocaleString('cs-CZ')
  const signedAt    = contract.employeeSignedAt   ? new Date(contract.employeeSignedAt).toLocaleDateString('cs-CZ')   : null
  const mgmtAt      = contract.managementSignedAt ? new Date(contract.managementSignedAt).toLocaleDateString('cs-CZ') : null

  const sigBox = (role: string, name: string, signedDate: string | null) => signedDate ? `
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

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8"/>
  <title>${contract.templateName} — ${contract.employeeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Roboto', sans-serif;
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

    /* ── Document header ── */
    .doc-header {
      position: relative;
      padding: 40px 52px 32px;
      border-bottom: 1px solid #e9edf2;
      overflow: hidden;
      background: #fff;
    }
    .blob1 {
      position: absolute; top: -20px; right: -20px;
      width: 220px; height: 160px;
      background: radial-gradient(ellipse 80% 60% at 70% 30%, rgba(147,197,253,0.28) 0%, transparent 70%);
      transform: rotate(-10deg);
      pointer-events: none;
    }
    .blob2 {
      position: absolute; top: 10px; right: 30px;
      width: 140px; height: 100px;
      background: radial-gradient(ellipse 70% 50% at 60% 40%, rgba(126,23,224,0.09) 0%, transparent 70%);
      transform: rotate(8deg);
      pointer-events: none;
    }
    .blob3 {
      position: absolute; top: -10px; right: 80px;
      width: 100px; height: 80px;
      background: radial-gradient(ellipse 60% 50% at 50% 30%, rgba(147,197,253,0.18) 0%, transparent 70%);
      transform: rotate(-20deg);
      pointer-events: none;
    }
    .header-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }
    .logo-text {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 26px;
      font-weight: 700;
      color: #0E2337;
      letter-spacing: -1px;
      line-height: 1;
    }
    .logo-text .bros {
      font-size: 18px;
      letter-spacing: 0.12em;
    }
    .logo-wave { display: block; margin-top: 5px; }
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
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 28px;
      font-weight: 700;
      color: #0E2337;
      letter-spacing: -0.5px;
      line-height: 1.25;
      margin-bottom: 12px;
    }
    .doc-parties {
      font-size: 12.5px;
      color: #64748b;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .doc-parties strong { color: #0E2337; font-weight: 600; }
    .doc-parties .sep { color: #cbd5e1; }

    /* ── Status bar ── */
    .status-bar {
      display: flex;
      align-items: center;
      gap: 0;
      background: #f8fafc;
      border-bottom: 1px solid #e9edf2;
    }
    .status-cell {
      flex: 1;
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
      color: #0E2337;
    }

    /* ── Body ── */
    .doc-body {
      padding: 40px 52px 36px;
    }
    .doc-body h2 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #0E2337;
      margin-top: 32px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1.5px solid #0E2337;
    }
    .doc-body h3 {
      font-size: 13px;
      font-weight: 600;
      color: #7e17e0;
      margin-top: 18px;
      margin-bottom: 7px;
      padding-left: 11px;
      border-left: 3px solid #7e17e0;
    }
    .doc-body p  { margin-bottom: 11px; }
    .doc-body ul, .doc-body ol { padding-left: 22px; margin-bottom: 11px; }
    .doc-body li { margin-bottom: 5px; }
    .doc-body strong { font-weight: 700; color: #0E2337; }

    /* ── Signature ── */
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

    /* ── Footer ── */
    .doc-footer {
      background: #f8fafc;
      border-top: 1px solid #e9edf2;
      padding: 14px 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .doc-footer-left {
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .doc-footer-left strong { color: #64748b; font-weight: 600; }
    .doc-footer-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-logo-mini {
      font-family: Georgia, serif;
      font-size: 11px;
      font-weight: 700;
      color: #0E2337;
      letter-spacing: -0.5px;
    }
    .footer-logo-mini .bros { font-size: 8px; letter-spacing: 0.1em; }

    @media print {
      body { background: #fff; }
      .sheet { margin: 0; border-radius: 0; box-shadow: none; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
<div class="sheet">

  <!-- Document header -->
  <div class="doc-header">
    <div class="blob1"></div>
    <div class="blob2"></div>
    <div class="blob3"></div>

    <div class="header-top">
      <div>
        <div class="logo-text">4<span class="bros">BROS</span></div>
        <svg class="logo-wave" width="72" height="9" viewBox="0 0 72 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6 C10 2, 18 2, 26 6 C34 10, 42 10, 50 6 C58 2, 64 2, 70 6"
            stroke="#0E2337" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
      <div class="header-meta">
        Interní dokument — Důvěrné<br/>
        ${contract.createdAt.toLocaleDateString('cs-CZ')}
      </div>
    </div>

    <div class="doc-title-area">
      <div class="doc-title">${contract.templateName}</div>
      <div class="doc-parties">
        <span>Připraveno pro: <strong>${contract.employeeName}</strong></span>
        <span class="sep">·</span>
        <span>Připraveno kým: <strong>Four Bros s.r.o.</strong></span>
      </div>
    </div>
  </div>

  <!-- Status bar -->
  <div class="status-bar">
    <div class="status-cell">
      <div class="status-cell-label">Zaměstnanec</div>
      <div class="status-cell-value">${contract.employeeName}</div>
    </div>
    <div class="status-cell">
      <div class="status-cell-label">Typ smlouvy</div>
      <div class="status-cell-value">${template?.type ?? '—'}</div>
    </div>
    <div class="status-cell">
      <div class="status-cell-label">Datum vytvoření</div>
      <div class="status-cell-value">${contract.createdAt.toLocaleDateString('cs-CZ')}</div>
    </div>
    <div class="status-cell">
      <div class="status-cell-label">Stav dokumentu</div>
      <div class="status-cell-value">${statusBadge(contract.status)}</div>
    </div>
  </div>

  <!-- Body -->
  <div class="doc-body">${body}</div>

  <!-- Signatures -->
  <div class="sig-area">
    <div class="sig-heading">Na důkaz čehož smluvní strany připojují své podpisy</div>
    <div class="sig-grid">
      ${sigBox('Za zaměstnavatele', contract.managementSignedBy ?? 'Four Bros s.r.o.', mgmtAt)}
      ${sigBox('Zaměstnanec', contract.employeeName, signedAt)}
    </div>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <div class="doc-footer-left">
      <strong>Four Bros s.r.o.</strong> &nbsp;·&nbsp; IČO: 12345678 &nbsp;·&nbsp; Náměstí Míru 5, 120 00 Praha 2<br/>
      Vygenerováno: ${generatedAt}
    </div>
    <div class="doc-footer-right">
      <div class="footer-logo-mini">4<span class="bros">BROS</span></div>
      <span style="color:#cbd5e1;font-size:10px;">HR Portál</span>
    </div>
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
