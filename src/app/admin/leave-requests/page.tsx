import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate, getLeaveTypeCz, getDaysBetween } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'
import { LeaveActionButtons } from './LeaveActionButtons'

export default async function AdminLeaveRequestsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const leaveRequests = await db.leaveRequest.findMany({
    include: { user: { select: { name: true, email: true, department: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  const pending = leaveRequests.filter((r) => r.status === 'PENDING')
  const processed = leaveRequests.filter((r) => r.status !== 'PENDING')

  return (
    <AppShell
      title="Žádosti o dovolenou"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Pending */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <h3 className="font-headline font-semibold text-navy">Čekající žádosti</h3>
            {pending.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </div>
          {pending.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Žádné čekající žádosti</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pending.map((req) => (
                <LeaveRequestRow key={req.id} req={req} showActions />
              ))}
            </div>
          )}
        </div>

        {/* Processed */}
        {processed.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-headline font-semibold text-navy">Vyřízené žádosti</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {processed.slice(0, 20).map((req) => (
                <LeaveRequestRow key={req.id} req={req} showActions={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function LeaveRequestRow({
  req,
  showActions,
}: {
  req: {
    id: string
    type: string
    startDate: Date
    endDate: Date
    status: string
    reason: string | null
    note: string | null
    user: { name: string | null; email: string; department: string | null }
  }
  showActions: boolean
}) {
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-medium text-navy">{req.user.name || req.user.email}</p>
          {req.user.department && (
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
              {req.user.department}
            </span>
          )}
          <StatusBadge status={req.status} />
        </div>
        <p className="text-sm text-slate-600">
          {getLeaveTypeCz(req.type)} ·{' '}
          {formatDate(req.startDate)} – {formatDate(req.endDate)}
          {' '}({getDaysBetween(req.startDate, req.endDate)} dní)
        </p>
        {req.reason && <p className="text-xs text-slate-400 mt-0.5 italic">"{req.reason}"</p>}
        {req.note && <p className="text-xs text-amber-700 mt-0.5">Vaše poznámka: {req.note}</p>}
      </div>
      {showActions && <LeaveActionButtons requestId={req.id} />}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') return <span className="badge-approved">Schváleno</span>
  if (status === 'REJECTED') return <span className="badge-rejected">Zamítnuto</span>
  return <span className="badge-pending">Čeká</span>
}
