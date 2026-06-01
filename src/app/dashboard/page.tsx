import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, Clock, Banknote, CheckCircle2, Circle, TrendingUp, Briefcase, ArrowRight, Receipt } from 'lucide-react'
import Link from 'next/link'
import {
  DEMO_USER, DEMO_ADMIN,
  DEMO_TASKS,
  DEMO_LEAVE_BALANCE,
  DEMO_LEAVE_REQUESTS,
  DEMO_EXPENSE_REQUESTS,
  DEMO_PAYSLIPS,
  DEMO_SALARY_INFO,
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

  return (
    <AppShell title="Dashboard" isAdmin={isAdmin} userName={session.user.name} userEmail={session.user.email}>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Dovolená */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 group hover:border-green-200 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-4">
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
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${totalPending > 0 ? 'bg-amber-100' : 'bg-slate-50'}`}>
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
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Banknote className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-headline text-navy">{formatCurrency(latestPayslip.netAmount, latestPayslip.currency)}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">poslední výplata</p>
            <p className="text-[10px] text-slate-400 mt-1">{MONTH_NAMES[latestPayslip.month - 1]} {latestPayslip.year}</p>
          </div>

          {/* Zvýšení / tenure */}
          {raiseInDays != null && raiseInDays > 0 ? (
            <div className="bg-gradient-to-br from-violet to-violet-dark rounded-2xl shadow-sm p-5 text-white">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-headline">+{formatCurrency(salary.nextRaiseAmount, salary.currency)}</p>
              <p className="text-xs font-medium mt-0.5 text-white/70">plánované zvýšení</p>
              <p className="text-[10px] mt-1 text-white/50">
                {salary.nextRaiseDate!.getDate()}. {CZ_MONTHS[salary.nextRaiseDate!.getMonth()]} · za {raiseInMonths} měs.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-violet/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-violet/10 flex items-center justify-center mb-4">
                <Briefcase className="w-4 h-4 text-violet" />
              </div>
              <p className="text-2xl font-headline text-navy">{tenure}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">ve firmě</p>
              <p className="text-[10px] text-slate-400 mt-1">od {startDate.getDate()}. {CZ_MONTHS[startDate.getMonth()]} {startDate.getFullYear()}</p>
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Tasks — wider */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline text-navy">Moje úkoly</h3>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                {completedTasks.length}/{tasks.length} hotovo
              </span>
            </div>

            {pendingTasks.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {pendingTasks.map(task => (
                  <li key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <Circle className="w-4 h-4 text-slate-200 group-hover:text-violet flex-shrink-0 mt-0.5 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-navy">{task.title}</span>
                      {task.dueDate && (
                        <p className="text-xs text-slate-400 mt-0.5">Do {task.dueDate.getDate()}. {CZ_MONTHS[task.dueDate.getMonth()]}</p>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                      task.category === 'ONBOARDING' ? 'bg-violet/10 text-violet' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {task.category === 'ONBOARDING' ? 'Onboarding' : 'HR'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <p className="text-sm font-medium text-navy">Všechny úkoly jsou splněné!</p>
                <p className="text-xs text-slate-400 mt-1">Nemáš žádné nevyřízené úkoly.</p>
              </div>
            )}

            {completedTasks.length > 0 && (
              <details className="border-t border-slate-50 pt-3">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-violet transition-colors select-none">
                  Hotové úkoly ({completedTasks.length})
                </summary>
                <ul className="space-y-1.5 mt-2">
                  {completedTasks.map(task => (
                    <li key={task.id} className="flex items-center gap-3 px-3 py-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-slate-300 line-through">{task.title}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Onboarding — only before 100% */}
            {!onboardingDone && (
              <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-headline text-navy text-sm">Onboarding</h4>
                  <span className="text-xs font-semibold text-amber-600">{onboardingPct}%</span>
                </div>
                <div className="w-full bg-amber-50 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${onboardingPct}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {onboardingTasks.filter(t => !t.completed).length} kroků zbývá k dokončení
                </p>
              </div>
            )}

            {/* Pending expenses */}
            {pendingExpenses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-headline text-navy text-sm">Výdaje ke schválení</h4>
                  <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {pendingExpenses.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {pendingExpenses.map(exp => (
                    <li key={exp.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Receipt className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                        <span className="text-xs text-slate-600 truncate">{exp.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-navy ml-2 flex-shrink-0">{exp.amount} Kč</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h4 className="font-headline text-navy text-sm mb-3">Rychlé akce</h4>
              <div className="space-y-1.5">
                {[
                  { label: 'Žádat o dovolenou', href: '/time-off', color: 'text-green-600 bg-green-50' },
                  { label: 'Proplatit výdaj',   href: '/time-off', color: 'text-amber-600 bg-amber-50' },
                  { label: 'Výplatní pásky',    href: '/payslips', color: 'text-blue-600 bg-blue-50' },
                  { label: 'Upravit profil',    href: '/profile',  color: 'text-violet bg-violet/10' },
                ].map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${link.color}`}>
                        {link.label[0]}
                      </span>
                      <span className="text-sm text-navy">{link.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  )
}
