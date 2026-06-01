import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, Clock, Banknote, CheckCircle2, Circle, TrendingUp, Briefcase, ArrowUpRight, Receipt } from 'lucide-react'
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
  if (rem === 0) return yr
  return `${yr} a ${rem} ${rem === 1 ? 'měsíc' : rem < 5 ? 'měsíce' : 'měsíců'}`
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  const tasks = DEMO_TASKS
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const onboardingDone = tasks.filter(t => t.category === 'ONBOARDING').every(t => t.completed)

  const leaveBalance = DEMO_LEAVE_BALANCE
  const latestPayslip = DEMO_PAYSLIPS[0]
  const pendingExpenses = DEMO_EXPENSE_REQUESTS.filter(e => e.status === 'PENDING')
  const pendingLeave = DEMO_LEAVE_REQUESTS.filter(l => l.status === 'PENDING')
  const totalPending = pendingExpenses.length + pendingLeave.length

  const salary = DEMO_SALARY_INFO
  const raiseInDays = salary.nextRaiseDate
    ? Math.round((salary.nextRaiseDate.getTime() - Date.now()) / 86400000)
    : null
  const raiseInMonths = raiseInDays != null ? Math.round(raiseInDays / 30) : null

  const startDate = user.startDate || new Date('2024-01-15')
  const tenure = tenureText(startDate)

  return (
    <AppShell title="Dashboard" isAdmin={isAdmin} userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Friendly greeting */}
        <DashboardGreeting
          name={(user?.name || session.user.email || '').split(' ')[0]}
          position={user?.position || undefined}
          department={user?.department || undefined}
          tenure={tenure}
          startDate={startDate.toISOString()}
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Zbývající dovolená"
            value={`${leaveBalance.annualTotal - leaveBalance.annualUsed} dní`}
            sub={`z ${leaveBalance.annualTotal} celkem`}
            icon={<CalendarDays className="w-4 h-4" />}
            iconBg="bg-green-50 text-green-600"
          />
          <StatCard
            title="Čekající žádosti"
            value={String(totalPending)}
            sub={totalPending === 0 ? 'vše vyřízeno' : `${pendingLeave.length > 0 ? `${pendingLeave.length} dovolená` : ''}${pendingLeave.length > 0 && pendingExpenses.length > 0 ? ', ' : ''}${pendingExpenses.length > 0 ? `${pendingExpenses.length} výdaje` : ''}`}
            icon={<Clock className="w-4 h-4" />}
            iconBg={totalPending > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}
            highlight={totalPending > 0}
          />
          <StatCard
            title="Poslední výplata"
            value={formatCurrency(latestPayslip.netAmount, latestPayslip.currency)}
            sub={`${MONTH_NAMES[latestPayslip.month - 1]} ${latestPayslip.year}`}
            icon={<Banknote className="w-4 h-4" />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Ve firmě"
            value={tenure}
            sub={`od ${startDate.getDate()}. ${CZ_MONTHS[startDate.getMonth()]} ${startDate.getFullYear()}`}
            icon={<Briefcase className="w-4 h-4" />}
            iconBg="bg-violet/10 text-violet"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tasks */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-navy">Úkoly</h3>
              <span className="text-xs text-slate-400">{completedTasks.length}/{tasks.length} hotovo</span>
            </div>
            {pendingTasks.length > 0 ? (
              <>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                  <div className="bg-violet h-1.5 rounded-full" style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }} />
                </div>
                <ul className="space-y-2.5">
                  {pendingTasks.map(task => (
                    <li key={task.id} className="flex items-start gap-3">
                      <Circle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-navy">{task.title}</span>
                        {task.dueDate && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Do {task.dueDate.getDate()}. {CZ_MONTHS[task.dueDate.getMonth()]}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                        {task.category === 'ONBOARDING' ? 'Onboarding' : 'HR'}
                      </span>
                    </li>
                  ))}
                </ul>
                {completedTasks.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                      Zobrazit hotové ({completedTasks.length})
                    </summary>
                    <ul className="space-y-2 mt-2">
                      {completedTasks.map(task => (
                        <li key={task.id} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-slate-400 line-through">{task.title}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-navy">Všechny úkoly jsou hotové!</p>
                <p className="text-xs text-slate-400 mt-0.5">Nemáš žádné nevyřízené úkoly.</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Onboarding — only if not fully done */}
            {!onboardingDone && (
              <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline text-navy text-sm">Onboarding</h3>
                  <span className="text-xs text-amber-600 font-medium">
                    {tasks.filter(t => t.category === 'ONBOARDING' && t.completed).length}/
                    {tasks.filter(t => t.category === 'ONBOARDING').length} dokončeno
                  </span>
                </div>
                <div className="w-full bg-amber-50 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${(tasks.filter(t => t.category === 'ONBOARDING' && t.completed).length / tasks.filter(t => t.category === 'ONBOARDING').length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Dokončete onboarding pro plný přístup k HR portálu.</p>
              </div>
            )}

            {/* Salary raise info */}
            {raiseInDays != null && raiseInDays > 0 && (
              <div className="bg-white rounded-xl border border-green-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-headline text-navy text-sm">Plánované zvýšení</h3>
                </div>
                <p className="text-2xl font-headline text-navy">
                  +{formatCurrency(salary.nextRaiseAmount, salary.currency)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Od {salary.nextRaiseDate!.getDate()}. {CZ_MONTHS[salary.nextRaiseDate!.getMonth()]} {salary.nextRaiseDate!.getFullYear()}
                  {raiseInMonths != null && raiseInMonths > 0 && ` · za ${raiseInMonths} ${raiseInMonths === 1 ? 'měsíc' : raiseInMonths < 5 ? 'měsíce' : 'měsíců'}`}
                </p>
              </div>
            )}

            {/* Pending expenses */}
            {pendingExpenses.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline text-navy text-sm">Výdaje ke schválení</h3>
                  <span className="badge-pending">{pendingExpenses.length}</span>
                </div>
                <ul className="space-y-2">
                  {pendingExpenses.map(exp => (
                    <li key={exp.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-navy">{exp.title}</span>
                      </div>
                      <span className="text-sm font-medium text-navy">{formatCurrency(exp.amount, exp.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-headline text-navy text-sm mb-3">Rychlé akce</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Žádat o dovolenou', href: '/time-off' },
                  { label: 'Proplatit výdaj', href: '/time-off' },
                  { label: 'Výplatní pásky', href: '/payslips' },
                  { label: 'Upravit profil', href: '/profile' },
                ].map(link => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    className="flex items-center justify-between gap-1 text-xs text-navy bg-slate-50 hover:bg-alice px-3 py-2 rounded-lg transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  )
}

function StatCard({ title, value, sub, icon, iconBg, highlight }: {
  title: string; value: string; sub: string
  icon: React.ReactNode; iconBg: string; highlight?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 ${highlight ? 'border-amber-200' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <p className="text-xl font-headline text-navy leading-tight">{value}</p>
      <p className="text-[10px] font-medium text-slate-500 mt-0.5 uppercase tracking-wide">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}
