import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate } from '@/lib/utils'
import { DEMO_USER, DEMO_TEAM, DEMO_ASSETS, ASSET_TYPES, ASSET_CONDITIONS, SENIORITY_LEVELS, EMPLOYMENT_TYPES, DEMO_PAYSLIPS, DEMO_SALARY_INFO, DEMO_LEAVE_REQUESTS, getDemoUserById } from '@/lib/mock-data'
import { ProfileTabs } from './ProfileTabs'
import { AvatarUpload } from '@/components/AvatarUpload'
import { PayslipsClient } from '@/app/payslips/PayslipsClient'
import { TimeOffPanel } from './panels/TimeOffPanel'
import { DocumentsPanel } from './panels/DocumentsPanel'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = getDemoUserById(session.user.id)

  const myAssets = DEMO_ASSETS.filter((a) => a.assignedTo === user.id)
  const teamMemberId = DEMO_TEAM.find((m) => m.email.toLowerCase() === user.email.toLowerCase())?.id

  const payslipsLabel = 'Moje odměna'

  // Dny nemoci v aktuálním měsíci → rozpis srážky v Moje odměna
  const now = new Date()
  const sickDaysThisMonth = DEMO_LEAVE_REQUESTS
    .filter(r => (r.type === 'NEMOC' || r.type === 'SICK') && r.status !== 'REJECTED')
    .reduce((sum, r) => {
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      if (end.getMonth() !== now.getMonth() && start.getMonth() !== now.getMonth()) return sum
      const from = start.getMonth() === now.getMonth() ? start : new Date(now.getFullYear(), now.getMonth(), 1)
      const to = end.getMonth() === now.getMonth() ? end : new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return sum + Math.max(0, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
    }, 0)

  return (
    <AppShell
      title="Můj účet"
      isAdmin={isAdmin}
      isTL={isTL}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-5">
            <AvatarUpload initial={user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()} teamMemberId={teamMemberId} />
            <div>
              <h2 className="text-xl font-headline font-bold text-navy">{user.name || '—'}</h2>
              <p className="text-slate-500 text-sm">{user.position || '—'}</p>
              <p className="text-slate-400 text-xs mt-0.5">{user.department || '—'}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">Zaměstnanec od</p>
              <p className="text-sm font-medium text-navy">{formatDate(user.startDate)}</p>
            </div>
          </div>
        </div>

        <ProfileTabs
          user={user}
          assets={myAssets}
          assetTypes={ASSET_TYPES}
          assetConditions={ASSET_CONDITIONS}
          isAdmin={isAdmin}
          hrData={{
            seniority: (user as typeof DEMO_USER).seniority ?? null,
            monthlyHours: (user as typeof DEMO_USER).monthlyHours ?? null,
            clientHours: (user as typeof DEMO_USER).clientHours ?? null,
            monthlySalary: (user as typeof DEMO_USER).monthlySalary ?? null,
            hourlyRate: (user as typeof DEMO_USER).hourlyRate ?? null,
          }}
          seniorityLevels={SENIORITY_LEVELS}
          employmentTypes={EMPLOYMENT_TYPES}
          payslipsLabel={payslipsLabel}
          payslipsPanel={
            <PayslipsClient
              payslips={DEMO_PAYSLIPS}
              salaryInfo={DEMO_SALARY_INFO}
              employmentType={user.employmentType ?? 'HPP'}
              pageTitle={payslipsLabel}
              sickDays={sickDaysThisMonth}
              employeeId={user.id}
            />
          }
          timeOffPanel={
            <TimeOffPanel
              isEmployee={['HPP', 'DPP', 'DPC'].includes(user.employmentType ?? '')}
              monthlySalary={(user as typeof DEMO_USER).monthlySalary ?? null}
            />
          }
          documentsPanel={<DocumentsPanel isHPP={user.employmentType === 'HPP'} />}
        />
      </div>
    </AppShell>
  )
}
