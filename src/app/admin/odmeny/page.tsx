import { auth } from '@/lib/auth'
import { PageHero } from '@/components/layout/PageHero'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_EMPLOYEES, DEMO_PAYSLIPS, DEMO_USER, DEMO_USER_ICO, DEMO_ICO_INVOICES, DEMO_EXPENSE_REQUESTS } from '@/lib/mock-data'
import { OdmenySection } from './OdmenySection'
import type { PayslipRow } from './OdmenyTabs'

/** Deterministický „šum“ 0..1 pro demo data (stejný výsledek při každém renderu). */
function noise(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

// Meziroční růst vůči roku 2026 (plán) — starší roky jsou o něco nižší.
const YEAR_FACTOR: Record<number, number> = { 2026: 1, 2025: 0.95, 2024: 0.91, 2023: 0.87 }
const NET_RATIO: Record<string, number> = { HPP: 0.735, DPC: 0.8, DPP: 0.85, ICO: 1 }

export default async function OdmenyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  // Kalendář období bereme z DEMO_PAYSLIPS (roky, měsíce, příznak „plán“).
  const periods = DEMO_PAYSLIPS.map(p => ({ month: p.month, year: p.year, planned: p.planned }))

  // Demo: Jan Novák má skutečné výplatní pásky, ostatním dopočítáme odměny z jejich mzdy / sazby.
  const payslipRows: PayslipRow[] = DEMO_EMPLOYEES.flatMap(emp => {
    const isJan = emp.email.toLowerCase() === DEMO_USER.email.toLowerCase()
    if (isJan) {
      return DEMO_PAYSLIPS.map(p => ({
        id: `${emp.id}-${p.id}`, personId: emp.id, name: emp.name, email: emp.email,
        employmentType: emp.employmentType,
        grossAmount: p.grossAmount, netAmount: p.netAmount,
        month: p.month, year: p.year, currency: p.currency, planned: p.planned,
      }))
    }
    const base = emp.employmentType === 'ICO'
      ? (emp.hourlyRate ?? 0) * (emp.monthlyHours ?? 0)
      : emp.monthlySalary ?? 0
    if (!base) return []
    const startKey = emp.startDate.getFullYear() * 12 + emp.startDate.getMonth()
    return periods
      .filter(({ month, year }) => year * 12 + (month - 1) >= startKey)
      .map(({ month, year, planned }) => {
        const factor = YEAR_FACTOR[year] ?? 0.85
        let gross = base * factor
        if (emp.employmentType === 'ICO') {
          // Fakturace kolísá podle odpracovaných hodin (±12 %).
          gross *= 0.88 + noise(`${emp.id}-${year}-${month}`) * 0.24
        } else if (month === 12 && !planned) {
          // Prosincová odměna u zaměstnanců.
          gross *= 1.25
        }
        gross = Math.round(gross / 100) * 100
        return {
          id: `${emp.id}-${year}-${month}`, personId: emp.id, name: emp.name, email: emp.email,
          employmentType: emp.employmentType,
          grossAmount: gross,
          netAmount: Math.round((gross * (NET_RATIO[emp.employmentType] ?? 0.75)) / 100) * 100,
          month, year, currency: 'CZK', planned,
        }
      })
  })

  const icoEmployees = DEMO_EMPLOYEES.filter(e => e.employmentType === 'ICO').map(e => ({
    id: e.email.toLowerCase() === DEMO_USER_ICO.email.toLowerCase() ? DEMO_USER_ICO.id : e.id,
    name: e.name, email: e.email,
  }))

  return (
    <AppShell title="Přehled odměn" isAdmin={true} userName={session.user.name} userEmail={session.user.email}>
      <div className="w-full">
        <PageHero kicker="Administrace" title="Přehled odměn">Výplaty, faktury OSVČ a doklady k proplacení po lidech a měsících.</PageHero>
        <OdmenySection payslipRows={payslipRows} icoEmployees={icoEmployees} invoices={DEMO_ICO_INVOICES} expenseRequests={DEMO_EXPENSE_REQUESTS} />
      </div>
    </AppShell>
  )
}
