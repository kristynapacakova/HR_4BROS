import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate } from '@/lib/utils'
import { DEMO_USER, DEMO_ADMIN, DEMO_ASSETS, ASSET_TYPES, ASSET_CONDITIONS, SENIORITY_LEVELS, EMPLOYMENT_TYPES, DEMO_PAYSLIPS, DEMO_SALARY_INFO, DEMO_ONBOARDING_TASKS, DEMO_OFFBOARDING_TASKS } from '@/lib/mock-data'
import { ProfileTabs } from './ProfileTabs'
import { PayslipsClient } from '@/app/payslips/PayslipsClient'
import { OnboardingClient } from '@/app/onboarding/OnboardingClient'
import { TimeOffPanel } from './panels/TimeOffPanel'
import { DocumentsPanel } from './panels/DocumentsPanel'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  const userId = isAdmin ? 'demo-admin-1' : 'demo-employee-1'
  const myAssets = DEMO_ASSETS.filter((a) => a.assignedTo === userId)

  const payslipsLabel = user.employmentType === 'ICO' ? 'Moje fakturace' : 'Moje výplata'
  const offboardingUnlocked = (user as typeof DEMO_USER & { offboardingUnlocked?: boolean }).offboardingUnlocked ?? false

  return (
    <AppShell
      title="Můj účet"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-full opacity-30" style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)', filter: 'blur(6px)' }} />
              <div className="relative w-16 h-16 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white font-headline text-2xl font-bold">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              </div>
            </div>
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
            />
          }
          timeOffPanel={<TimeOffPanel />}
          documentsPanel={<DocumentsPanel isHPP={user.employmentType === 'HPP'} />}
          onboardingPanel={
            <OnboardingClient
              onboardingTasks={DEMO_ONBOARDING_TASKS}
              offboardingTasks={DEMO_OFFBOARDING_TASKS}
              offboardingUnlocked={offboardingUnlocked}
              isAdmin={isAdmin}
            />
          }
        />
      </div>
    </AppShell>
  )
}
