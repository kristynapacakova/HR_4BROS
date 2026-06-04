import type { Contract, ContractTemplate } from './mock-data'

function fillPlaceholders(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
}

function statusLabel(status: Contract['status']): string {
  const map: Record<Contract['status'], string> = {
    DRAFT: 'Návrh',
    PENDING_MANAGEMENT: 'Čeká na podpis vedení',
    PENDING_EMPLOYEE: 'Čeká na podpis zaměstnance',
    SIGNED: 'Podepsáno',
  }
  return map[status]
}

function statusBadge(status: Contract['status']): string {
  if (status === 'SIGNED')
    return `<span style="display:inline-flex;align-items:center;gap:5px;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.03em;">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="5" fill="#22c55e"/><path d="M2.5 5l1.8 1.8L7.5 3.5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Podepsáno
    </span>`
  if (status === 'DRAFT')
    return `<span style="display:inline-flex;align-items:center;gap:5px;background:#f1f5f9;color:#475569;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.03em;">Návrh</span>`
  return `<span style="display:inline-flex;align-items:center;gap:5px;background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.03em;">Čeká na podpis</span>`
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
  <title>${contract.templateName} — ${contract.employeeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Roboto', sans-serif;
      color: #0E2337;
      background: #f0f2f5;
      -webkit-font-smoothing: antialiased;
      font-size: 13.5px;
      line-height: 1.75;
    }

    /* ── Outer wrapper ── */
    .sheet {
      max-width: 820px;
      margin: 40px auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 48px rgba(14,35,55,0.14), 0 2px 8px rgba(14,35,55,0.06);
    }

    /* ── Navy header band ── */
    .header {
      background: #0E2337;
      padding: 36px 48px 0;
      position: relative;
      overflow: hidden;
    }

    /* Decorative circle blobs */
    .header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 240px; height: 240px;
      background: radial-gradient(circle, rgba(126,23,224,0.35) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 20px; left: 30%;
      width: 160px; height: 160px;
      background: radial-gradient(circle, rgba(126,23,224,0.18) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .header-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .logo-lockup {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-box {
      width: 48px; height: 48px;
      background: #7e17e0;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(126,23,224,0.5);
    }
    .logo-box span {
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .logo-name {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }
    .logo-tagline {
      color: rgba(255,255,255,0.45);
      font-size: 11px;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    .header-badge {
      position: relative;
      z-index: 1;
      margin-top: 4px;
    }
    .confidential-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 999px;
      padding: 4px 12px;
      color: rgba(255,255,255,0.5);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    /* Wave divider SVG */
    .header-wave {
      display: block;
      width: 100%;
      margin-top: 28px;
      position: relative;
      z-index: 1;
    }

    /* ── Document title strip ── */
    .title-strip {
      padding: 32px 48px 28px;
      border-bottom: 1px solid #e9edf2;
      background: #fff;
    }
    .doc-eyebrow {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #7e17e0;
      margin-bottom: 8px;
    }
    .doc-title {
      font-size: 26px;
      font-weight: 700;
      color: #0E2337;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 6px;
    }
    .doc-parties {
      font-size: 13px;
      color: #64748b;
    }
    .doc-parties strong { color: #0E2337; font-weight: 600; }

    /* ── Meta grid ── */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border-bottom: 1px solid #e9edf2;
      background: #f8fafc;
    }
    .meta-cell {
      padding: 16px 24px;
      border-right: 1px solid #e9edf2;
    }
    .meta-cell:last-child { border-right: none; }
    .meta-cell-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .meta-cell-value {
      font-size: 13px;
      font-weight: 600;
      color: #0E2337;
    }

    /* ── Body ── */
    .body-wrap {
      padding: 40px 48px;
    }

    .body-wrap h2 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #0E2337;
      margin-top: 32px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #0E2337;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .body-wrap h2::before {
      content: '';
      display: inline-block;
      width: 4px; height: 14px;
      background: #7e17e0;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .body-wrap h3 {
      font-size: 13px;
      font-weight: 600;
      color: #7e17e0;
      margin-top: 20px;
      margin-bottom: 8px;
      padding-left: 12px;
      border-left: 3px solid #7e17e0;
    }

    .body-wrap p {
      margin-bottom: 12px;
      color: #1e3a52;
      line-height: 1.8;
    }
    .body-wrap ul, .body-wrap ol {
      padding-left: 22px;
      margin-bottom: 12px;
    }
    .body-wrap li { margin-bottom: 5px; color: #1e3a52; }
    .body-wrap strong { font-weight: 600; color: #0E2337; }

    /* ── Signature section ── */
    .sig-section {
      margin: 0 48px 40px;
      padding-top: 32px;
      border-top: 1px solid #e9edf2;
    }
    .sig-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .sig-box {
      border: 1.5px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px 22px;
      background: #fafbfc;
    }
    .sig-box.signed {
      border: 1.5px solid #86efac;
      background: linear-gradient(135deg, #f0fdf4 0%, #fff 100%);
    }
    .sig-role {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 14px;
    }
    .sig-line {
      height: 1px;
      background: repeating-linear-gradient(to right, #cbd5e1 0, #cbd5e1 6px, transparent 6px, transparent 12px);
      margin-bottom: 8px;
      margin-top: 28px;
    }
    .sig-pending-name {
      font-size: 12px;
      color: #94a3b8;
    }
    .sig-signed-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #0E2337;
      margin-bottom: 4px;
    }
    .sig-check-circle {
      width: 22px; height: 22px;
      background: #22c55e;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sig-date {
      font-size: 11px;
      color: #64748b;
      padding-left: 30px;
    }

    /* ── Footer band ── */
    .footer {
      background: #0E2337;
      padding: 20px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .footer-left {
      color: rgba(255,255,255,0.45);
      font-size: 10.5px;
      line-height: 1.6;
    }
    .footer-left strong { color: rgba(255,255,255,0.7); font-weight: 600; }
    .footer-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .footer-dot {
      width: 24px; height: 24px;
      background: rgba(126,23,224,0.5);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .footer-dot span {
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .footer-brand {
      color: rgba(255,255,255,0.3);
      font-size: 10px;
      letter-spacing: 0.05em;
    }

    @media print {
      body { background: #fff; }
      .sheet { margin: 0; border-radius: 0; box-shadow: none; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
<div class="sheet">

  <!-- ══ HEADER ══ -->
  <div class="header">
    <div class="header-top">
      <div class="logo-lockup">
        <div class="logo-box"><span>4B</span></div>
        <div>
          <div class="logo-name">Four Bros</div>
          <div class="logo-tagline">HR Portál</div>
        </div>
      </div>
      <div class="header-badge">
        <div class="confidential-tag">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <rect x="1" y="3.5" width="6" height="4" rx="1" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
            <path d="M2.5 3.5V2.5a1.5 1.5 0 013 0v1" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round"/>
          </svg>
          Důvěrný dokument
        </div>
      </div>
    </div>

    <!-- Wave transition -->
    <svg class="header-wave" viewBox="0 0 820 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0 48 L0 28 C100 8 160 42 280 24 C400 6 460 40 580 20 C700 0 760 34 820 18 L820 48 Z" fill="white"/>
      <path d="M0 30 C80 10 160 44 260 26 C360 8 440 42 560 22 C680 2 740 36 820 20" stroke="#7e17e0" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>
  </div>

  <!-- ══ TITLE ══ -->
  <div class="title-strip">
    <div class="doc-eyebrow">Pracovní dokument · Four Bros s.r.o.</div>
    <div class="doc-title">${contract.templateName}</div>
    <div class="doc-parties">
      Uzavřená mezi <strong>Four Bros s.r.o.</strong> a <strong>${contract.employeeName}</strong>
    </div>
  </div>

  <!-- ══ META ══ -->
  <div class="meta-grid">
    <div class="meta-cell">
      <div class="meta-cell-label">Zaměstnanec</div>
      <div class="meta-cell-value">${contract.employeeName}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-cell-label">Typ smlouvy</div>
      <div class="meta-cell-value">${template?.type ?? '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-cell-label">Datum vytvoření</div>
      <div class="meta-cell-value">${contract.createdAt.toLocaleDateString('cs-CZ')}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-cell-label">Stav dokumentu</div>
      <div class="meta-cell-value">${statusBadge(contract.status)}</div>
    </div>
  </div>

  <!-- ══ BODY ══ -->
  <div class="body-wrap">
    ${body}
  </div>

  <!-- ══ SIGNATURES ══ -->
  <div class="sig-section">
    <div class="sig-label">Podpisy smluvních stran</div>
    <div class="sig-grid">

      <!-- Employer -->
      <div class="sig-box ${mgmtSignedAt ? 'signed' : ''}">
        <div class="sig-role">Za zaměstnavatele</div>
        ${mgmtSignedAt ? `
          <div class="sig-signed-name">
            <div class="sig-check-circle">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            ${contract.managementSignedBy ?? 'Four Bros s.r.o.'}
          </div>
          <div class="sig-date">Podepsáno: ${mgmtSignedAt}</div>
        ` : `
          <div class="sig-line"></div>
          <div class="sig-pending-name">Four Bros s.r.o. · Čeká na podpis</div>
        `}
      </div>

      <!-- Employee -->
      <div class="sig-box ${signedAt ? 'signed' : ''}">
        <div class="sig-role">Zaměstnanec</div>
        ${signedAt ? `
          <div class="sig-signed-name">
            <div class="sig-check-circle">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            ${contract.employeeName}
          </div>
          <div class="sig-date">Podepsáno: ${signedAt}</div>
        ` : `
          <div class="sig-line"></div>
          <div class="sig-pending-name">${contract.employeeName} · Čeká na podpis</div>
        `}
      </div>

    </div>
  </div>

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div class="footer-left">
      <strong>Four Bros s.r.o.</strong> &nbsp;·&nbsp; IČO: 12345678<br/>
      Náměstí Míru 5, 120 00 Praha 2 &nbsp;·&nbsp; Vygenerováno: ${generatedAt}
    </div>
    <div class="footer-right">
      <div class="footer-dot"><span>4B</span></div>
      <div class="footer-brand">HR Portál</div>
    </div>
  </div>

</div>
<script>
  // Wait for Google Fonts to load before printing
  document.fonts.ready.then(function() { window.print(); });
</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=960,height=800')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
