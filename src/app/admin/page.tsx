import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { Users, CalendarDays, FileText, Banknote, ShieldCheck, ArrowRight } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [employeeCount, pendingLeaves, documentCount, payslipCount] = await Promise.all([
    db.user.count({ where: { role: 'EMPLOYEE' } }),
    db.leaveRequest.count({ where: { status: 'PENDING' } }),
    db.document.count(),
    db.payslip.count(),
  ])

  return (
    <AppShell
      title="Admin panel"
      isAdmin={true}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold">HR Administrace</h2>
              <p className="text-navy-300 text-sm">Správa zaměstnanců, dovolených a dokumentů</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Zaměstnanci', value: employeeCount, icon: <Users className="w-5 h-5" />, color: 'blue' },
            { label: 'Čekající dovolené', value: pendingLeaves, icon: <CalendarDays className="w-5 h-5" />, color: 'amber' },
            { label: 'Dokumenty', value: documentCount, icon: <FileText className="w-5 h-5" />, color: 'purple' },
            { label: 'Výplatní pásky', value: payslipCount, icon: <Banknote className="w-5 h-5" />, color: 'green' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-headline font-bold text-navy">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminActionCard
            href="/admin/employees"
            icon={<Users className="w-6 h-6" />}
            title="Správa zaměstnanců"
            description="Vytvářejte zaměstnanecké profily, spravujte role a přiřazujte dokumenty"
          />
          <AdminActionCard
            href="/admin/leave-requests"
            icon={<CalendarDays className="w-6 h-6" />}
            title="Žádosti o dovolenou"
            description={`Schvalte nebo zamítněte čekající žádosti (${pendingLeaves} čekající)`}
            badge={pendingLeaves > 0 ? pendingLeaves : undefined}
          />
        </div>
      </div>
    </AppShell>
  )
}

function AdminActionCard({
  href, icon, title, description, badge,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:border-violet hover:shadow-md transition-all block"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 bg-[#EFF6FF] rounded-lg text-navy group-hover:bg-violet group-hover:text-white transition-colors">
          {icon}
        </div>
        {badge !== undefined && (
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-headline font-semibold text-navy mt-4 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 mt-4 text-violet text-sm font-medium group-hover:gap-2 transition-all">
        <span>Přejít</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}
