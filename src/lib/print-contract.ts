import type { Contract, ContractTemplate } from './mock-data'
import { loadDesign } from '@/app/admin/smlouvy/ContractDesignerClient'
import { escapeHtml, openLetterheadPrint } from './letterhead'

function fillPlaceholders(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
}

function sigBox(role: string, name: string, signedDate: string | null): string {
  return `
  <div>
    <p class="sig-role">${escapeHtml(role)}</p>
    <p class="sig-meta">V Praze, dne ${signedDate ?? '____________________'}</p>
    <div class="sig-line"></div>
    <p class="sig-name">${escapeHtml(name)}</p>
    ${signedDate
      ? `<p class="sig-meta sig-ok">✓ Podepsáno elektronicky ${signedDate}</p>`
      : `<p class="sig-meta">Čeká na podpis</p>`}
  </div>`
}

/** Smlouva na hlavičkovém papíře 4Bros (Brand 2026) — otevře tisk / uložení do PDF. */
export function printContract(contract: Contract, template: ContractTemplate | undefined): void {
  const design = loadDesign()
  const body = fillPlaceholders(template?.body ?? '', contract.values)
  const signedAt = contract.employeeSignedAt   ? new Date(contract.employeeSignedAt).toLocaleDateString('cs-CZ')   : null
  const mgmtAt   = contract.managementSignedAt ? new Date(contract.managementSignedAt).toLocaleDateString('cs-CZ') : null
  const v = contract.values
  const row = (label: string, value?: string) => (value ? `<tr><td>${label}</td><td>${escapeHtml(value)}</td></tr>` : '')

  const bodyHtml = `
    <p class="kicker">Smluvní strany</p>
    <table class="parties">
      <tr><td><strong>Zaměstnavatel</strong></td><td><strong>${escapeHtml(design.companyName)}</strong>, IČO ${escapeHtml(design.companyIco)}, ${escapeHtml(design.companyAddress)}</td></tr>
      <tr><td><strong>Zaměstnanec</strong></td><td><strong>${escapeHtml(contract.employeeName)}</strong></td></tr>
      ${row('Pracovní pozice', v.POZICE)}
      ${row('Datum nástupu', v.DATUM_NASTUPU)}
      ${row('Mzda', v.MZDA)}
      ${row('Hodinová sazba', v.HODINOVA_SAZBA)}
      ${row('Max. hodin ročně', v.MAX_HODIN)}
      ${v.TYDENNI_UVAZEK ? row('Týdenní úvazek', `${v.TYDENNI_UVAZEK} hod`) : ''}
    </table>
    <p class="kicker">Smluvní strany ujednávají následující</p>
    ${body}
    <div class="sigs">
      ${sigBox(`Za zaměstnavatele`, contract.managementSignedBy ?? design.companyName, mgmtAt)}
      ${sigBox('Zaměstnanec', contract.employeeName, signedAt)}
    </div>`

  openLetterheadPrint({
    docTitle: `${contract.templateName} — ${contract.employeeName}`,
    left: [
      `<strong>${escapeHtml(design.companyName)}</strong>`,
      `IČO ${escapeHtml(design.companyIco)}`,
      escapeHtml(design.companyAddress),
    ],
    right: [
      `<strong>${escapeHtml(contract.employeeName)}</strong>`,
      v.POZICE ? escapeHtml(v.POZICE) : '',
      `Vystaveno ${contract.createdAt.toLocaleDateString('cs-CZ')}`,
    ].filter(Boolean),
    title: escapeHtml(contract.templateName),
    subtitle: `Uzavřená mezi ${escapeHtml(design.companyName)} a ${escapeHtml(contract.employeeName)}`,
    bodyHtml,
    footerHtml: `<strong>${escapeHtml(design.companyName)}</strong> · IČO ${escapeHtml(design.companyIco)} · ${escapeHtml(design.companyAddress)}`,
  })
}
