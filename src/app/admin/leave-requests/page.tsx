import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate, getLeaveTypeCz, getDaysBetween } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'
import { LeaveActionButtons } from './LeaveActionButtons'
import { DEMO_ALL_LEAVE_REQUESTS, DEMO_TL, DEMO_TEAM } from '@/lib/mock-data'

// Nadřízený schvaluje jen Dovolenou — homeoffice, nemoc, lékař a volno se zapisují automaticky.
const APPROVAL_REQUIRED_TYPE = 'ANNUAL'

function teamLeadOf(email: string): string | null {
  return DEMO_TEAM.find((m) => m.email.toLowerCase() === email.toLowerCase())?.teamLeadId ?? null
}

export default async function AdminLeaveRequestsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const isTL = session.user.role === 'TL'
  if (session.user.role !== 'ADMIN' && !isTL) redirect('/dashboard')

  const leaveRequests = isTL
    ? DEMO_ALL_LEAVE_REQUESTS.filter((r) => teamLeadOf(r.user.email) === DEMO_TL.id)
    : DEMO_ALL_LEAVE_REQUESTS

  const pending = leaveRequests.filter((r) => r.status === 'PENDING' && r.type === APPROVAL_REQUIRED_TYPE)
  const processed = leaveRequests.filter((r) => r.status !== 'PENDING' || r.type !== APPROVAL_REQUIRED_TYPE)

  return (
    <AppShell
      title={isTL ? 'Žádosti o dovolenou — tvůj tým' : 'Žádosti o dovolenou'}
      isAdmin={session.user.role === 'ADMIN'}
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
              {pending.map((req) => {
                // Upozornění: kolik dalších lidí ze stejného týmu má ve stejném období dovolenou.
                const teamLead = teamLeadOf(req.user.email)
                const overlapping = DEMO_ALL_LEAVE_REQUESTS.filter((other) =>
                  other.id !== req.id &&
                  other.type === APPROVAL_REQUIRED_TYPE &&
                  (other.status === 'APPROVED' || other.status === 'PENDING') &&
                  teamLeadOf(other.user.email) === teamLead &&
                  other.startDate <= req.endDate && other.endDate >= req.startDate
                )
                return <LeaveRequestRow key={req.id} req={req} showActions overlapCount={overlapping.length} />
              })}
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
  overlapCount = 0,
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
  overlapCount?: number
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
        {overlapCount > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-full px-2.5 py-1 mt-1.5 inline-block">
            ⚠️ Ve stejném období má dovolenou ještě {overlapCount} {overlapCount === 1 ? 'člověk' : overlapCount < 5 ? 'lidé' : 'lidí'} z týmu
          </p>
        )}
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
