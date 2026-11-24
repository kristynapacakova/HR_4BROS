import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import {
  DEMO_TEAM,
  DEMO_EXPENSE_REQUESTS,
  DEMO_FEEDBACK,
  PERSONA_EMAIL_BY_ID,
  getDemoUserById,
  demoTeamIdFor,
} from '@/lib/mock-data'
import { EventsCard } from './EventsCard'
import { EmployeeDashboard, type EmployeeDashData } from './EmployeeDashboard'
import { computePayNext } from '@/lib/pay-schedule'
import { getHrSource } from '@/lib/hr/source'
import { complianceOf, contractStatus, directivesStatus, latestBozp, type PersonCompliance } from '@/lib/hr/model'

const MONTHS_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']

/** Data pro Dashboard zaměstnance / OSVČ — úkoly, lidé, novinky od HR a termín faktury/výplaty. */
async function employeeDashData(sessionUserId: string, email: string, user: ReturnType<typeof getDemoUserById>, tenure: string): Promise<EmployeeDashData> {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const src = getHrSource()
  const me = await src.personForLogin(sessionUserId, email)
  const meId = me?.id
  const nextOf = (d: Date) => {
    let n = new Date(today.getFullYear(), d.getMonth(), d.getDate())
    if (n < today) n = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate())
    return n
  }
  const inDaysOf = (d: Date) => Math.round((d.getTime() - today.getTime()) / 86400000)
  const dayLabel = (d: Date) => `${d.getDate()}. ${MONTHS_GEN[d.getMonth()]}`

  // Úkoly podle pravidel modelu (src/lib/hr/model.ts)
  const todos: EmployeeDashData['todos'] = []
  const directives = await src.directives()
  const myAcks = meId ? await src.acknowledgements(meId) : []
  const toAck = meId ? directivesStatus(directives, myAcks, meId).missing : []
  if (toAck.length) todos.push({ id: 'dir', label: toAck.length === 1 ? `Odsouhlas směrnici „${toAck[0].title.replace(/^Směrnice č\. [^—]+— /, '')}“` : `Odsouhlas ${toAck.length} směrnice`, hint: 'Přečti a potvrď, že o nich víš', href: '/smernice' })
  const myContract = meId ? contractStatus(await src.contracts(meId)) : null
  if (myContract?.state === 'TO_SIGN_PERSON') todos.push({ id: 'contract', label: `Podepiš: ${myContract.contract!.templateName}`, hint: 'Smlouva čeká na tvůj podpis', href: '/profile?tab=dokumenty' })
  const bozpLast = meId ? latestBozp(await src.bozpTrainings(meId)) : null

  const birthdays = DEMO_TEAM.flatMap(m => {
    if (!m.birthday) return []
    const b = new Date(m.birthday)
    const inDays = inDaysOf(nextOf(b))
    return inDays <= 30 ? [{ id: m.id, inDays, date: dayLabel(b) }] : []
  }).sort((a, b) => a.inDays - b.inDays)

  const anniversaries = DEMO_TEAM.flatMap(m => {
    const next = nextOf(m.startDate)
    const years = next.getFullYear() - m.startDate.getFullYear()
    const inDays = inDaysOf(next)
    return years >= 1 && inDays <= 30 ? [{ id: m.id, years, inDays, date: dayLabel(m.startDate) }] : []
  }).sort((a, b) => a.inDays - b.inDays)

  const byStart = [...DEMO_TEAM].sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  const recent = byStart.filter(m => today.getTime() - m.startDate.getTime() < 183 * 86400000)
  const newcomers = (recent.length ? recent : byStart.slice(0, 2)).slice(0, 3)
    .map(m => ({ id: m.id, since: `${m.startDate.getDate()}. ${m.startDate.getMonth() + 1}.` }))

  const news = [...directives].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, 3).map(d => ({
    id: d.id,
    title: d.title.replace(/^Směrnice č\. [^—]+— /, ''),
    category: d.category,
    date: `${d.publishedAt.getDate()}. ${d.publishedAt.getMonth() + 1}. ${d.publishedAt.getFullYear()}`,
    mine: toAck.some(m => m.id === d.id),
  }))

  const hrPerson = DEMO_TEAM.find(m => m.role === 'ADMIN')
  const isIco = user.employmentType === 'ICO'
  const firstName = (user.name || email).split(' ')[0]
  const pos = user.position || ''
  const dept = user.department || ''
  const subtitle = pos && dept && pos.toLowerCase() !== dept.toLowerCase() ? `${pos} · ${dept}` : pos || dept

  return {
    meId, isIco, firstName, initial: firstName[0]?.toUpperCase() ?? '?', subtitle, tenure,
    todos, birthdays, anniversaries, newcomers, news,
    hrContact: hrPerson ? { id: hrPerson.id, email: hrPerson.email } : undefined,
    payNext: computePayNext(isIco),
    bozpCompletedAt: bozpLast ? bozpLast.toISOString().slice(0, 10) : null,
  }
}

