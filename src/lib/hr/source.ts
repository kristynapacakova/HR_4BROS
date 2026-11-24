/**
 * Jediné místo, odkud aplikace bere HR data (lidi, smlouvy, směrnice, BOZP…).
 *
 * Dnes: `demoSource` z ukázkových dat (mock-data.ts).
 * Až bude databáze: napsat `dbSource`, který implementuje stejné rozhraní `HrDataSource`,
 * a přepnout ho v `getHrSource()`. Zbytek aplikace se nemění.
 */
import {
  DEMO_TEAM, DEMO_DIRECTIVES, PERSONA_EMAIL_BY_ID,
} from '@/lib/mock-data'
import type { Person, PersonId, EmploymentContract, Directive, Acknowledgement, BozpTraining, Role, EmploymentType } from './model'

export interface HrDataSource {
  people(): Promise<Person[]>
  person(id: PersonId): Promise<Person | null>
  /** Přihlášený uživatel → člověk (podle id účtu nebo e-mailu) */
  personForLogin(loginId: string, email?: string | null): Promise<Person | null>
  contracts(personId?: PersonId): Promise<EmploymentContract[]>
  directives(): Promise<Directive[]>
  acknowledgements(personId?: PersonId): Promise<Acknowledgement[]>
  bozpTrainings(personId?: PersonId): Promise<BozpTraining[]>
}

/* ───────────────────────── demo (ukázková data) ───────────────────────── */

const toPerson = (m: typeof DEMO_TEAM[number]): Person => ({
  id: m.id, name: m.name, email: m.email, position: m.position, department: m.department,
  role: m.role as Role, employmentType: m.employmentType as EmploymentType,
  teamLeadId: m.teamLeadId, startDate: m.startDate, birthday: m.birthday,
})

const personIdByEmail = (email?: string | null) => (email ? DEMO_TEAM.find(m => m.email.toLowerCase() === email.toLowerCase())?.id : undefined)
/** Ukázková data mají u přihlašovacích účtů jiná id (demo-employee-1…) — převedeme na id člověka. */
const normalizeId = (id: string) => DEMO_TEAM.some(m => m.id === id) ? id : personIdByEmail(PERSONA_EMAIL_BY_ID[id]) ?? id

/** Rozpracované smlouvy v ukázce (ostatní mají podepsanou). */
const DEMO_CONTRACT_STATUS: Record<PersonId, EmploymentContract['status']> = {
  t12: 'PENDING_EMPLOYEE',
  t15: 'PENDING_MANAGEMENT',
}

/** Poslední BOZP v ukázce (chybí = nikdy). */
const DEMO_BOZP: Record<PersonId, string> = {
  t1: '2026-02-10', t3: '2026-03-01', t4: '2025-12-05', t5: '2025-09-10', t7: '2026-05-20',
  t8: '2026-01-15', t9: '2025-12-20', t10: '2025-06-01', t13: '2026-04-04', t14: '2025-10-30',
  t15: '2026-01-05', t16: '2026-02-02', t2: '2025-11-02',
}

const tpl = (t: string) => t === 'ICO' ? 'Rámcová smlouva o spolupráci' : t === 'DPP' ? 'Dohoda o provedení práce' : 'Pracovní smlouva'

export const demoSource: HrDataSource = {
  async people() { return DEMO_TEAM.map(toPerson) },
  async person(id) { const m = DEMO_TEAM.find(x => x.id === normalizeId(id)); return m ? toPerson(m) : null },
  async personForLogin(loginId, email) {
    const id = personIdByEmail(email) ?? normalizeId(loginId)
    const m = DEMO_TEAM.find(x => x.id === id)
    return m ? toPerson(m) : null
  },
  async contracts(personId) {
    const all: EmploymentContract[] = DEMO_TEAM.map(m => {
      const status = DEMO_CONTRACT_STATUS[m.id] ?? 'SIGNED'
      return {
        id: `ec-${m.id}`, personId: m.id, templateName: tpl(m.employmentType), status,
        termType: m.contractTermType, endsAt: m.contractEndDate,
        companySignedAt: status === 'SIGNED' || status === 'PENDING_EMPLOYEE' ? m.startDate : null,
        personSignedAt: status === 'SIGNED' ? m.startDate : null,
      }
    })
    return personId ? all.filter(c => c.personId === personId) : all
  },
  async directives() {
    return DEMO_DIRECTIVES.map(d => ({ id: d.id, title: d.title, category: d.category, publishedAt: d.publishedAt, mustAcknowledge: d.mustAcknowledge }))
  },
  async acknowledgements(personId) {
    const all = DEMO_DIRECTIVES.flatMap(d => d.acknowledgements.map(a => ({ directiveId: d.id, personId: normalizeId(a.employeeId), acknowledgedAt: a.acknowledgedAt })))
    return personId ? all.filter(a => a.personId === personId) : all
  },
  async bozpTrainings(personId) {
    const all = Object.entries(DEMO_BOZP).map(([pid, d]) => ({ personId: pid, completedAt: new Date(d) }))
    return personId ? all.filter(b => b.personId === personId) : all
  },
}

/** Přepínač zdroje dat — jediné místo, které se mění při napojení databáze. */
export function getHrSource(): HrDataSource {
  return demoSource
}
