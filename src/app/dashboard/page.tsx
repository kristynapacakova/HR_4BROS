import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatCurrency } from '@/lib/utils'
import { Clock, Cake, Star } from 'lucide-react'
import {
  DEMO_USER, DEMO_ADMIN,
  DEMO_TASKS,
  DEMO_LEAVE_BALANCE,
  DEMO_LEAVE_REQUESTS,
  DEMO_EXPENSE_REQUESTS,
  DEMO_PAYSLIPS,
  DEMO_SALARY_INFO,
  DEMO_TEAM_LEAVES,
  DEMO_TEAM,
  DEMO_EMPLOYEES,
} from '@/lib/mock-data'
import { DashboardGreeting } from './DashboardGreeting'

const CZ_MONTHS = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']
const MONTH_NAMES = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']

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
  const latestPayslip = DEMO_PAYSLIPS[0]
  const pendingExpenses = DEMO_EXPENSE_REQUESTS.filter(e => e.status === 'PENDING')
  const pendingLeave = DEMO_LEAVE_REQUESTS.filter(l => l.status === 'PENDING')
  const totalPending = pendingExpenses.length + pendingLeave.length

  const salary = DEMO_SALARY_INFO
  const raiseInDays = salary.nextRaiseDate ? Math.round((salary.nextRaiseDate.getTime() - Date.now()) / 86400000) : null
  const raiseInMonths = raiseInDays != null ? Math.round(raiseInDays / 30) : null

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

  // HR alerts — upcoming events in next 60 days (admin only)
  type HRAlert = { type: 'birthday' | 'anniversary' | 'trial'; name: string; label: string; days: number }
  const hrAlerts: HRAlert[] = []
  if (isAdmin) {
    const now2 = new Date(); now2.setHours(0,0,0,0)
    const HORIZON = 60

    // Birthdays from DEMO_TEAM
    for (const member of DEMO_TEAM) {
      if (!member.birthday) continue
      const [, bm, bd] = member.birthday.split('-').map(Number)
      let next = new Date(now2.getFullYear(), bm - 1, bd)
      if (next < now2) next = new Date(now2.getFullYear() + 1, bm - 1, bd)
      const days = Math.round((next.getTime() - now2.getTime()) / 86400000)
      if (days <= HORIZON) hrAlerts.push({ type: 'birthday', name: member.name, label: `Narozeniny (${next.getDate()}. ${['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'][bm-1]})`, days })
    }

    // Work anniversaries from DEMO_EMPLOYEES
    for (const emp of DEMO_EMPLOYEES) {
      if (!emp.startDate) continue
      const sd = new Date(emp.startDate)
      const years = now2.getFullYear() - sd.getFullYear()
      if (years <= 0) continue
      let anniv = new Date(now2.getFullYear(), sd.getMonth(), sd.getDate())
      if (anniv < now2) anniv = new Date(now2.getFullYear() + 1, sd.getMonth(), sd.getDate())
      const days = Math.round((anniv.getTime() - now2.getTime()) / 86400000)
      const yrs = anniv.getFullYear() - sd.getFullYear()
      if (days <= HORIZON) hrAlerts.push({ type: 'anniversary', name: emp.name ?? emp.email, label: `Výročí ${yrs} ${yrs === 1 ? 'rok' : yrs < 5 ? 'roky' : 'let'} ve firmě`, days })
    }

    // Trial periods ending (3 months from startDate, show if ending within 60 days)
    for (const emp of DEMO_EMPLOYEES) {
      if (!emp.startDate) continue
      const sd = new Date(emp.startDate)
      const trialEnd = new Date(sd.getFullYear(), sd.getMonth() + 3, sd.getDate())
      const days = Math.round((trialEnd.getTime() - now2.getTime()) / 86400000)
      if (days >= 0 && days <= HORIZON) hrAlerts.push({ type: 'trial', name: emp.name ?? emp.email, label: `Konec zkušební doby (${trialEnd.getDate()}. ${['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'][trialEnd.getMonth()]})`, days })
    }

    hrAlerts.sort((a, b) => a.days - b.days)
  }

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
            { value: formatCurrency(latestPayslip.netAmount, latestPayslip.currency), label: `výplata · ${MONTH_NAMES[latestPayslip.month - 1].toLowerCase()}` },
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

          {isAdmin && hrAlerts.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-50 space-y-2.5">
              {hrAlerts.slice(0, 3).map((alert, i) => {
                const Icon = alert.type === 'birthday' ? Cake : alert.type === 'anniversary' ? Star : Clock
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-violet" />
                    </div>
                    <p className="text-sm text-navy flex-1 min-w-0 truncate">
                      {alert.name} <span className="text-slate-400">· {alert.label}</span>
                    </p>
                    <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                      {alert.days === 0 ? 'Dnes!' : `za ${alert.days} dní`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
