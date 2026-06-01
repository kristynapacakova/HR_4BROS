import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate } from '@/lib/utils'
import { Users } from 'lucide-react'
import { CreateEmployeeForm } from './CreateEmployeeForm'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'

export default async function AdminEmployeesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const employees = DEMO_EMPLOYEES

  return (
    <AppShell
      title="Zaměstnanci"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Create employee */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline font-semibold text-navy mb-4">Přidat zaměstnance</h3>
          <CreateEmployeeForm />
        </div>

        {/* Employees table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-headline font-semibold text-navy">Přehled zaměstnanců ({employees.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Zaměstnanec</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Oddělení</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Nástup</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Dovolená</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Onboarding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => {
                  const balance = emp.leaveBalances[0]
                  const completedTasks = emp.onboardingTasks.filter((t) => t.completed).length
                  const totalTasks = emp.onboardingTasks.length
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                              {emp.name?.[0]?.toUpperCase() || emp.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-navy">{emp.name || '—'}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-navy">{emp.department || '—'}</p>
                        <p className="text-xs text-slate-400">{emp.position || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(emp.startDate)}</td>
                      <td className="px-6 py-4">
                        {balance ? (
                          <span className="text-navy">
                            {balance.annualTotal - balance.annualUsed}/{balance.annualTotal} dní
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {totalTasks > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-1.5">
                              <div
                                className="bg-violet h-1.5 rounded-full"
                                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{completedTasks}/{totalTasks}</span>
                          </div>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
