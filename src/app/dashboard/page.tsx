import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, Clock, Banknote, ArrowRight, Cake, Star, AlertCircle } from 'lucide-react'
import Link from 'next/link'
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

        {/* Hero greeting */}
        <DashboardGreeting
          name={(user?.name || session.user.email || '').split(' ')[0]}
          position={user?.position || undefined}
          department={user?.department || undefined}
          tenure={tenure}
          startDate={startDate.toISOString()}
        />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Dovolená */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 group hover:border-green-200 transition-colors">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CalendarDays className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-headline text-navy">{leaveBalance.annualTotal - leaveBalance.annualUsed}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">dní dovolené</p>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
              <div className="bg-green-400 h-1 rounded-full" style={{ width: `${((leaveBalance.annualTotal - leaveBalance.annualUsed) / leaveBalance.annualTotal) * 100}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{leaveBalance.annualUsed} z {leaveBalance.annualTotal} vyčerpáno</p>
          </div>

          {/* Čekající žádosti */}
          <div className={`rounded-2xl border shadow-sm p-5 transition-colors ${totalPending > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-4 ${totalPending > 0 ? 'bg-amber-100' : 'bg-slate-50'}`}>
              <Clock className={`w-4 h-4 ${totalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <p className={`text-2xl font-headline ${totalPending > 0 ? 'text-amber-800' : 'text-navy'}`}>{totalPending}</p>
            <p className={`text-xs font-medium mt-0.5 ${totalPending > 0 ? 'text-amber-700' : 'text-slate-500'}`}>čekajících žádostí</p>
            <p className={`text-[10px] mt-1 ${totalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {totalPending === 0 ? 'Vše vyřízeno ✓' : `${pendingLeave.length > 0 ? `${pendingLeave.length} dovolená` : ''}${pendingLeave.length > 0 && pendingExpenses.length > 0 ? ', ' : ''}${pendingExpenses.length > 0 ? `${pendingExpenses.length} výdaje` : ''}`}
            </p>
          </div>

          {/* Výplata */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-blue-200 transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Banknote className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-headline text-navy">{formatCurrency(latestPayslip.netAmount, latestPayslip.currency)}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">poslední výplata</p>
            <p className="text-[10px] text-slate-400 mt-1">{MONTH_NAMES[latestPayslip.month - 1]} {latestPayslip.year}</p>
          </div>

        </div>

        {/* Dnes mimo office */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-headline text-navy mb-3 text-sm">Dnes mimo office</h3>
          {todayAbsences.length === 0 ? (
            <p className="text-sm text-slate-500">Všichni jsou dnes v kanceláři 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-3 overflow-x-auto">
              {todayAbsences.map((absence) => (
                <div key={absence.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-0.5 rounded-full opacity-30" style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)', filter: 'blur(4px)' }} />
                    <div className="relative w-8 h-8 bg-navy rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{absence.userName[0]}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy leading-tight">{absence.userName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      absence.type === 'SICK' ? 'bg-red-50 text-red-600' :
                      absence.type === 'ANNUAL' ? 'bg-green-50 text-green-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {LEAVE_TYPE_CZ[absence.type] || absence.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HR Alerts — admin only */}
        {isAdmin && hrAlerts.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-violet" />
              <h3 className="font-headline text-navy text-sm">Nadcházející události</h3>
              <span className="ml-auto text-xs bg-violet/10 text-violet px-2 py-0.5 rounded-full font-medium">{hrAlerts.length}</span>
            </div>
            <div className="space-y-2">
              {hrAlerts.map((alert, i) => {
                const Icon = alert.type === 'birthday' ? Cake : alert.type === 'anniversary' ? Star : Clock
                const urgent = alert.days <= 7
                return (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${urgent ? 'bg-violet/5 border border-violet/20' : 'hover:bg-slate-50'} transition-colors`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${urgent ? 'bg-violet/10' : 'bg-slate-100'}`}>
                      <Icon className={`w-3.5 h-3.5 ${urgent ? 'text-violet' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{alert.name}</p>
                      <p className="text-xs text-slate-400">{alert.label}</p>
                    </div>
                    <span className={`text-xs font-semibold flex-shrink-0 ${urgent ? 'text-violet' : 'text-slate-400'}`}>
                      {alert.days === 0 ? 'Dnes!' : `za ${alert.days} dní`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick actions — compact row */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Žádat o dovolenou', href: '/profile?tab=dochazka' },
            { label: 'Moje výplata',      href: '/profile?tab=vyplata' },
            { label: 'Dokumenty',         href: '/profile?tab=dokumenty' },
            { label: 'Upravit profil',    href: '/profile' },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm font-medium text-navy hover:border-violet/30 hover:text-violet transition-all"
            >
              {link.label}
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
