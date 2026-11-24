/**
 * Datový model HR portálu — entity, vazby a pravidla, NEZÁVISLÉ na databázi.
 *
 * Každá entita odkazuje na člověka přes `personId` (jedna identita pro všechno).
 * Až se vybere databáze, stačí implementovat `HrDataSource` (./source.ts) — pravidla
 * níže (co je propadlé, co brzy vyprší, kdo má co podepsat…) zůstávají stejná.
 * Podrobný popis: docs/datovy-model.md
 */

export type PersonId = string
export type Role = 'ADMIN' | 'TL' | 'EMPLOYEE'
export type EmploymentType = 'HPP' | 'DPP' | 'DPC' | 'ICO'

/** Člověk ve firmě. Jedna identita — přihlášení, tým, smlouvy, BOZP, směrnice se vážou na `id`. */
export interface Person {
  id: PersonId
  name: string
  email: string
  position: string
  department: string
  role: Role
  employmentType: EmploymentType
  /** Team lead (Person.id) — TL schvaluje doklady svého týmu */
  teamLeadId: PersonId | null
  startDate: Date
  birthday: string | null
}

/** Stav podepisování: HR připraví → podepíše vedení → podepíše člověk */
export type ContractStatus = 'DRAFT' | 'PENDING_MANAGEMENT' | 'PENDING_EMPLOYEE' | 'SIGNED'

/** Smlouva člověka (pracovní, DPP, rámcová OSVČ…). Člověk má 0..n smluv, platná je poslední podepsaná. */
export interface EmploymentContract {
  id: string
  personId: PersonId
  templateName: string
  status: ContractStatus
  /** na dobu určitou / neurčitou */
  termType: 'URCITA' | 'NEURCITA'
  /** konec u smlouvy na dobu určitou */
  endsAt: Date | null
  companySignedAt: Date | null
  personSignedAt: Date | null
}

/** Interní směrnice. Pokud `mustAcknowledge`, musí ji potvrdit každý člověk. */
export interface Directive {
  id: string
  title: string
  category: string
  publishedAt: Date
  mustAcknowledge: boolean
  /** souhlas vyžaduje elektronický podpis (DocuSign) */
  requireESign: boolean
}

/** Potvrzení směrnice člověkem (vazba Directive × Person). Slouží jako doklad o seznámení. */
export interface Acknowledgement {
  directiveId: string
  personId: PersonId
  acknowledgedAt: Date
  /** odkliknutí v portálu (přihlášení přes Google Workspace), nebo elektronický podpis */
  method: 'CHECKBOX' | 'ESIGN'
  /** ID obálky u poskytovatele e-podpisu (DocuSign envelopeId) */
  envelopeId?: string
  /** SHA-256 otisk textu směrnice — prokazuje, se kterou verzí člověk souhlasil */
  documentHash?: string
}

/** Absolvované školení BOZP (historie — rozhoduje poslední). */
export interface BozpTraining {
  personId: PersonId
  completedAt: Date
}

/* ═══════════════════════════ PRAVIDLA ═══════════════════════════ */

export const RULES = {
  /** BOZP platí rok od absolvování */
  bozpValidMonths: 12,
  /** kolik dní předem upozornit, že BOZP vyprší */
  bozpWarnDays: 30,
  /** kolik dní předem hlídat konec smlouvy na dobu určitou */
  contractEndWarnDays: 90,
  /** BOZP se týká jen zaměstnanců — OSVČ (IČO) ho nemají */
  bozpRequiredFor: ['HPP', 'DPP', 'DPC'] as EmploymentType[],
} as const

/** Musí mít člověk školení BOZP? (OSVČ ne) */
export const bozpRequired = (employmentType: EmploymentType) => RULES.bozpRequiredFor.includes(employmentType)

const DAY = 86400000
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const daysBetween = (from: Date, to: Date) => Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY)

export type BozpState = 'MISSING' | 'EXPIRED' | 'EXPIRING' | 'OK'
export interface BozpStatus { state: BozpState; lastCompletedAt: Date | null; validUntil: Date | null; daysLeft: number | null }

/** Stav BOZP podle posledního absolvování. */
export function bozpStatus(lastCompletedAt: Date | null, now = new Date()): BozpStatus {
  if (!lastCompletedAt) return { state: 'MISSING', lastCompletedAt: null, validUntil: null, daysLeft: null }
  const validUntil = new Date(lastCompletedAt)
  validUntil.setMonth(validUntil.getMonth() + RULES.bozpValidMonths)
  const daysLeft = daysBetween(now, validUntil)
  const state: BozpState = daysLeft < 0 ? 'EXPIRED' : daysLeft <= RULES.bozpWarnDays ? 'EXPIRING' : 'OK'
  return { state, lastCompletedAt, validUntil, daysLeft }
}

/** Poslední absolvování z historie (nebo null). */
export function latestBozp(trainings: BozpTraining[]): Date | null {
  return trainings.reduce<Date | null>((max, t) => (!max || t.completedAt > max ? t.completedAt : max), null)
}

export type ContractState = 'NONE' | 'DRAFT' | 'TO_SIGN_COMPANY' | 'TO_SIGN_PERSON' | 'ENDING' | 'ENDED' | 'OK'
export interface ContractStatusInfo { state: ContractState; contract: EmploymentContract | null; endsAt: Date | null; daysLeft: number | null }

