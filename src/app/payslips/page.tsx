import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_PAYSLIPS, DEMO_SALARY_INFO, DEMO_TEAM_LEAVES, ICO_MONTHLY_EXPENSES, getDemoUserById } from '@/lib/mock-data'
import { PayslipsClient } from './PayslipsClient'

function daysThisMonth(userName: string, type: string): number {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return DEMO_TEAM_LEAVES
    .filter((l) => l.userName === userName && l.type === type && l.status === 'APPROVED')
    .reduce((sum, l) => {
      const start = l.startDate < monthStart ? monthStart : l.startDate
      const end = l.endDate > monthEnd ? monthEnd : l.endDate
      if (end < start) return sum
      return sum + Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    }, 0)
}

export default async function PayslipsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const isTL = session.user.role === 'TL'
  const user = getDemoUserById(session.user.id)
  const pageTitle = 'Moje odměna'

  // Nájem kancelářského místa a občerstvení se liší člověk od člověka — bere se z jeho profilu.
  const icoExpenses = 'officeAmount' in user
    ? [
        { label: 'Nájem kancelářského místa', amount: user.officeAmount },
        { label: 'Občerstvení', amount: user.refreshAmount },
      ]
    : ICO_MONTHLY_EXPENSES

  const sickDays = daysThisMonth(user.name, 'SICK')
  const vacationDays = daysThisMonth(user.name, 'ANNUAL')

  return (
    <AppShell
      title={pageTitle}
      isAdmin={isAdmin}
      isTL={isTL}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <PayslipsClient
        payslips={DEMO_PAYSLIPS}
        salaryInfo={DEMO_SALARY_INFO}
        employmentType={user.employmentType ?? 'HPP'}
        pageTitle={pageTitle}
        employeeId={user.id}
        icoExpenses={icoExpenses}
        sickDays={sickDays}
        vacationDays={vacationDays}
      />
    </AppShell>
  )
}
