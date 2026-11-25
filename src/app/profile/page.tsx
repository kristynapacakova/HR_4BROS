import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_USER, DEMO_TEAM, DEMO_ASSETS, ASSET_TYPES, ASSET_CONDITIONS, SENIORITY_LEVELS, EMPLOYMENT_TYPES, payslipsFor, salaryInfoFor, demoTeamIdFor, DEMO_LEAVE_REQUESTS, getDemoUserById } from '@/lib/mock-data'
import { PayslipsClient } from '@/app/payslips/PayslipsClient'
import { TimeOffPanel } from './panels/TimeOffPanel'
import { DocumentsPanel } from './panels/DocumentsPanel'
import { AccountCard } from './AccountCard'
import { getHrSource } from '@/lib/hr/source'
import { latestBozp } from '@/lib/hr/model'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = getDemoUserById(session.user.id)
  // výplaty / faktury přihlášeného člověka (ne ukázkové Janovy)
  const myTeamId = demoTeamIdFor(session.user.email ?? '') ?? ''

  const myAssets = DEMO_ASSETS.filter((a) => a.assignedTo === user.id)
  const teamMember = DEMO_TEAM.find((m) => m.email.toLowerCase() === user.email.toLowerCase())

  const payslipsLabel = 'Moje odměna'

  // Poslední BOZP ze zdroje dat (src/lib/hr) — profil ho spojí s tím, co si člověk odklikl v prohlížeči
  const src = getHrSource()
  const me = await src.personForLogin(session.user.id, session.user.email)
  const bozpLast = me ? latestBozp(await src.bozpTrainings(me.id)) : null
  const userWithBozp = { ...user, bozpCompletedAt: bozpLast ? bozpLast.toISOString().slice(0, 10) : null, startingSalary: salaryInfoFor(myTeamId).startingSalary }
  // nájem místa a občerstvení OSVČ — z údajů člověka (stejně jako na faktuře)
  const icoExpenses = teamMember?.officeAmount != null ? [
    { label: 'Nájem kancelářského místa', amount: teamMember.officeAmount },
    { label: 'Občerstvení', amount: teamMember.refreshAmount ?? 0 },
  ] : undefined

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
      <Suspense>
        <AccountCard
          info={{
            name: user.name || user.email,
            position: user.position || '',
            department: teamMember?.department ?? (user.department || ''),
            employmentType: user.employmentType ?? 'HPP',
            startDate: user.startDate ? new Date(user.startDate).toISOString() : null,
            contractTermType: teamMember?.contractTermType ?? null,
            contractEndDate: teamMember?.contractEndDate ? teamMember.contractEndDate.toISOString() : null,
            teamMemberId: teamMember?.id,
            assetCount: myAssets.length,
          }}
          tabs={{
            user: userWithBozp,
            assets: myAssets,
            assetTypes: ASSET_TYPES,
            assetConditions: ASSET_CONDITIONS,
            isAdmin,
            hrData: {
              seniority: (user as typeof DEMO_USER).seniority ?? null,
              monthlyHours: (user as typeof DEMO_USER).monthlyHours ?? null,
              clientHours: (user as typeof DEMO_USER).clientHours ?? null,
              monthlySalary: (user as typeof DEMO_USER).monthlySalary ?? null,
              hourlyRate: (user as typeof DEMO_USER).hourlyRate ?? null,
            },
            seniorityLevels: SENIORITY_LEVELS,
            employmentTypes: EMPLOYMENT_TYPES,
            payslipsLabel,
            payslipsPanel: (
              <PayslipsClient
                payslips={payslipsFor(myTeamId)}
                salaryInfo={salaryInfoFor(myTeamId)}
                employmentType={user.employmentType ?? 'HPP'}
                pageTitle={payslipsLabel}
                icoExpenses={icoExpenses}
                sickDays={sickDaysThisMonth}
                employeeId={user.id}
                employeeName={user.name}
              />
            ),
            timeOffPanel: (
              <TimeOffPanel
                isEmployee={['HPP', 'DPP', 'DPC'].includes(user.employmentType ?? '')}
                monthlySalary={(user as typeof DEMO_USER).monthlySalary ?? null}
              />
            ),
            documentsPanel: <DocumentsPanel isHPP={user.employmentType === 'HPP'} personId={teamMember?.id} />,
          }}
        />
      </Suspense>
    </AppShell>
  )
}
