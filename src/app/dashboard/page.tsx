import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'

import Link from 'next/link'
import { CheckSquare, ChevronRight, FileClock } from 'lucide-react'
import {
  DEMO_TASKS,
  DEMO_TEAM_LEAVES,
  DEMO_TEAM,
  DEMO_EMPLOYEES,
  DEMO_EXPENSE_REQUESTS,
  DEMO_DIRECTIVES,
  DEMO_CONTRACTS,
  DEMO_ADMIN,
  DEMO_USER,
  DEMO_TL,
  DEMO_USER_ICO,
  getDemoUserById,
  demoTeamIdFor,
} from '@/lib/mock-data'
import { CountUp } from '@/components/CountUp'
import { DashboardGreeting } from './DashboardGreeting'
import { EventsCard } from './EventsCard'
import { RingStat } from './RingStat'
import { EmployeeDashboard, type EmployeeDashData } from './EmployeeDashboard'
import { computePayNext } from '@/lib/pay-schedule'

const MONTHS_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']

/** Data pro Dashboard zaměstnance / OSVČ — úkoly, lidé, novinky od HR a termín faktury/výplaty. */
function employeeDashData(sessionUserId: string, email: string, user: ReturnType<typeof getDemoUserById>, tenure: string): EmployeeDashData {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const meId = demoTeamIdFor(email)
  const nextOf = (d: Date) => {
    let n = new Date(today.getFullYear(), d.getMonth(), d.getDate())
    if (n < today) n = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate())
    return n
  }
  const inDaysOf = (d: Date) => Math.round((d.getTime() - today.getTime()) / 86400000)
  const dayLabel = (d: Date) => `${d.getDate()}. ${MONTHS_GEN[d.getMonth()]}`

  const todos: EmployeeDashData['todos'] = []
  const toAck = DEMO_DIRECTIVES.filter(d => d.mustAcknowledge && !d.acknowledgements.some(a => a.employeeId === sessionUserId))
  if (toAck.length) todos.push({ id: 'dir', label: toAck.length === 1 ? `Odsouhlas směrnici „${toAck[0].title.replace(/^Směrnice č\. [^—]+— /, '')}“` : `Odsouhlas ${toAck.length} směrnice`, hint: 'Přečti a potvrď, že o nich víš', href: '/smernice' })
  DEMO_CONTRACTS
    .filter(c => c.status === 'PENDING_EMPLOYEE' && (c.employeeId === sessionUserId || c.employeeName === user.name))
    .forEach(c => todos.push({ id: c.id, label: `Podepiš: ${c.templateName}`, hint: 'Smlouva čeká na tvůj podpis', href: '/profile?tab=dokumenty' }))

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

  const news = [...DEMO_DIRECTIVES].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, 3).map(d => ({
    id: d.id,
    title: d.title.replace(/^Směrnice č\. [^—]+— /, ''),
    category: d.category,
    date: `${d.publishedAt.getDate()}. ${d.publishedAt.getMonth() + 1}. ${d.publishedAt.getFullYear()}`,
    mine: d.mustAcknowledge && !d.acknowledgements.some(a => a.employeeId === sessionUserId),
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
  const myTeamId = isTL ? demoTeamIdFor(session.user.email ?? '') : undefined
  const myTeamMemberId = demoTeamIdFor(session.user.email ?? '')

  const tasks = DEMO_TASKS
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const onboardingTasks = tasks.filter(t => t.category === 'ONBOARDING')
  const onboardingDone = onboardingTasks.every(t => t.completed)
  const onboardingPct = Math.round((onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100)

  const startDate = user.startDate || new Date('2024-01-15')
  const tenure = tenureText(startDate)

  // Zaměstnanec / OSVČ — vlastní přehled (HR a team leadi zatím mají původní)
  if (!isAdmin && !isTL) {
    return (
      <AppShell title="Dashboard" isAdmin={false} isTL={false} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
        <EmployeeDashboard data={employeeDashData(session.user.id, session.user.email ?? '', user, tenure)} />
      </AppShell>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Tento týden (pondělí–neděle) — širší okno než jen dnešek, ať karta není prázdná ve dnech, kdy nikdo nechybí.
  // Kdo je z týmu daného uživatele dnes v kanceláři vs. na home office — TL vidí svůj tým, HR všechny týmy dohromady.
  const scopeIds = isAdmin
    ? DEMO_TEAM.map(m => m.id)
    : isTL
      ? DEMO_TEAM.filter(m => m.teamLeadId === myTeamId).map(m => m.id)
      : []
  const scopeNames = new Set(DEMO_TEAM.filter(m => scopeIds.includes(m.id)).map(m => m.name))
  const todayOutByType = DEMO_TEAM_LEAVES.filter((l) => {
    const start = new Date(l.startDate); start.setHours(0, 0, 0, 0)
    const end = new Date(l.endDate); end.setHours(0, 0, 0, 0)
    return today >= start && today <= end && l.status === 'APPROVED' && scopeNames.has(l.userName)
  })
  const homeofficeCount = todayOutByType.filter(l => l.type === 'HOMEOFFICE').length
  const otherOutCount = todayOutByType.filter(l => l.type !== 'HOMEOFFICE').length
  const inOfficeCount = Math.max(0, scopeNames.size - homeofficeCount - otherOutCount)

  // Obsazenost kanclu od začátku měsíce do dneška — pracovní dny × lidé z týmu, kolik z toho reálně sedělo v kanceláři.
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const workdaysSoFar: Date[] = []
  for (const d = new Date(monthStart); d <= today; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) workdaysSoFar.push(new Date(d))
  }
  // Moje vlastní čísla za tenhle měsíc — vidí to úplně každý, ne jen HR/TL.
  let myOfficeDays = 0
  let myHomeofficeDays = 0
  let myOffDays = 0
  for (const day of workdaysSoFar) {
    const leave = DEMO_TEAM_LEAVES.find((l) => {
      const start = new Date(l.startDate); start.setHours(0, 0, 0, 0)
      const end = new Date(l.endDate); end.setHours(0, 0, 0, 0)
      return l.userName === user.name && l.status === 'APPROVED' && day >= start && day <= end
    })
    if (!leave) myOfficeDays++
    else if (leave.type === 'HOMEOFFICE') myHomeofficeDays++
    else myOffDays++
  }

  // Dovolená/docházka se teď schvaluje v TrackDecku — tady čekají jen doklady k proplacení a podpisy.
  const pendingExpenseClaims = DEMO_EXPENSE_REQUESTS.filter(r =>
    r.status === 'PENDING' && (isAdmin || (isTL &&
      DEMO_TEAM.find(m => m.id === r.employeeId)?.teamLeadId === myTeamId
    ))
  )

  // Smlouvy na dobu určitou končící do 3 měsíců — potřebují řešit prodloužení/ukončení
  const expiringContracts = DEMO_EMPLOYEES
    .filter((e) => e.contractTermType === 'URCITA' && e.contractEndDate)
    .map((e) => ({ ...e, daysLeft: Math.round((e.contractEndDate!.getTime() - today.getTime()) / 86400000) }))
    .filter((e) => e.daysLeft >= 0 && e.daysLeft <= 90)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  // Narozeniny tento týden — základní data z DEMO_TEAM, EventsCard si k tomu domíchá případné úpravy z profilu
  const teamBirthdays = DEMO_TEAM.map(m => ({ id: m.id, name: m.name, birthday: m.birthday }))

  return (
    <AppShell title="Dashboard" isAdmin={isAdmin} isTL={isTL} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
      <div className="w-full space-y-5">

        {/* Hero greeting with inline stats */}
        <DashboardGreeting
          name={(user?.name || session.user.email || '').split(' ')[0]}
          initial={(user?.name || session.user.email || '?')[0]?.toUpperCase()}
          teamMemberId={myTeamMemberId}
          position={user?.position || undefined}
          department={user?.department || undefined}
          tenure={tenure}
          startDate={startDate.toISOString()}
        />

        {/* Přehled týmu/firmy — dnešní přítomnost + obsazenost kanclu, dovolená a vzdělávací budget od začátku měsíce/roku */}
        {(isAdmin || isTL) && scopeNames.size > 0 && (
          <div className="bg-white border border-[rgba(13,33,79,0.14)] p-6">
            <h3 className="font-headline text-navy mb-4">{isAdmin ? 'Jak to vypadá dnes ve firmě?' : 'Jak to vypadá dnes ve tvém týmu?'}</h3>
            <div className="grid grid-cols-3 gap-3 pb-5 mb-5 border-b border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-headline font-semibold text-navy"><CountUp value={inOfficeCount} /></p>
                <p className="text-xs text-slate-400 mt-0.5">v kanceláři</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-headline font-semibold text-navy"><CountUp value={homeofficeCount} /></p>
                <p className="text-xs text-slate-400 mt-0.5">home office</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-headline font-semibold text-navy"><CountUp value={otherOutCount} /></p>
                <p className="text-xs text-slate-400 mt-0.5">OFF</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <RingStat
                pct={Math.round((inOfficeCount / scopeNames.size) * 100)}
                value={`${Math.round((inOfficeCount / scopeNames.size) * 100)}%`}
                label="v kanceláři"
                tone="strong"
              />
              <RingStat
                pct={Math.round((homeofficeCount / scopeNames.size) * 100)}
                value={`${Math.round((homeofficeCount / scopeNames.size) * 100)}%`}
                label="home office"
                tone="soft"
              />
              <RingStat
                pct={Math.round((otherOutCount / scopeNames.size) * 100)}
                value={`${Math.round((otherOutCount / scopeNames.size) * 100)}%`}
                label="OFF"
                tone="gold"
              />
            </div>
          </div>
        )}

        {/* Moje čísla za tenhle měsíc — vidí úplně každý */}
        <div className="bg-white border border-[rgba(13,33,79,0.14)] p-6">
          <h3 className="font-headline text-navy mb-4">Jak to vypadá tenhle měsíc u tebe?</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-headline font-semibold text-navy"><CountUp value={myOfficeDays} /></p>
              <p className="text-xs text-slate-400 mt-0.5">v kanceláři</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline font-semibold text-navy"><CountUp value={myHomeofficeDays} /></p>
              <p className="text-xs text-slate-400 mt-0.5">home office</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline font-semibold text-navy"><CountUp value={myOffDays} /></p>
              <p className="text-xs text-slate-400 mt-0.5">OFF</p>
            </div>
          </div>
        </div>

        {/* Kalendář akcí — Google Kalendář + narozeniny tento týden */}
        <EventsCard teamBirthdays={teamBirthdays} isAdmin={isAdmin} />

        {/* Čeká na tebe — admin vidí vše, TL jen svůj tým */}
        {(isAdmin || isTL) && (
          <Link
            href="/admin/odmeny?sub=doklady"
            className="block bg-white border-l-4 border-l-violet border border-[rgba(13,33,79,0.14)] p-6 hover:border-[#834DFB] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet/10 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-4 h-4 text-violet" />
                </div>
                <div>
                  <p className="font-headline text-navy leading-tight">Čeká na tebe</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {pendingExpenseClaims.length === 0
                      ? isTL ? 'Žádné doklady od tvého týmu' : 'Žádné doklady ke schválení'
                      : `${pendingExpenseClaims.length} ${pendingExpenseClaims.length === 1 ? 'doklad čeká' : 'doklady čekají'} na schválení${isTL ? ' od tvého týmu' : ''}`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet transition-colors flex-shrink-0" />
            </div>
          </Link>
        )}

        {/* Smlouvy na dobu určitou končící do 3 měsíců — jen admin */}
        {isAdmin && expiringContracts.length > 0 && (
          <Link
            href="/admin/smlouvy"
            className="block bg-white border border-[rgba(13,33,79,0.14)] p-6 hover:border-navy/20 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-alice rounded-full flex items-center justify-center flex-shrink-0">
                  <FileClock className="w-4 h-4 text-navy" />
                </div>
                <div>
                  <p className="font-headline text-navy leading-tight">Smlouvy končící brzy</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {expiringContracts.length} {expiringContracts.length === 1 ? 'smlouva na dobu určitou končí' : 'smlouvy na dobu určitou končí'} do 3 měsíců — je třeba řešit prodloužení
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-navy transition-colors flex-shrink-0" />
            </div>
          </Link>
        )}
      </div>
    </AppShell>
  )
}