function tenureText(startDate: Date): string {
  const now = new Date()
  const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
  if (months < 1) return 'méně než měsíc'
  if (months < 12) return `${months} ${months === 1 ? 'měsíc' : months < 5 ? 'měsíce' : 'měsíců'}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  const yr = `${years} ${years === 1 ? 'rok' : years < 5 ? 'roky' : 'let'}`
  return rem === 0 ? yr : `${yr} a ${rem} ${rem === 1 ? 'měsíc' : rem < 5 ? 'měsíce' : 'měsíců'}`
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = getDemoUserById(session.user.id)
  const startDate = user.startDate || new Date('2024-01-15')
  const data = await employeeDashData(session.user.id, session.user.email ?? '', user, tenureText(startDate))

  // Stejný Dashboard pro všechny — HR a team leadi mají navíc své povinnosti v „Čeká na tebe“.
  const n = (k: number, one: string, few: string, many: string) => `${k} ${k === 1 ? one : k < 5 ? few : many}`
  const roleTodos: EmployeeDashData['todos'] = []
  if (isAdmin || isTL) {
    const myTeamId = isTL ? demoTeamIdFor(session.user.email ?? '') : undefined
    // doklady jsou vedené pod přihlašovacím (persona) id — dohledat člověka v týmu přes e-mail
    const teamMemberOf = (id: string) => DEMO_TEAM.find(m => m.id === id || m.email === PERSONA_EMAIL_BY_ID[id])
    const expenses = DEMO_EXPENSE_REQUESTS.filter(r => r.status === 'PENDING' && (isAdmin || teamMemberOf(r.employeeId)?.teamLeadId === myTeamId))
    if (expenses.length) roleTodos.push({ id: 'hr-exp', label: `Schval ${n(expenses.length, 'doklad', 'doklady', 'dokladů')} k proplacení`, hint: isTL ? 'Od lidí z tvého týmu' : 'Sport, cestovné, náklady ke klientům', href: '/admin/odmeny?sub=doklady' })
  }
  if (isAdmin) {
    const fb = DEMO_FEEDBACK.filter(f => f.status === 'NEW').length
    if (fb) roleTodos.push({ id: 'hr-fb', label: `Přečti ${n(fb, 'novou zprávu', 'nové zprávy', 'nových zpráv')} ve schránce důvěry`, hint: 'Anonymní i podepsané', href: '/admin/feedback' })
    // Smlouvy podle modelu — k podpisu za firmu, končící a skončené
    const src = getHrSource()
    const [people, contracts, directives, acknowledgements, bozp] = await Promise.all([src.people(), src.contracts(), src.directives(), src.acknowledgements(), src.bozpTrainings()])
    const all: PersonCompliance[] = people.map(p => complianceOf(p, { contracts, directives, acknowledgements, bozp }))
    const count = (k: string) => all.filter(c => c.issues.some(i => i.kind === k)).length
    const toSign = count('CONTRACT_COMPANY')
    if (toSign) roleTodos.push({ id: 'hr-sign', label: `Podepiš ${n(toSign, 'smlouvu', 'smlouvy', 'smluv')} za firmu`, hint: 'Čekají na podpis vedení', href: '/admin/smlouvy' })
    const ending = count('CONTRACT_ENDING') + count('CONTRACT_ENDED')
    if (ending) roleTodos.push({ id: 'hr-exp-c', label: `Vyřeš ${n(ending, 'smlouvu, která končí', 'smlouvy, které končí', 'smluv, které končí')}`, hint: 'Na dobu určitou — prodloužit, nebo ukončit', href: '/admin/plneni' })
    const withIssues = all.filter(c => c.issues.some(i => i.owner === 'person')).length
    if (withIssues) roleTodos.push({ id: 'hr-plneni', label: `${n(withIssues, 'člověk má', 'lidé mají', 'lidí má')} něco nesplněné`, hint: 'BOZP, směrnice, podpisy — přehled plnění', href: '/admin/plneni' })
  }
  data.todos = [...roleTodos, ...data.todos]

  return (
    <AppShell title="Dashboard" isAdmin={isAdmin} isTL={isTL} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
      <EmployeeDashboard
        data={data}
        footer={isAdmin ? <EventsCard teamBirthdays={DEMO_TEAM.map(m => ({ id: m.id, name: m.name, birthday: m.birthday }))} isAdmin /> : undefined}
      />
    </AppShell>
  )
}
