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
  DEMO_ALL_LEAVE_REQUESTS,
  DEMO_ADMIN,
  DEMO_USER,
  DEMO_TL,
  DEMO_USER_ICO,
  DEMO_EDU_BUDGETS,
  DEMO_EDU_REQUESTS,
  DEFAULT_EDU_BUDGET,
  getDemoUserById,
  demoTeamIdFor,
} from '@/lib/mock-data'
import { DashboardGreeting } from './DashboardGreeting'
import { EventsCard } from './EventsCard'

const CZ_MONTHS = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']

function fmtKc(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
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

  const tasks = DEMO_TASKS
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const onboardingTasks = tasks.filter(t => t.category === 'ONBOARDING')
  const onboardingDone = onboardingTasks.every(t => t.completed)
  const onboardingPct = Math.round((onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100)

  const startDate = user.startDate || new Date('2024-01-15')
  const tenure = tenureText(startDate)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Tento týden (pondělí–neděle) — širší okno než jen dnešek, ať karta není prázdná ve dnech, kdy nikdo nechybí.
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekAbsences = DEMO_TEAM_LEAVES.filter((l) => {
    const start = new Date(l.startDate); start.setHours(0, 0, 0, 0)
    const end = new Date(l.endDate); end.setHours(0, 0, 0, 0)
    return start <= weekEnd && end >= weekStart && (l.status === 'APPROVED' || l.status === 'PENDING')
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

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
  let officePersonDays = 0
  let homeofficePersonDays = 0
  let totalPersonDays = 0
  for (const day of workdaysSoFar) {
    for (const name of Array.from(scopeNames)) {
      totalPersonDays++
      const leave = DEMO_TEAM_LEAVES.find((l) => {
        const start = new Date(l.startDate); start.setHours(0, 0, 0, 0)
        const end = new Date(l.endDate); end.setHours(0, 0, 0, 0)
        return l.userName === name && l.status === 'APPROVED' && day >= start && day <= end
      })
      if (!leave) officePersonDays++
      else if (leave.type === 'HOMEOFFICE') homeofficePersonDays++
    }
  }
  const officeOccupancyPct = totalPersonDays > 0 ? Math.round((officePersonDays / totalPersonDays) * 100) : 100
  const homeofficeRatePct = totalPersonDays > 0 ? Math.round((homeofficePersonDays / totalPersonDays) * 100) : 0
  const teamLabel = isAdmin ? 'firmy' : 'tvého týmu'

  // Přihlašovací demo účty mají e-mail navázaný na svůj DEMO_TEAM záznam — přes to dohledáme jejich id
  // v prostoru vzdělávacího budgetu / žádostí o dovolenou (ty jsou historicky vedené podle login id, ne DEMO_TEAM id).
  const PERSONA_ID_BY_EMAIL: Record<string, string> = {
    [DEMO_ADMIN.email.toLowerCase()]: DEMO_ADMIN.id,
    [DEMO_USER.email.toLowerCase()]: DEMO_USER.id,
    [DEMO_TL.email.toLowerCase()]: DEMO_TL.id,
    [DEMO_USER_ICO.email.toLowerCase()]: DEMO_USER_ICO.id,
  }
  const scopeMembers = DEMO_TEAM.filter(m => scopeIds.includes(m.id))

  // Vyčerpaná dovolená letos v týmu — vůči nároku (annualLeaveDays), OSVČ bez nároku se do součtu nepočítají.
  const yearStart = new Date(today.getFullYear(), 0, 1)
  const yearEnd = new Date(today.getFullYear(), 11, 31)
  let vacationEntitlement = 0
  let vacationUsed = 0
  for (const m of scopeMembers) {
    if (m.annualLeaveDays == null) continue
    vacationEntitlement += m.annualLeaveDays
    vacationUsed += DEMO_TEAM_LEAVES
      .filter(l => l.userName === m.name && l.type === 'ANNUAL' && l.status === 'APPROVED')
      .reduce((sum, l) => {
        const start = l.startDate < yearStart ? yearStart : l.startDate
        const end = l.endDate > yearEnd ? yearEnd : l.endDate
        if (end < start) return sum
        return sum + Math.round((end.getTime() - start.getTime()) / 86400000) + 1
      }, 0)
  }
  const vacationUsedPct = vacationEntitlement > 0 ? Math.round((vacationUsed / vacationEntitlement) * 100) : null

  // Vzdělávací budget vyčerpaný v týmu — každý má nárok na výchozí budget, čerpání se sčítá jen tam, kde je evidované.
  let eduBudgetTotal = 0
  let eduBudgetUsed = 0
  for (const m of scopeMembers) {
    const personaId = PERSONA_ID_BY_EMAIL[m.email.toLowerCase()]
    eduBudgetTotal += personaId ? (DEMO_EDU_BUDGETS[personaId] ?? DEFAULT_EDU_BUDGET) : DEFAULT_EDU_BUDGET
    if (personaId) {
      eduBudgetUsed += DEMO_EDU_REQUESTS
        .filter(r => r.employeeId === personaId && r.status === 'APPROVED')
        .reduce((sum, r) => sum + r.amount, 0)
    }
  }
  const eduBudgetUsedPct = eduBudgetTotal > 0 ? Math.round((eduBudgetUsed / eduBudgetTotal) * 100) : null

  const pendingLeaveRequests = DEMO_ALL_LEAVE_REQUESTS.filter(l =>
    l.status === 'PENDING' && l.type === 'ANNUAL' && (isAdmin || (isTL &&
      DEMO_TEAM.find(m => m.email.toLowerCase() === l.user.email.toLowerCase())?.teamLeadId === myTeamId
    ))
  )

  // Smlouvy na dobu určitou končící do 3 měsíců — potřebují řešit prodloužení/ukončení
  const expiringContracts = DEMO_EMPLOYEES
    .filter((e) => e.contractTermType === 'URCITA' && e.contractEndDate)
    .map((e) => ({ ...e, daysLeft: Math.round((e.contractEndDate!.getTime() - today.getTime()) / 86400000) }))
    .filter((e) => e.daysLeft >= 0 && e.daysLeft <= 90)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const LEAVE_TYPE_CZ: Record<string, string> = {
    ANNUAL: 'Dovolená',
    SICK: 'Nemoc',
    PERSONAL: 'Osobní volno',
    HOMEOFFICE: 'Home office',
    LEKAR: 'Lékař',
  }

  // Narozeniny tento týden — z profilů týmu
  const weekBirthdays = DEMO_TEAM
    .filter(m => m.birthday)
    .map(m => {
      const [, bm, bd] = m.birthday!.split('-').map(Number)
      let next = new Date(today.getFullYear(), bm - 1, bd)
      if (next < today) next = new Date(today.getFullYear() + 1, bm - 1, bd)
      const days = Math.round((next.getTime() - today.getTime()) / 86400000)
      return { name: m.name, days, dateLabel: `${next.getDate()}. ${CZ_MONTHS[bm - 1]}` }
    })
    .filter(b => b.days <= 7)
    .sort((a, b) => a.days - b.days)

  return (
    <AppShell title="Dashboard" isAdmin={isAdmin} isTL={isTL} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Hero greeting with inline stats */}
        <DashboardGreeting
          name={(user?.name || session.user.email || '').split(' ')[0]}
          position={user?.position || undefined}
          department={user?.department || undefined}
          tenure={tenure}
          startDate={startDate.toISOString()}
        />

        {/* Čeká na tebe — admin vidí vše, TL jen svůj tým */}
        {(isAdmin || isTL) && (
          <Link
            href="/admin/leave-requests"
            className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:border-violet/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-4 h-4 text-violet" />
                </div>
                <div>
                  <p className="font-headline text-navy leading-tight">Čeká na tebe</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {pendingLeaveRequests.length === 0
                      ? isTL ? 'Žádné žádosti od tvého týmu' : 'Žádné žádosti ke schválení'
                      : `${pendingLeaveRequests.length} ${pendingLeaveRequests.length === 1 ? 'žádost o dovolenou čeká' : 'žádosti o dovolenou čekají'} na schválení${isTL ? ' od tvého týmu' : ''}`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet transition-colors flex-shrink-0" />
            </div>

            {pendingLeaveRequests.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 pt-4 border-t border-slate-100">
                {pendingLeaveRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-500 text-[11px] font-semibold">{req.user.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy leading-tight">{req.user.name}</p>
                      <p className="text-xs text-slate-400">{LEAVE_TYPE_CZ[req.type] || req.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Link>
        )}

        {/* Smlouvy na dobu určitou končící do 3 měsíců — jen admin */}
        {isAdmin && expiringContracts.length > 0 && (
          <Link
            href="/admin/smlouvy"
            className="block bg-amber-50 border border-amber-100 rounded-2xl p-6 hover:border-amber-200 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileClock className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="font-headline text-navy leading-tight">Smlouvy končící brzy</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {expiringContracts.length} {expiringContracts.length === 1 ? 'smlouva na dobu určitou končí' : 'smlouvy na dobu určitou končí'} do 3 měsíců — je třeba řešit prodloužení
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 pt-4 border-t border-amber-100">
              {expiringContracts.map((e) => (
                <div key={e.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 text-[11px] font-semibold">{e.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy leading-tight">{e.name}</p>
                    <p className="text-xs text-amber-700">do {e.contractEndDate!.toLocaleDateString('cs-CZ')} · za {e.daysLeft} dní</p>
                  </div>
                </div>
              ))}
            </div>
          </Link>
        )}

        {/* Kdo je dnes v kanceláři vs. mimo — jen HR (celá firma) a TL (svůj tým) */}
        {(isAdmin || isTL) && scopeNames.size > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-headline text-navy mb-1">{isAdmin ? 'Dnes ve firmě' : 'Dnes v tvém týmu'}</h3>
            <p className="text-xs text-slate-400 mb-4">Kolik lidí je v kanceláři a kolik mimo</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-headline font-bold text-navy">{inOfficeCount}</p>
                <p className="text-xs text-slate-400 mt-0.5">v kanceláři</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-headline font-bold text-violet">{homeofficeCount}</p>
                <p className="text-xs text-slate-400 mt-0.5">home office</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-headline font-bold text-amber-600">{otherOutCount}</p>
                <p className="text-xs text-slate-400 mt-0.5">jinak mimo</p>
              </div>
            </div>
          </div>
        )}

        {/* Hravé statistiky — obsazenost kanclu, čerpání dovolené a vzdělávacího budgetu */}
        {(isAdmin || isTL) && scopeMembers.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="font-headline text-navy mb-1">Jak to vypadá {isAdmin ? 've firmě' : 've tvém týmu'}?</h3>
              <p className="text-xs text-slate-400">Od začátku měsíce do dneška</p>
            </div>

            <div>
              <p className="text-sm text-navy">
                Kancl <strong>{teamLabel}</strong> bývá z <strong className="text-violet">{officeOccupancyPct} %</strong> obsazený
                {homeofficeRatePct > 0 && <> ({homeofficeRatePct} % dní je někdo na home office)</>}.
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                <div className="bg-violet h-2 rounded-full transition-all" style={{ width: `${officeOccupancyPct}%` }} />
              </div>
            </div>

            {vacationUsedPct !== null && (
              <div>
                <p className="text-sm text-navy">
                  V rámci {teamLabel} je letos vyčerpáno <strong className="text-green-600">{vacationUsedPct} %</strong> dovolené
                  {' '}({vacationUsed}/{vacationEntitlement} dní).
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, vacationUsedPct)}%` }} />
                </div>
              </div>
            )}

            {eduBudgetUsedPct !== null && (
              <div>
                <p className="text-sm text-navy">
                  Vzdělávací budget {teamLabel} je letos vyčerpaný z <strong className="text-amber-600">{eduBudgetUsedPct} %</strong>
                  {' '}({fmtKc(eduBudgetUsed)} / {fmtKc(eduBudgetTotal)}).
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, eduBudgetUsedPct)}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tento týden — kdo má kdy volno */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline text-navy mb-1">Tento týden</h3>
          <p className="text-xs text-slate-400 mb-4">Kdo je tento týden mimo kancelář</p>

          {weekAbsences.length === 0 ? (
            <p className="text-sm text-slate-500">Tento týden nikdo nechybí 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {weekAbsences.map((absence) => (
                <div key={absence.id} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-violet/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-violet text-xs font-semibold">{absence.userName[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy leading-tight">{absence.userName}</p>
                    <p className="text-xs text-slate-400">
                      {LEAVE_TYPE_CZ[absence.type] || absence.type} · {absence.startDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                      {absence.startDate.getTime() !== absence.endDate.getTime() && ` – ${absence.endDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Kalendář akcí — Google Kalendář + narozeniny tento týden */}
        <EventsCard birthdays={weekBirthdays} isAdmin={isAdmin} />
      </div>
    </AppShell>
  )
}
