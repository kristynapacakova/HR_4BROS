import type { Contract, ContractTemplate } from './mock-data'
import { loadDesign } from '@/app/admin/smlouvy/ContractDesignerClient'
import {
  articlesFromTemplate, fillValues, openContractDocPrint, DOC_COMPANY_DEFAULT,
  type ContractDocModel, type DocCompany,
} from './contract-doc'

const fmt = (d: Date | null) => (d ? new Date(d).toLocaleDateString('cs-CZ') : null)
const sentence = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s)

export function companyFromDesign(): DocCompany {
  const d = loadDesign()
  return { ...DOC_COMPANY_DEFAULT, name: d.companyName || DOC_COMPANY_DEFAULT.name, ico: d.companyIco || DOC_COMPANY_DEFAULT.ico, address: d.companyAddress || DOC_COMPANY_DEFAULT.address }
}

/** Smlouva (šablona + vyplněné hodnoty) → model dokumentu ve vzhledu šablony 4Bros 2026. */
export function contractDocModel(contract: Contract, template: ContractTemplate | undefined, company: DocCompany = companyFromDesign()): ContractDocModel {
  const v = contract.values
  const filled = fillValues(template?.body ?? '', v, template?.labels)
  const { heading, articles } = articlesFromTemplate(filled)
  const isAddendum = template?.type === 'OBECNA'
  const isIco = template?.type === 'ICO'
  const docName = sentence(heading.replace(/<[^>]+>/g, '')) || contract.templateName
  const mgmt = fmt(contract.managementSignedAt)
  const emp = fmt(contract.employeeSignedAt)
  const place = v.MISTO_PODPISU?.trim() || '[místo]'
  const date = v.DATUM_PODPISU?.trim() || '[datum]'
  return {
    title: docName,
    preparedFor: contract.employeeName || '[Jméno a příjmení]',
    preparedBy: company.name,
    intro: `${docName}${isAddendum && v.CISLO_DODATKU ? ` č. ${v.CISLO_DODATKU}` : ''} uzavřená mezi těmito smluvními stranami`,
    parties: isIco
      ? [
          { rows: [['Obchodní firma:', company.name], ['IČO:', company.ico], ['Sídlo:', company.address], ['Zastoupená:', contract.managementSignedBy ?? '[jméno jednatele]']], alias: 'Objednatel' },
          { rows: [['Jméno a příjmení:', contract.employeeName || '[Jméno a příjmení]'], ['IČO:', v.ICO?.trim() || '[IČO]'], ['Místo podnikání:', v.MISTO_PODNIKANI?.trim() || '[místo podnikání]']], alias: 'Poskytovatel' },
        ]
      : [
          { rows: [['Obchodní firma:', company.name], ['IČO:', company.ico], ['Sídlo:', company.address], ['Zastoupená:', contract.managementSignedBy ?? '[jméno jednatele]']], alias: 'Zaměstnavatel' },
          { rows: [['Jméno a příjmení:', contract.employeeName || '[Jméno a příjmení]'], ['Datum narození:', '[datum narození]'], ['Bydliště:', '[adresa]'], ...(v.POZICE ? [['Pozice:', v.POZICE] as [string, string]] : [])], alias: 'Zaměstnanec' },
        ],
    lead: isAddendum ? 'Smluvní strany uzavírají tento dodatek:' : 'Smluvní strany uzavírají tuto smlouvu:',
    articles,
    closing: 'Smluvní strany prohlašují, že si dokument přečetly, souhlasí s ním a na důkaz toho připojují své podpisy.',
    signatures: [
      { place, date, party: isIco ? 'Objednatel' : 'Zaměstnavatel', name: contract.managementSignedBy ?? '[Jméno a příjmení]', note: mgmt ? `Podepsáno elektronicky ${mgmt}` : undefined },
      { place, date, party: isIco ? 'Poskytovatel' : 'Zaměstnanec', name: contract.employeeName || '[Jméno a příjmení]', note: emp ? `Podepsáno elektronicky ${emp}` : undefined },
    ],
    company,
  }
}

/** Otevře smlouvu ve vzhledu šablony 4Bros 2026 a vyvolá tisk (odtud „Uložit jako PDF“). */
export function printContract(contract: Contract, template: ContractTemplate | undefined): void {
  openContractDocPrint(contractDocModel(contract, template))
}
