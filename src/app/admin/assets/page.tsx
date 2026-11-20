import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'
import { AssetsClient } from './AssetsClient'

export default async function AdminAssetsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppShell
      title="Správa majetku"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <AssetsClient employees={DEMO_EMPLOYEES.map((e) => ({ id: e.id, name: e.name, email: e.email }))} />
    </AppShell>
  )
}
