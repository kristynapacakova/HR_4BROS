import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EXPENSE_REQUESTS } from '@/lib/mock-data'
import { ExpenseAdmin } from './ExpenseAdmin'

export default async function VydajePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppShell
      title="Doklady k proplacení"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <p className="text-sm text-slate-500 flex-1 min-w-[220px]">
            Doklady, které lidé nahráli v záložce Moje odměna — příspěvky na sport, náklady ke klientům, cestovné apod.
            Po schválení se částka promítne do jejich odměny/faktury za daný měsíc.
          </p>
          <Link
            href="/admin/faktury"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet/10 hover:bg-violet/20 text-violet text-sm font-medium rounded-full transition-colors flex-shrink-0"
          >
            <FileText className="w-4 h-4" /> Přehled faktur OSVČ
          </Link>
        </div>
        <ExpenseAdmin seedRequests={DEMO_EXPENSE_REQUESTS} />
      </div>
    </AppShell>
  )
}
