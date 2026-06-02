import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate } from '@/lib/utils'
import { DEMO_USER, DEMO_ADMIN, DEMO_ASSETS, ASSET_TYPES, ASSET_CONDITIONS } from '@/lib/mock-data'
import { ProfileTabs } from './ProfileTabs'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  const userId = isAdmin ? 'demo-admin-1' : 'demo-employee-1'
  const myAssets = DEMO_ASSETS.filter((a) => a.assignedTo === userId)

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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-headline text-2xl font-bold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
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
        />
      </div>
    </AppShell>
  )
}
