import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate } from '@/lib/utils'
import { OnboardingTaskItem } from './OnboardingTaskItem'
import { CheckCircle2 } from 'lucide-react'
import { DEMO_ONBOARDING_TASKS } from '@/lib/mock-data'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const tasks = DEMO_ONBOARDING_TASKS

  const completedCount = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <AppShell
      title="Onboarding"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline font-semibold text-navy">Průběh onboardingu</h2>
            <span className="text-lg font-bold text-violet">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
            <div
              className="bg-violet h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">
            Splněno {completedCount} z {tasks.length} úkolů
          </p>
          {progress === 100 && (
            <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Výborně! Onboarding je kompletní.</p>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Úkoly k dokončení</h3>
          </div>
          <ul className="divide-y divide-slate-50">
            {tasks.map((task) => (
              <OnboardingTaskItem key={task.id} task={task} />
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
