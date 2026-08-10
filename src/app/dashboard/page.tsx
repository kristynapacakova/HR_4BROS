import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'

import {
  DEMO_USER, DEMO_ADMIN,
  DEMO_TASKS,
  DEMO_LEAVE_BALANCE,
  DEMO_LEAVE_REQUESTS,
  DEMO_EXPENSE_REQUESTS,
  DEMO_TEAM_LEAVES,
  DEMO_TEAM,
  DEMO_EMPLOYEES,
} from '@/lib/mock-data'
import { DashboardGreeting } from './DashboardGreeting'
import { EventsCard } from './EventsCard'

const CZ_MONTHS = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']

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
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  const tasks = DEMO_TASKS
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const onboardingTasks = tasks.filter(t => t.category === 'ONBOARDING')
  const onboardingDone = onboardingTasks.every(t => t.completed)
  const onboardingPct = Math.round((onboardingTasks.filter(t => t.completed).length / onboardingTasks.length) * 100)

  const leaveBalance = DEMO_LEAVE_BALANCE
  const pendingExpenses = DEMO_EXPENSE_REQUESTS.filter(e => e.status === 'PENDING')
  const pendingLeave = DEMO_LEAVE_REQUESTS.filter(l => l.status === 'PENDING')
  const totalPending = pendingExpenses.length + pendingLeave.length

  const startDate = user.startDate || new Date('2024-01-15')
  const tenure = tenureText(startDate)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayAbsences = DEMO_TEAM_LEAVES.filter((l) => {
    const start = new Date(l.startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(l.endDate)
    end.setHours(0, 0, 0, 0)
    return today >= start && today <= end && (l.status === 'APPROVED' || l.status === 'PENDING')
  })

  const LEAVE_TYPE_CZ: Record<string, string> = {
    ANNUAL: 'Dovolená',
    SICK: 'Nemoc',
    PERSONAL: 'Osobní volno',
    HOMEOFFICE: 'Home office',
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
    <AppShell title="Dashboard" isAdmin={isAdmin} userName={session.user.name} userEmail={session.user.email} employmentType={user.employmentType}>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Hero greeting with inline stats */}
        <DashboardGreeting
          name={(user?.name || session.user.email || '').split(' ')[0]}
          position={user?.position || undefined}
          department={user?.department || undefined}
          tenure={tenure}
          startDate={startDate.toISOString()}
          stats={[
            { value: `${leaveBalance.annualTotal - leaveBalance.annualUsed}`, label: 'dní dovolené' },
            { value: `${totalPending}`, label: totalPending === 0 ? 'žádosti — vše vyřízeno' : 'čekající žádosti' },
          ]}
        />

        {/* Dnes — absences + nearest events in one card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline text-navy mb-4">Dnes</h3>

          {todayAbsences.length === 0 ? (
            <p className="text-sm text-slate-500">Všichni jsou dnes v kanceláři 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {todayAbsences.map((absence) => (
                <div key={absence.id} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-violet/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-violet text-xs font-semibold">{absence.userName[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy leading-tight">{absence.userName}</p>
                    <p className="text-xs text-slate-400">{LEAVE_TYPE_CZ[absence.type] || absence.type}</p>
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