/** Stav smluv člověka — nejdřív rozpracované podpisy, pak blížící se konec platné smlouvy. */
export function contractStatus(contracts: EmploymentContract[], now = new Date()): ContractStatusInfo {
  const pending = contracts.find(c => c.status === 'PENDING_EMPLOYEE')
    ?? contracts.find(c => c.status === 'PENDING_MANAGEMENT')
    ?? contracts.find(c => c.status === 'DRAFT')
  if (pending) {
    const state: ContractState = pending.status === 'PENDING_EMPLOYEE' ? 'TO_SIGN_PERSON' : pending.status === 'PENDING_MANAGEMENT' ? 'TO_SIGN_COMPANY' : 'DRAFT'
    return { state, contract: pending, endsAt: pending.endsAt, daysLeft: pending.endsAt ? daysBetween(now, pending.endsAt) : null }
  }
  const signed = contracts.filter(c => c.status === 'SIGNED')
  const current = signed[signed.length - 1] ?? null
  if (!current) return { state: 'NONE', contract: null, endsAt: null, daysLeft: null }
  if (current.termType === 'URCITA' && current.endsAt) {
    const daysLeft = daysBetween(now, current.endsAt)
    if (daysLeft < 0) return { state: 'ENDED', contract: current, endsAt: current.endsAt, daysLeft }
    if (daysLeft <= RULES.contractEndWarnDays) return { state: 'ENDING', contract: current, endsAt: current.endsAt, daysLeft }
    return { state: 'OK', contract: current, endsAt: current.endsAt, daysLeft }
  }
  return { state: 'OK', contract: current, endsAt: null, daysLeft: null }
}

export interface DirectivesStatus { required: number; acknowledged: number; missing: Directive[] }

/** Které povinné směrnice člověk ještě nepotvrdil. */
export function directivesStatus(directives: Directive[], acks: Acknowledgement[], personId: PersonId): DirectivesStatus {
  const required = directives.filter(d => d.mustAcknowledge)
  const done = new Set(acks.filter(a => a.personId === personId).map(a => a.directiveId))
  const missing = required.filter(d => !done.has(d.id))
  return { required: required.length, acknowledged: required.length - missing.length, missing }
}

/* ── Souhrn „co komu chybí“ — pro HR přehled i úkoly na Dashboardu ── */

export type IssueKind = 'CONTRACT_PERSON' | 'CONTRACT_COMPANY' | 'CONTRACT_ENDING' | 'CONTRACT_ENDED' | 'DIRECTIVES' | 'BOZP_MISSING' | 'BOZP_EXPIRED' | 'BOZP_EXPIRING'
export type Severity = 'urgent' | 'soon'
export interface Issue {
  kind: IssueKind
  severity: Severity
  /** kdo to má vyřešit — člověk sám, nebo HR */
  owner: 'person' | 'hr'
  label: string
}

export interface PersonCompliance {
  person: Person
  contract: ContractStatusInfo
  directives: DirectivesStatus
  bozp: BozpStatus
  /** false = BOZP se ho netýká (OSVČ) */
  bozpRequired: boolean
  issues: Issue[]
}

const plural = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

export function complianceOf(
  person: Person,
  data: { contracts: EmploymentContract[]; directives: Directive[]; acknowledgements: Acknowledgement[]; bozp: BozpTraining[] },
  now = new Date(),
): PersonCompliance {
  const contract = contractStatus(data.contracts.filter(c => c.personId === person.id), now)
  const directives = directivesStatus(data.directives, data.acknowledgements, person.id)
  const bozp = bozpStatus(latestBozp(data.bozp.filter(b => b.personId === person.id)), now)
  const issues: Issue[] = []

  if (contract.state === 'TO_SIGN_PERSON') issues.push({ kind: 'CONTRACT_PERSON', severity: 'urgent', owner: 'person', label: 'Smlouva čeká na podpis' })
  if (contract.state === 'TO_SIGN_COMPANY') issues.push({ kind: 'CONTRACT_COMPANY', severity: 'urgent', owner: 'hr', label: 'Smlouva čeká na podpis vedení' })
  if (contract.state === 'ENDED') issues.push({ kind: 'CONTRACT_ENDED', severity: 'urgent', owner: 'hr', label: 'Smlouva skončila' })
  if (contract.state === 'ENDING') issues.push({ kind: 'CONTRACT_ENDING', severity: 'soon', owner: 'hr', label: `Smlouva končí za ${contract.daysLeft} ${plural(contract.daysLeft!, 'den', 'dny', 'dní')}` })
  if (directives.missing.length) issues.push({ kind: 'DIRECTIVES', severity: 'urgent', owner: 'person', label: `Nepotvrzené směrnice: ${directives.missing.length}` })
  const needsBozp = bozpRequired(person.employmentType)
  if (needsBozp && bozp.state === 'MISSING') issues.push({ kind: 'BOZP_MISSING', severity: 'urgent', owner: 'person', label: 'BOZP neabsolvováno' })
  if (needsBozp && bozp.state === 'EXPIRED') issues.push({ kind: 'BOZP_EXPIRED', severity: 'urgent', owner: 'person', label: 'BOZP propadlé' })
  if (needsBozp && bozp.state === 'EXPIRING') issues.push({ kind: 'BOZP_EXPIRING', severity: 'soon', owner: 'person', label: `BOZP vyprší za ${bozp.daysLeft} ${plural(bozp.daysLeft!, 'den', 'dny', 'dní')}` })

  return { person, contract, directives, bozp, bozpRequired: needsBozp, issues }
}
