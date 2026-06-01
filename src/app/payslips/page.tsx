import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { Banknote, Download } from 'lucide-react'
import { DEMO_PAYSLIPS } from '@/lib/mock-data'

export default async function PayslipsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const payslips = DEMO_PAYSLIPS
  const latestPayslip = payslips[0]

  return (
    <AppShell
      title="Výplatní pásky"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Summary */}
        {latestPayslip && (
          <div className="bg-navy rounded-xl p-6 text-white">
            <p className="text-navy-300 text-sm mb-1">Poslední výplata — {formatMonth(latestPayslip.month, latestPayslip.year)}</p>
            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <p className="text-xs text-navy-400 mb-0.5">Hrubá mzda</p>
                <p className="text-2xl font-headline font-bold">{formatCurrency(latestPayslip.grossAmount, latestPayslip.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-0.5">Čistá mzda</p>
                <p className="text-3xl font-headline font-bold text-violet-light">{formatCurrency(latestPayslip.netAmount, latestPayslip.currency)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payslips list */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Přehled výplat</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {payslips.map((payslip) => (
              <div key={payslip.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="p-2.5 bg-[#EFF6FF] rounded-lg">
                  <Banknote className="w-5 h-5 text-navy-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy capitalize">
                    {formatMonth(payslip.month, payslip.year)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hrubá: {formatCurrency(payslip.grossAmount, payslip.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-navy">
                    {formatCurrency(payslip.netAmount, payslip.currency)}
                  </p>
                  <p className="text-xs text-slate-400">čistá mzda</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
