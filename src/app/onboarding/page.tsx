import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_ONBOARDING_TASKS, DEMO_OFFBOARDING_TASKS, DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { OnboardingClient } from './OnboardingClient'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER
  const offboardingUnlocked = (user as typeof DEMO_USER & { offboardingUnlocked?: boolean }).offboardingUnlocked ?? false

  return (
    <AppShell
      title="Onboarding | Offboarding"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
      offboardingUnlocked={offboardingUnlocked}
    >
      <OnboardingClient
        onboardingTasks={DEMO_ONBOARDING_TASKS}
        offboardingTasks={DEMO_OFFBOARDING_TASKS}
        offboardingUnlocked={offboardingUnlocked}
        isAdmin={isAdmin}
      />
    </AppShell>
  )
}
