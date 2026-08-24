import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_EDU_BUDGETS, DEMO_EDU_REQUESTS, DEFAULT_EDU_BUDGET } from '@/lib/mock-data'
import { EduBudgetAdmin } from './EduBudgetAdmin'

export default async function VzdelavaniPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const employees = DEMO_EMPLOYEES.map((e) => ({
    id: e.id,
    name: e.name,
    department: e.department,
    budget: DEMO_EDU_BUDGETS[e.id] ?? DEFAULT_EDU_BUDGET,
  }))

  return (
    <AppShell
      title="Vzdělávací budget"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <p className="text-sm text-slate-500">
          Nastav roční částku na kurzy, knihy a konference pro každého člověka. Žádosti o čerpání schvaluješ tady —
          po schválení se částka automaticky odečte z jeho ročního budgetu.
        </p>
        <EduBudgetAdmin employees={employees} seedRequests={DEMO_EDU_REQUESTS} defaultBudget={DEFAULT_EDU_BUDGET} />
      </div>
    </AppShell>
  )
}
