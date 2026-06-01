import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate, formatCurrency, getLeaveTypeCz } from '@/lib/utils'
import {
  ClipboardList,
  CalendarDays,
  FileText,
  Banknote,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const isAdmin = session.user.role === 'ADMIN'

  // Fetch data
  const [user, onboardingTasks, leaveBalance, recentLeaveRequests, latestPayslip] =
    await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.onboardingTask.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      db.leaveBalance.findFirst({
        where: { userId, year: new Date().getFullYear() },
      }),
      db.leaveRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      db.payslip.findFirst({
        where: { userId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
    ])

  const completedTasks = onboardingTasks.filter((t) => t.completed).length
  const pendingTasks = onboardingTasks.filter((t) => !t.completed).length
  const pendingLeaveRequests = recentLeaveRequests.filter((l) => l.status === 'PENDING').length

  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
  ]

  return (
    <AppShell
      title="Dashboard"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {/* Welcome banner */}
      <div className="bg-navy rounded-xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="150" cy="50" r="80" fill="white" />
            <circle cx="50" cy="150" r="60" fill="white" />
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-navy-200 text-sm mb-1">Vítejte zpět,</p>
          <h2 className="text-2xl font-headline font-bold mb-1">{user?.name || session.user.email}</h2>
          <p className="text-navy-300 text-sm">
            {user?.position && user?.department ? `${user.position} · ${user.department}` : 'Four Bros s.r.o.'}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Úkoly onboardingu"
          value={`${completedTasks}/${onboardingTasks.length}`}
          subtitle={`${pendingTasks} zbývá`}
          icon={<ClipboardList className="w-5 h-5" />}
          color="violet"
        />
        <StatCard
          title="Zbývající dovolená"
          value={`${leaveBalance ? leaveBalance.annualTotal - leaveBalance.annualUsed : 20} dní`}
          subtitle={`z ${leaveBalance?.annualTotal ?? 20} celkem`}
          icon={<CalendarDays className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Čekající žádosti"
          value={String(pendingLeaveRequests)}
          subtitle="žádostí o dovolenou"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Poslední výplata"
          value={latestPayslip ? formatCurrency(latestPayslip.netAmount, latestPayslip.currency) : '—'}
          subtitle={latestPayslip ? `${monthNames[latestPayslip.month - 1]} ${latestPayslip.year}` : 'Žádná výplata'}
          icon={<Banknote className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding progress */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-semibold text-navy">Průběh onboardingu</h3>
            <span className="text-xs text-slate-500">
              {onboardingTasks.length > 0
                ? Math.round((completedTasks / onboardingTasks.length) * 100)
                : 0}%
            </span>
          </div>
          {onboardingTasks.length > 0 ? (
            <>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                <div
                  className="bg-violet h-2 rounded-full transition-all"
                  style={{
                    width: `${onboardingTasks.length > 0 ? (completedTasks / onboardingTasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <ul className="space-y-2">
                {onboardingTasks.slice(0, 5).map((task) => (
                  <li key={task.id} className="flex items-start gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-navy'}`}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Žádné onboardingové úkoly</p>
          )}
        </div>

        {/* Recent leave requests */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-semibold text-navy">Poslední žádosti o dovolenou</h3>
          </div>
          {recentLeaveRequests.length > 0 ? (
            <ul className="space-y-3">
              {recentLeaveRequests.map((req) => (
                <li key={req.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy">{getLeaveTypeCz(req.type)}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Žádné žádosti o dovolenou</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function StatCard({
  title, value, subtitle, icon, color,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  color: 'violet' | 'green' | 'amber' | 'blue'
}) {
  const colorMap = {
    violet: 'bg-purple-50 text-violet',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-headline font-bold text-navy">{value}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') return <span className="badge-approved">Schváleno</span>
  if (status === 'REJECTED') return <span className="badge-rejected">Zamítnuto</span>
  return <span className="badge-pending">Čeká</span>
}
