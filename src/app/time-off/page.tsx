import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate, getLeaveTypeCz, getStatusCz, getDaysBetween } from '@/lib/utils'
import { CalendarDays, Plus } from 'lucide-react'
import { LeaveRequestForm } from './LeaveRequestForm'

export default async function TimeOffPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  const currentYear = new Date().getFullYear()

  const [leaveBalance, leaveRequests] = await Promise.all([
    db.leaveBalance.findFirst({ where: { userId, year: currentYear } }),
    db.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const annualRemaining = leaveBalance ? leaveBalance.annualTotal - leaveBalance.annualUsed : 20
  const sickRemaining = leaveBalance ? leaveBalance.sickTotal - leaveBalance.sickUsed : 10

  return (
    <AppShell
      title="Dovolená"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BalanceCard
            title="Řádná dovolená"
            used={leaveBalance?.annualUsed ?? 0}
            total={leaveBalance?.annualTotal ?? 20}
            remaining={annualRemaining}
            color="violet"
          />
          <BalanceCard
            title="Nemocenská"
            used={leaveBalance?.sickUsed ?? 0}
            total={leaveBalance?.sickTotal ?? 10}
            remaining={sickRemaining}
            color="blue"
          />
        </div>

        {/* New request form */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline font-semibold text-navy mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet" />
            Nová žádost o dovolenou
          </h3>
          <LeaveRequestForm />
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Historie žádostí</h3>
          </div>
          {leaveRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Zatím jste nepodali žádnou žádost</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {leaveRequests.map((req) => (
                <div key={req.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-navy">{getLeaveTypeCz(req.type)}</p>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(req.startDate)} – {formatDate(req.endDate)}
                      {' · '}{getDaysBetween(req.startDate, req.endDate)} dní
                    </p>
                    {req.reason && <p className="text-xs text-slate-400 mt-0.5 italic">"{req.reason}"</p>}
                    {req.note && <p className="text-xs text-amber-600 mt-0.5">Poznámka HR: {req.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function BalanceCard({
  title, used, total, remaining, color,
}: {
  title: string
  used: number
  total: number
  remaining: number
  color: 'violet' | 'blue'
}) {
  const pct = total > 0 ? (used / total) * 100 : 0
  const barColor = color === 'violet' ? 'bg-violet' : 'bg-blue-500'

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-headline font-bold text-navy">{remaining}</p>
      <p className="text-xs text-slate-400 mb-3">zbývajících dní z {total}</p>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">Čerpáno {used} dní</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') return <span className="badge-approved">Schváleno</span>
  if (status === 'REJECTED') return <span className="badge-rejected">Zamítnuto</span>
  return <span className="badge-pending">Čeká na schválení</span>
}
