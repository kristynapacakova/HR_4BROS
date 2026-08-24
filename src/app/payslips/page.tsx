import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_PAYSLIPS, DEMO_SALARY_INFO, getDemoUserById } from '@/lib/mock-data'
import { PayslipsClient } from './PayslipsClient'

export default async function PayslipsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = getDemoUserById(session.user.id)
  const pageTitle = 'Moje odměna'

  return (
    <AppShell
      title={pageTitle}
      isAdmin={isAdmin}
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
      />
    </AppShell>
  )
}
