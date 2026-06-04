import type { Contract, ContractTemplate } from './mock-data'

function fillPlaceholders(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
}

function statusLabel(status: Contract['status']): string {
  const map = {
    DRAFT: 'Návrh',
    PENDING_MANAGEMENT: 'Čeká na podpis vedení',
    PENDING_EMPLOYEE: 'Čeká na podpis zaměstnance',
    SIGNED: 'Podepsáno',
  }
  return map[status]
}

function statusColor(status: Contract['status']): string {
  if (status === 'SIGNED') return 'color:#166534;background:#dcfce7;'
  if (status === 'DRAFT') return 'color:#475569;background:#f1f5f9;'
  return 'color:#92400e;background:#fef3c7;'
}

export function printContract(contract: Contract, template: ContractTemplate | undefined): void {
  const body = fillPlaceholders(template?.body ?? '', contract.values)
  const now = new Date()
  const generatedAt = now.toLocaleString('cs-CZ')
  const signedAt = contract.employeeSignedAt
    ? contract.employeeSignedAt.toLocaleDateString('cs-CZ')
    : null
  const mgmtSignedAt = contract.managementSignedAt
    ? contract.managementSignedAt.toLocaleDateString('cs-CZ')
    : null

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${contract.templateName} — ${contract.employeeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy: #0E2337;
      --violet: #7e17e0;
      --violet-light: #a855f7;
    }

    body {
      font-family: 'Roboto', sans-serif;
      color: var(--navy);
      background: #fff;
      font-size: 13px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      max-width: 760px;
      margin: 0 auto;
      padding: 52px 56px 64px;
    }

    /* ── Header ── */
    .logo-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .logo-mark {
      width: 40px;
      height: 40px;
      background: var(--violet);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.5px;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: var(--navy);
      letter-spacing: -0.5px;
    }
    .logo-sub {
      font-size: 11px;
      color: #64748b;
      letter-spacing: 0.04em;
      margin-top: 1px;
    }
    .logo-wave {
      display: block;
      margin-top: 4px;
      margin-bottom: 24px;
    }

    /* ── Meta bar ── */
    .meta-bar {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 32px;
    }
    .meta-label {
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 3px;
    }
    .meta-value {
      font-size: 13px;
      font-weight: 500;
      color: var(--navy);
    }
    .status-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }

    /* ── Document title ── */
    .doc-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--navy);
      letter-spacing: -0.3px;
      margin-bottom: 6px;
    }
    .doc-party {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 32px;
    }

    /* ── Content ── */
    .content { margin-bottom: 40px; }

    .content h2 {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--navy);
      margin-top: 28px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .content h3 {
      font-size: 13px;
      font-weight: 600;
      color: var(--violet);
      margin-top: 18px;
      margin-bottom: 6px;
      padding-left: 10px;
      border-left: 3px solid var(--violet);
    }
    .content p {
      margin-bottom: 10px;
      line-height: 1.75;
    }
    .content ul, .content ol {
      padding-left: 20px;
      margin-bottom: 10px;
    }
    .content li { margin-bottom: 4px; }
    .content strong { font-weight: 600; color: var(--navy); }

    /* ── Signatures ── */
    .sig-section {
      margin-top: 44px;
      margin-bottom: 36px;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .sig-box {
      border: 1.5px dashed #cbd5e1;
      border-radius: 10px;
      padding: 18px 20px 16px;
    }
    .sig-box.signed {
      border-style: solid;
      border-color: #bbf7d0;
      background: #f0fdf4;
    }
    .sig-role {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .sig-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--navy);
    }
    .sig-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .sig-pending {
      height: 32px;
      border-bottom: 1px dashed #cbd5e1;
      margin-bottom: 8px;
    }
    .sig-pending-label {
      font-size: 11px;
      color: #94a3b8;
    }
    .sig-check {
      display: inline-block;
      width: 18px;
      height: 18px;
      background: #22c55e;
      border-radius: 999px;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      line-height: 18px;
      margin-right: 6px;
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left {
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer-right {
      font-size: 10px;
      color: #cbd5e1;
      text-align: right;
    }

    @media print {
      body { background: #fff; }
      .page { padding: 24px 32px; }
      @page { margin: 0; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Logo -->
  <div class="logo-row">
    <div class="logo-mark">4B</div>
    <div>
      <div class="logo-text">Four Bros</div>
      <div class="logo-sub">HR Portál &nbsp;·&nbsp; Důvěrný dokument</div>
    </div>
  </div>
  <svg class="logo-wave" width="120" height="14" viewBox="0 0 120 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10 C12 3, 22 3, 32 10 C42 17, 52 17, 62 10 C72 3, 82 3, 92 10 C102 17, 112 17, 118 10"
      stroke="#7e17e0" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>

  <!-- Meta bar -->
  <div class="meta-bar">
    <div>
      <div class="meta-label">Zaměstnanec</div>
      <div class="meta-value">${contract.employeeName}</div>
    </div>
    <div>
      <div class="meta-label">Typ smlouvy</div>
      <div class="meta-value">${template?.type ?? '—'}</div>
    </div>
    <div>
      <div class="meta-label">Datum vytvoření</div>
      <div class="meta-value">${contract.createdAt.toLocaleDateString('cs-CZ')}</div>
    </div>
    <div>
      <div class="meta-label">Stav</div>
      <div class="meta-value">
        <span class="status-pill" style="${statusColor(contract.status)}">${statusLabel(contract.status)}</span>
      </div>
    </div>
  </div>

  <!-- Document title -->
  <div class="doc-title">${contract.templateName}</div>
  <div class="doc-party">${contract.employeeName} &amp; Four Bros s.r.o.</div>

  <!-- Body -->
  <div class="content">
    ${body}
  </div>

  <!-- Signatures -->
  <div class="sig-section">
    <div class="sig-title">Podpisy smluvních stran</div>
    <div class="sig-grid">
      <div class="sig-box ${mgmtSignedAt ? 'signed' : ''}">
        <div class="sig-role">Za zaměstnavatele</div>
        ${mgmtSignedAt ? `
          <div class="sig-name"><span class="sig-check">✓</span>${contract.managementSignedBy ?? 'Four Bros s.r.o.'}</div>
          <div class="sig-date">Podepsáno: ${mgmtSignedAt}</div>
        ` : `
          <div class="sig-pending"></div>
          <div class="sig-pending-label">Four Bros s.r.o. — Čeká na podpis</div>
        `}
      </div>
      <div class="sig-box ${signedAt ? 'signed' : ''}">
        <div class="sig-role">Zaměstnanec</div>
        ${signedAt ? `
          <div class="sig-name"><span class="sig-check">✓</span>${contract.employeeName}</div>
          <div class="sig-date">Podepsáno: ${signedAt}</div>
        ` : `
          <div class="sig-pending"></div>
          <div class="sig-pending-label">${contract.employeeName} — Čeká na podpis</div>
        `}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      <strong>Four Bros s.r.o.</strong><br/>
      IČO: 12345678 &nbsp;·&nbsp; Náměstí Míru 5, 120 00 Praha 2<br/>
      Vygenerováno: ${generatedAt}
    </div>
    <div class="footer-right">
      Interní dokument — Důvěrné<br/>
      Four Bros HR Portál
    </div>
  </div>

</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
