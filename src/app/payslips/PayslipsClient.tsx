'use client'

import { useEffect, useRef, useState } from 'react'
import { Banknote, ChevronDown, TrendingUp, Clock, Download, Stethoscope, Dumbbell, Receipt, Upload, CheckCircle2, XCircle, Trash2, Pencil } from 'lucide-react'
import { computeSickPay } from '@/app/profile/panels/SickPayCard'
import {
  DEMO_BENEFIT_SELECTION, DEMO_SPORT_REQUESTS, SPORT_CONTRIBUTION_AMOUNT, MULTISPORT_MONTHLY_COST, ICO_MONTHLY_EXPENSES,
  DEMO_EXPENSE_REQUESTS, EXPENSE_CATEGORIES, INVOICE_STATUS_LABELS, type BenefitType, type ExpenseRequest, type SportBenefitRequest, type InvoicePaymentStatus,
} from '@/lib/mock-data'
import { loadBenefitSelections, loadSportRequests, saveSportRequests, BENEFIT_CHANGED_EVENT } from '@/lib/benefit-client'
import { loadExpenseRequests, saveExpenseRequests, EXPENSE_CHANGED_EVENT } from '@/lib/expense-client'
import { loadInvoiceStatuses, invoiceStatusKey, INVOICE_STATUS_CHANGED_EVENT } from '@/lib/invoice-status-client'

const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function signedAmount(exp: ExpenseRequest) {
  return exp.sign === 'MINUS' ? -exp.amount : exp.amount
}

interface Payslip {
  id: string
  month: number
  year: number
  grossAmount: number
  netAmount: number
  currency: string
  fileUrl: string | null
  planned?: boolean
}

interface SalaryInfo {
  currentSalary: number
  currency: string
  nextRaiseDate: Date
  nextRaiseAmount: number
  lastRaiseDate: Date
}

function PayslipRow({ p, isICO, benefitType, sportRequests, expenseRequests }: {
  p: Payslip
  isICO: boolean
  benefitType: BenefitType | null
  sportRequests: { employeeId: string; month: number; year: number; status: string }[]
  expenseRequests: ExpenseRequest[]
}) {
  const [open, setOpen] = useState(false)

  const monthSportApproved = sportRequests.some(r =>
    r.status === 'APPROVED' && r.month === p.month && r.year === p.year
  )
  const monthExpenses = expenseRequests.filter(e =>
    e.status === 'APPROVED' && e.month === p.month && e.year === p.year
  )
  const sportAmount =
    benefitType === 'SPORT_CONTRIBUTION' && monthSportApproved ? SPORT_CONTRIBUTION_AMOUNT :
    benefitType === 'MULTISPORT' && isICO ? -(MULTISPORT_MONTHLY_COST - SPORT_CONTRIBUTION_AMOUNT) :
    0
  const icoExpensesTotal = isICO ? ICO_MONTHLY_EXPENSES.reduce((s, e) => s + e.amount, 0) : 0
  const monthExpensesTotal = monthExpenses.reduce((s, e) => s + signedAmount(e), 0)
  const hasBreakdown = isICO || sportAmount !== 0 || monthExpensesTotal !== 0

  return (
    <div className={p.planned ? 'bg-violet/[0.02]' : ''}>
      <button
        type="button"
        onClick={() => hasBreakdown && setOpen(o => !o)}
        className={`w-full px-6 py-4 flex items-center gap-4 transition-colors text-left ${hasBreakdown ? 'cursor-pointer hover:bg-slate-50' : ''}`}
      >
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${p.planned ? 'bg-violet/10' : 'bg-alice'}`}>
          <Banknote className={`w-5 h-5 ${p.planned ? 'text-violet' : 'text-navy'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-navy">{MONTH_NAMES[p.month - 1]} {p.year}</p>
            {p.planned && (
              <span className="px-1.5 py-0.5 bg-violet/10 text-violet rounded text-xs">plánováno</span>
            )}
          </div>
          {!isICO && <p className="text-xs text-slate-400 mt-0.5">Hrubá: {fmt(p.grossAmount, p.currency)}</p>}
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${p.planned ? 'text-violet' : 'text-navy'}`}>
            {fmt(p.netAmount + icoExpensesTotal + sportAmount + monthExpensesTotal, p.currency)}
          </p>
          <p className="text-xs text-slate-400">{isICO ? 'odměna' : 'čistá'}</p>
        </div>
        {hasBreakdown && (
          <ChevronDown className={`w-4 h-4 text-slate-300 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
        {!p.planned && !isICO && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); }}
            className="flex-shrink-0 p-2 text-slate-300 hover:text-violet rounded-full hover:bg-violet/5 transition-colors"
            title={`Stáhnout výplatní pásku — ${MONTH_NAMES[p.month - 1]} ${p.year} (demo)`}
          >
            <Download className="w-4 h-4" />
          </span>
        )}
      </button>

      {open && hasBreakdown && (
        <div className="px-6 pb-4 -mt-1">
          <div className="rounded-xl bg-[#F7F8FE] p-3.5 space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">{isICO ? 'Měsíční paušál' : 'Čistá mzda'}</span>
              <span className="font-medium text-navy">{fmt(p.netAmount, p.currency)}</span>
            </div>
            {isICO && ICO_MONTHLY_EXPENSES.map((e) => (
              <div key={e.label} className="flex items-center justify-between gap-4">
                <span className="text-slate-500">{e.label}</span>
                <span className="font-medium text-green-600">+{fmt(e.amount, 'CZK')}</span>
              </div>
            ))}
            {sportAmount !== 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">{sportAmount > 0 ? 'Příspěvek na sport' : 'Multisport — doplatek nad příspěvek firmy'}</span>
                <span className={`font-medium ${sportAmount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {sportAmount > 0 ? '+' : '−'}{fmt(Math.abs(sportAmount), 'CZK')}
                </span>
              </div>
            )}
            {monthExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between gap-4">
                <span className="text-slate-500">{exp.title}</span>
                <span className={`font-medium ${exp.sign === 'MINUS' ? 'text-red-500' : 'text-green-600'}`}>
                  {exp.sign === 'MINUS' ? '−' : '+'}{fmt(exp.amount, exp.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function IcoMonthRow({ p, benefitType, sportRequests, expenseRequests }: {
  p: Payslip
  benefitType: BenefitType | null
  sportRequests: { employeeId: string; month: number; year: number; status: string }[]
  expenseRequests: ExpenseRequest[]
}) {
  const [open, setOpen] = useState(false)

  const monthSportApproved = sportRequests.some(r => r.status === 'APPROVED' && r.month === p.month && r.year === p.year)
  const monthExpenses = expenseRequests.filter(e => e.status === 'APPROVED' && e.month === p.month && e.year === p.year)
  const sportAmount =
    benefitType === 'SPORT_CONTRIBUTION' && monthSportApproved ? SPORT_CONTRIBUTION_AMOUNT :
    benefitType === 'MULTISPORT' ? -(MULTISPORT_MONTHLY_COST - SPORT_CONTRIBUTION_AMOUNT) :
    0
  const officeAmount = ICO_MONTHLY_EXPENSES.find((e) => e.label.includes('kancel'))?.amount ?? 0
  const refreshAmount = ICO_MONTHLY_EXPENSES.find((e) => e.label.includes('erstven'))?.amount ?? 0
  const otherTotal = monthExpenses.reduce((s, e) => s + signedAmount(e), 0) + sportAmount
  const otherLabel = [
    sportAmount !== 0 ? (sportAmount > 0 ? 'Sport' : 'Multisport doplatek') : null,
    ...monthExpenses.map((e) => e.title),
  ].filter(Boolean).join(', ')
  const total = p.netAmount + officeAmount + refreshAmount + otherTotal

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className={`cursor-pointer hover:bg-slate-50 transition-colors ${p.planned ? 'bg-violet/[0.02]' : ''}`}
      >
        <td className="px-6 py-3 font-medium text-navy whitespace-nowrap">
          {MONTH_NAMES[p.month - 1]} {p.year}
          {p.planned && <span className="ml-2 px-1.5 py-0.5 bg-violet/10 text-violet rounded text-[10px]">plánováno</span>}
        </td>
        <td className="px-4 py-3 text-slate-600">{fmt(p.netAmount, p.currency)}</td>
        <td className="px-4 py-3 text-slate-600">{fmt(officeAmount, 'CZK')}</td>
        <td className="px-4 py-3 text-slate-600">{fmt(refreshAmount, 'CZK')}</td>
        <td className="px-4 py-3 text-slate-600">{otherLabel || '—'}</td>
        <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">{fmt(total, p.currency)}</td>
        <td className="px-4 py-3 text-right">
          <ChevronDown className={`w-4 h-4 text-slate-300 inline-block transition-transform ${open ? 'rotate-180' : ''}`} />
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="px-6 pb-4">
            <div className="rounded-xl bg-[#F7F8FE] p-3.5 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Měsíční paušál</span>
                <span className="font-medium text-navy">{fmt(p.netAmount, p.currency)}</span>
              </div>
              {ICO_MONTHLY_EXPENSES.map((e) => (
                <div key={e.label} className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">{e.label}</span>
                  <span className="font-medium text-green-600">+{fmt(e.amount, 'CZK')}</span>
                </div>
              ))}
              {sportAmount !== 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">{sportAmount > 0 ? 'Příspěvek na sport' : 'Multisport — doplatek nad příspěvek firmy'}</span>
                  <span className={`font-medium ${sportAmount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {sportAmount > 0 ? '+' : '−'}{fmt(Math.abs(sportAmount), 'CZK')}
                  </span>
                </div>
              )}
              {monthExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">{exp.title}</span>
                  <span className={`font-medium ${exp.sign === 'MINUS' ? 'text-red-500' : 'text-green-600'}`}>
                    {exp.sign === 'MINUS' ? '−' : '+'}{fmt(exp.amount, exp.currency)}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function IcoYearTable({ year, payslips, benefitType, sportRequests, expenseRequests }: {
  year: number
  payslips: Payslip[]
  benefitType: BenefitType | null
  sportRequests: { employeeId: string; month: number; year: number; status: string }[]
  expenseRequests: ExpenseRequest[]
}) {
  const byMonth = new Map(payslips.map(p => [p.month, p]))
  const allMonths = Array.from({ length: 12 }, (_, i) => 12 - i).map(m => byMonth.get(m) ?? null).filter(Boolean) as Payslip[]

  if (allMonths.length === 0) {
    return <div className="px-6 py-10 text-center text-slate-400 text-sm">Zatím nejsou k dispozici žádné záznamy.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
            <th className="px-6 py-3 font-medium">Období</th>
            <th className="px-4 py-3 font-medium">Plat</th>
            <th className="px-4 py-3 font-medium">Místo</th>
            <th className="px-4 py-3 font-medium">Občerstvení</th>
            <th className="px-4 py-3 font-medium">Další</th>
            <th className="px-4 py-3 font-medium">Celkem</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {allMonths.map((p) => (
            <IcoMonthRow key={p.id} p={p} benefitType={benefitType} sportRequests={sportRequests} expenseRequests={expenseRequests} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function YearPanel({ year, payslips, isICO, benefitType, sportRequests, expenseRequests }: {
  year: number
  payslips: Payslip[]
  isICO: boolean
  benefitType: BenefitType | null
  sportRequests: { employeeId: string; month: number; year: number; status: string }[]
  expenseRequests: ExpenseRequest[]
}) {
  const byMonth = new Map(payslips.map(p => [p.month, p]))
  // Celý rok leden–prosinec, i pro měsíce bez záznamu
  const allMonths = Array.from({ length: 12 }, (_, i) => 12 - i).map(m => byMonth.get(m) ?? null)
  const yearTotal = payslips.filter(p => !p.planned).reduce((sum, p) => sum + p.netAmount, 0)

  return (
    <div>
      {yearTotal > 0 && (
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500">{isICO ? `Celkem odměna za ${year}` : `Celkem čistá za ${year}`}</span>
          <span className="font-semibold text-navy">{fmt(yearTotal, 'CZK')}</span>
        </div>
      )}
      <div className="divide-y divide-slate-50">
        {allMonths.map((p, i) => {
          const month = 12 - i
          if (!p) {
            return (
              <div key={month} className="px-6 py-3 flex items-center gap-4 opacity-40">
                <div className="p-2.5 rounded-lg bg-slate-100 flex-shrink-0">
                  <Banknote className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 flex-1">{MONTH_NAMES[month - 1]} {year} — bez záznamu</p>
              </div>
            )
          }
          return (
            <PayslipRow
              key={p.id}
              p={p}
              isICO={isICO}
              benefitType={benefitType}
              sportRequests={sportRequests}
              expenseRequests={expenseRequests}
            />
          )
        })}
      </div>
    </div>
  )
}

export function PayslipsClient({
  payslips,
  salaryInfo,
  employmentType,
  pageTitle,
  sickDays = 0,
  employeeId,
  employeeName,
}: {
  payslips: Payslip[]
  salaryInfo: SalaryInfo
  employmentType: string
  pageTitle: string
  /** Dny nemoci v aktuálním měsíci — zobrazí rozpis srážky */
  sickDays?: number
  employeeId?: string
  employeeName?: string
}) {
  const [showSickDetail, setShowSickDetail] = useState(false)
  const [benefitType, setBenefitType] = useState<BenefitType | null>(null)
  const [approvedThisMonth, setApprovedThisMonth] = useState(false)
  const [allSportRequests, setAllSportRequests] = useState<SportBenefitRequest[]>([])
  const [invoiceStatuses, setInvoiceStatuses] = useState<Record<string, InvoicePaymentStatus>>({})
  const [expenseRequests, setExpenseRequests] = useState<ExpenseRequest[]>([])
  const [addingExpense, setAddingExpense] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('SPORT')
  const [expSign, setExpSign] = useState<'PLUS' | 'MINUS'>('PLUS')
  const [expMonth, setExpMonth] = useState(() => new Date().getMonth() + 1)
  const [expYear, setExpYear] = useState(() => new Date().getFullYear())
  const [expSectionOpen, setExpSectionOpen] = useState(false)
  const [expSectionTouched, setExpSectionTouched] = useState(false)
  const expFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!employeeId) return
    const refresh = () => {
      const selections = loadBenefitSelections(DEMO_BENEFIT_SELECTION)
      setBenefitType(selections[employeeId] ?? null)
      const now = new Date()
      const requests = loadSportRequests(DEMO_SPORT_REQUESTS)
      setApprovedThisMonth(requests.some(r =>
        r.employeeId === employeeId && r.status === 'APPROVED' &&
        r.month === now.getMonth() + 1 && r.year === now.getFullYear()
      ))
      setAllSportRequests(requests)
      setInvoiceStatuses(loadInvoiceStatuses())
      const allExpenses = loadExpenseRequests(DEMO_EXPENSE_REQUESTS)
      setExpenseRequests(allExpenses)
      setExpSectionTouched((touched) => {
        if (touched) return touched
        const hasThisMonth = allExpenses.some((r) =>
          r.employeeId === employeeId && r.month === now.getMonth() + 1 && r.year === now.getFullYear()
        )
        setExpSectionOpen(hasThisMonth)
        return true
      })
    }
    refresh()
    window.addEventListener(BENEFIT_CHANGED_EVENT, refresh)
    window.addEventListener(EXPENSE_CHANGED_EVENT, refresh)
    window.addEventListener(INVOICE_STATUS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(BENEFIT_CHANGED_EVENT, refresh)
      window.removeEventListener(EXPENSE_CHANGED_EVENT, refresh)
      window.removeEventListener(INVOICE_STATUS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [employeeId])

  const now = new Date()
  const sportRequests = allSportRequests.filter(r => r.employeeId === employeeId)
  const myExpenses = expenseRequests
    .filter(r => r.employeeId === employeeId)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  const myExpensesThisMonth = myExpenses.filter(r => r.month === now.getMonth() + 1 && r.year === now.getFullYear())
  const approvedExpensesThisMonth = myExpensesThisMonth.filter(r => r.status === 'APPROVED')

  // Sjednocený seznam dokladů (obecné výdaje + doklady na sport) — vidět hned po odeslání, se stavem.
  const myDocs = [
    ...myExpenses.map((e) => ({
      kind: 'expense' as const, id: e.id, title: e.title, receiptName: e.receiptName, month: e.month, year: e.year,
      amount: e.amount, sign: e.sign, currency: e.currency, status: e.status, requestedAt: e.requestedAt,
    })),
    ...sportRequests.map((r) => ({
      kind: 'sport' as const, id: r.id, title: 'Příspěvek na sport', receiptName: r.receiptName, month: r.month, year: r.year,
      amount: SPORT_CONTRIBUTION_AMOUNT, sign: 'PLUS' as const, currency: 'CZK', status: r.status, requestedAt: r.requestedAt,
    })),
  ].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  const myDocsThisMonth = myDocs.filter((d) => d.month === now.getMonth() + 1 && d.year === now.getFullYear())

  const resetExpenseForm = () => {
    setExpTitle(''); setExpAmount(''); setExpCategory('SPORT'); setExpSign('PLUS')
    setExpMonth(new Date().getMonth() + 1); setExpYear(new Date().getFullYear())
    setAddingExpense(false); setEditingExpenseId(null)
    if (expFileRef.current) expFileRef.current.value = ''
  }

  const startEditExpense = (exp: ExpenseRequest) => {
    setEditingExpenseId(exp.id)
    setExpTitle(exp.title)
    setExpAmount(String(exp.amount))
    setExpCategory(exp.category)
    setExpSign(exp.sign)
    setExpMonth(exp.month)
    setExpYear(exp.year)
    setAddingExpense(true)
  }

  const deleteExpense = (id: string) => {
    saveExpenseRequests(expenseRequests.filter((r) => r.id !== id))
  }

  const deleteSportDoc = (id: string) => {
    saveSportRequests(allSportRequests.filter((r) => r.id !== id))
  }

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const file = expFileRef.current?.files?.[0]
    const amt = Number(expAmount)
    if (!employeeId || !expTitle.trim() || !amt || amt <= 0) return

    if (editingExpenseId) {
      const existing = expenseRequests.find((r) => r.id === editingExpenseId)
      if (!existing) return
      const updated: ExpenseRequest = {
        ...existing,
        title: expTitle.trim(),
        amount: amt,
        sign: expSign,
        category: expCategory,
        month: expMonth,
        year: expYear,
        receiptName: file ? file.name : existing.receiptName,
      }
      saveExpenseRequests(expenseRequests.map((r) => (r.id === editingExpenseId ? updated : r)))
      resetExpenseForm()
      return
    }

    if (!file) return

    if (expCategory === 'SPORT') {
      // Doklad na příspěvek na sport patří do benefitů, ne mezi obecné výdaje.
      const newSportReq: SportBenefitRequest = {
        id: `sport-${Date.now()}`,
        employeeId,
        employeeName: employeeName ?? '',
        month: expMonth,
        year: expYear,
        receiptName: file.name,
        status: 'PENDING',
        requestedAt: now.toISOString().slice(0, 10),
      }
      saveSportRequests([newSportReq, ...allSportRequests])
    } else {
      const newReq: ExpenseRequest = {
        id: `exp-${Date.now()}`,
        employeeId,
        employeeName: employeeName ?? '',
        title: expTitle.trim(),
        amount: amt,
        sign: expSign,
        currency: 'CZK',
        category: expCategory,
        receiptName: file.name,
        month: expMonth,
        year: expYear,
        status: 'PENDING',
        requestedAt: now.toISOString().slice(0, 10),
      }
      saveExpenseRequests([newReq, ...expenseRequests])
    }
    resetExpenseForm()
  }

  const sorted = [...payslips].sort((a, b) => (b.year - a.year) || (b.month - a.month))

  const byYear = sorted.reduce<Record<number, Payslip[]>>((acc, p) => {
    (acc[p.year] ??= []).push(p)
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)
  const currentCalendarYear = new Date().getFullYear()
  const defaultYear = years.includes(currentCalendarYear) ? currentCalendarYear : (years[0] ?? currentCalendarYear)
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear)

  const latestReal = payslips.find(p => !p.planned)
  const isICO = employmentType === 'ICO'

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Hero — current salary */}
      {latestReal && (
        <div className="relative bg-navy rounded-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-violet opacity-20" />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-[0.03]" />
          </div>
          <div className="relative z-10 px-7 py-6">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
              {isICO ? 'Poslední faktura' : 'Poslední výplata'} — {MONTH_NAMES[latestReal.month - 1]} {latestReal.year}
            </p>
            <div className="flex items-end gap-8 flex-wrap">
              {!isICO && (
                <div>
                  <p className="text-white/50 text-xs mb-1">Hrubá mzda</p>
                  <p className="text-xl font-headline font-semibold text-white/80">{fmt(latestReal.grossAmount, latestReal.currency)}</p>
                </div>
              )}
              <div>
                <p className="text-white/50 text-xs mb-1">{isICO ? 'Měsíční odměna' : 'Čistá mzda'}</p>
                <p className="text-3xl font-headline font-bold text-white">{fmt(latestReal.netAmount, latestReal.currency)}</p>
              </div>
            </div>

            {/* Next raise info */}
            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 w-fit">
              <TrendingUp className="w-4 h-4 text-violet-light flex-shrink-0" />
              <p className="text-sm text-white/80">
                Další navýšení:{' '}
                <span className="font-semibold text-white">+{fmt(salaryInfo.nextRaiseAmount, salaryInfo.currency)}</span>
                {' '}od{' '}
                <span className="font-semibold text-white">
                  {salaryInfo.nextRaiseDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Doklady k proplacení — sbalitelné, samo se rozbalí když je letos co řešit */}
      {employeeId && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setExpSectionOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-violet flex-shrink-0" />
              <p className="text-sm font-semibold text-navy">Doklady k proplacení</p>
              {myDocsThisMonth.length > 0 && (
                <span className="bg-violet/10 text-violet text-xs font-medium px-2 py-0.5 rounded-full">{myDocsThisMonth.length}</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-300 flex-shrink-0 transition-transform ${expSectionOpen ? 'rotate-180' : ''}`} />
          </button>

          {expSectionOpen && (
            <div className="px-5 pb-5">
              <p className="text-xs text-slate-400 mb-4">
                Nahraj doklad — příspěvek na sport, náklad ke klientovi, cestovné apod. Zvol, jestli si to chceš nechat
                proplatit (+), nebo naopak nechat strhnout z {isICO ? 'faktury' : 'odměny'} (−). Po schválení HR se to
                promítne do {isICO ? 'faktury' : 'odměny'} za daný měsíc. Doklad na sport najdeš pak i v záložce Benefity.
                Po skončení měsíce se tu ukazuje zase jen nový, čistý měsíc — starší doklady najdeš v rozpisu daného
                měsíce v přehledu níže.
              </p>

              <p className="text-xs font-medium text-slate-500 mb-2">{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</p>

              {myDocsThisMonth.length > 0 && (
                <div className="divide-y divide-slate-50 border-t border-slate-100 mb-3">
                  {myDocsThisMonth.map((exp) => (
                    <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-navy truncate">{exp.title}</p>
                        <p className="text-[11px] text-slate-400">{exp.receiptName} · {MONTH_NAMES[exp.month - 1]} {exp.year}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-sm font-semibold ${exp.sign === 'MINUS' ? 'text-red-500' : 'text-navy'}`}>
                          {exp.sign === 'MINUS' ? '−' : '+'}{fmt(exp.amount, exp.currency)}
                        </span>
                        {exp.status === 'APPROVED' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Schváleno
                          </span>
                        )}
                        {exp.status === 'REJECTED' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Zamítnuto
                          </span>
                        )}
                        {exp.status === 'PENDING' && (
                          <>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Čeká na HR
                            </span>
                            {exp.kind === 'expense' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const full = expenseRequests.find((r) => r.id === exp.id)
                                  if (full) startEditExpense(full)
                                }}
                                className="p-1.5 text-slate-300 hover:text-violet rounded-full hover:bg-violet/5 transition-colors"
                                title="Upravit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => (exp.kind === 'expense' ? deleteExpense(exp.id) : deleteSportDoc(exp.id))}
                              className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              title="Smazat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!addingExpense ? (
                <button
                  onClick={() => setAddingExpense(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:text-navy hover:border-slate-300 transition-colors w-full"
                >
                  <Upload className="w-4 h-4 flex-shrink-0" />
                  Nahrát doklad k proplacení
                </button>
              ) : (
                <form onSubmit={submitExpense} className="space-y-3 pt-1">
                  {expCategory !== 'SPORT' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Typ položky</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setExpSign('PLUS')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                            expSign === 'PLUS' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          + Chci proplatit
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpSign('MINUS')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                            expSign === 'MINUS' ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          − Strhnout z {isICO ? 'faktury' : 'odměny'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Co to bylo</label>
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="např. Oběd s klientem"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Částka (Kč)</label>
                      <input
                        type="number"
                        min={1}
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Kam to spadá</label>
                      <select
                        value={expCategory}
                        onChange={(e) => setExpCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                      >
                        {EXPENSE_CATEGORIES.filter((c) => !editingExpenseId || c.value !== 'SPORT').map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Za jaké období (do kterého měsíce se má propsat)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={expMonth}
                        onChange={(e) => setExpMonth(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                      >
                        {MONTH_NAMES.map((name, i) => (
                          <option key={name} value={i + 1}>{name}</option>
                        ))}
                      </select>
                      <select
                        value={expYear}
                        onChange={(e) => setExpYear(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                      >
                        {[expYear - 1, expYear, expYear + 1].filter((y, i, arr) => arr.indexOf(y) === i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Doklad{editingExpenseId ? ' (nech prázdné, pokud měníš jen ostatní údaje)' : ''}
                    </label>
                    <input ref={expFileRef} type="file" accept="image/*,.pdf" required={!editingExpenseId} className="w-full text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="px-4 py-2 bg-violet hover:bg-violet-dark text-white text-sm font-medium rounded-full transition-colors">
                      {editingExpenseId ? 'Uložit změny' : 'Odeslat ke schválení'}
                    </button>
                    <button type="button" onClick={resetExpenseForm} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy transition-colors">
                      Zrušit
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rozpis odměny tento měsíc — základ, doplňkové položky, benefit, nemoc, k výplatě */}
      {latestReal && (isICO || benefitType || approvedExpensesThisMonth.length > 0 || (!isICO && sickDays > 0)) && (() => {
        const sick = !isICO && sickDays > 0 ? computeSickPay(salaryInfo.currentSalary, sickDays) : null
        const benefitAmount =
          benefitType === 'SPORT_CONTRIBUTION' && approvedThisMonth ? SPORT_CONTRIBUTION_AMOUNT :
          benefitType === 'MULTISPORT' && isICO ? -(MULTISPORT_MONTHLY_COST - SPORT_CONTRIBUTION_AMOUNT) :
          0
        const icoExpensesTotal = isICO ? ICO_MONTHLY_EXPENSES.reduce((s, e) => s + e.amount, 0) : 0
        const approvedExpensesTotal = approvedExpensesThisMonth.reduce((s, e) => s + signedAmount(e), 0)
        const adjustedNet = latestReal.netAmount + benefitAmount + icoExpensesTotal + approvedExpensesTotal - (sick?.deduction ?? 0)

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-navy mb-3">Rozpis odměny — {MONTH_NAMES[latestReal.month - 1]} {latestReal.year}</p>
            <div className="space-y-2 text-sm">
              {isICO ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Měsíční paušál</span>
                    <span className="font-medium text-navy">{fmt(latestReal.netAmount, latestReal.currency)}</span>
                  </div>
                  {ICO_MONTHLY_EXPENSES.map((e) => {
                    const status = employeeId ? invoiceStatuses[invoiceStatusKey(employeeId, latestReal.month, latestReal.year)] ?? 'NEZAPLACENO' : 'NEZAPLACENO'
                    const statusStyle =
                      status === 'ZAPLACENO' ? 'bg-green-50 text-green-700' :
                      status === 'CEKA_NA_UHRADU' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    return (
                      <div key={e.label} className="flex items-center justify-between gap-4">
                        <span className="text-slate-500 flex items-center gap-1.5 flex-wrap">
                          {e.label}
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyle}`}>{INVOICE_STATUS_LABELS[status]}</span>
                        </span>
                        <span className="font-medium text-green-600 flex-shrink-0">+{fmt(e.amount, 'CZK')}</span>
                      </div>
                    )
                  })}
                  <p className="text-[10px] text-slate-400">
                    Stav platby zatím nastavuje HR ručně — časem se propíše z Fakturoidu.
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Hrubá mzda</span>
                  <span className="font-medium text-navy">{fmt(latestReal.grossAmount, latestReal.currency)}</span>
                </div>
              )}

              {benefitType === 'SPORT_CONTRIBUTION' && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    Příspěvek na sport {approvedThisMonth ? '' : '(čeká na schválení)'}
                  </span>
                  <span className={`font-medium ${approvedThisMonth ? 'text-green-600' : 'text-slate-400'}`}>
                    {approvedThisMonth ? `+${fmt(SPORT_CONTRIBUTION_AMOUNT, 'CZK')}` : '—'}
                  </span>
                </div>
              )}

              {benefitType === 'MULTISPORT' && isICO && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    Multisport — doplatek nad příspěvek firmy
                  </span>
                  <span className="font-medium text-red-500">
                    −{fmt(MULTISPORT_MONTHLY_COST - SPORT_CONTRIBUTION_AMOUNT, 'CZK')}
                  </span>
                </div>
              )}

              {approvedExpensesThisMonth.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Receipt className={`w-3.5 h-3.5 flex-shrink-0 ${exp.sign === 'MINUS' ? 'text-red-400' : 'text-green-500'}`} />
                    {exp.title}
                  </span>
                  <span className={`font-medium ${exp.sign === 'MINUS' ? 'text-red-500' : 'text-green-600'}`}>
                    {exp.sign === 'MINUS' ? '−' : '+'}{fmt(exp.amount, exp.currency)}
                  </span>
                </div>
              ))}

              {sick && (
                <div>
                  <button onClick={() => setShowSickDetail(s => !s)} className="w-full flex items-center justify-between gap-4 text-left">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      Nemoc — {sickDays} {sickDays === 1 ? 'den' : sickDays < 5 ? 'dny' : 'dní'}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showSickDetail ? 'rotate-180' : ''}`} />
                    </span>
                    <span className="font-medium text-red-500">−{fmt(sick.deduction, 'CZK')}</span>
                  </button>
                  {showSickDetail && (
                    <div className="mt-3 rounded-2xl bg-[#F7F8FE] p-4 space-y-1.5">
                      {[
                        ['Průměrný hodinový výdělek', `${fmt(sick.avgHourly, 'CZK')}/h`],
                        ['Po redukci (90/60/30 %)', `${fmt(sick.reduced, 'CZK')}/h`],
                        ['Náhrada mzdy (60 % redukovaného)', `${fmt(sick.compensationHourly, 'CZK')}/h`],
                        ['Náhrada za den (8 h)', fmt(sick.compensationDay, 'CZK')],
                        [`Hrazeno zaměstnavatelem (1.–14. den)`, `${sick.employerDays} dní → ${fmt(sick.compensationTotal, 'CZK')}`],
                        ...(sick.csszDays > 0 ? [['Od 15. dne platí ČSSZ (nemocenské)', `${sick.csszDays} dní`]] : []),
                      ].map(([label, value]) => (
                        <div key={label as string} className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-navy whitespace-nowrap">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-slate-200">
                <span className="text-navy font-semibold">{isICO ? 'Odměna k fakturaci' : 'Čistá k výplatě'}</span>
                <span className="font-bold text-navy">{fmt(adjustedNet, latestReal.currency)}</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Přehled výplat — klikatelné roky nahoře, výchozí je aktuální rok */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-headline font-semibold text-navy mb-3">
            {isICO ? 'Přehled faktur' : 'Přehled výplat'}
          </h3>
          <div className="flex flex-wrap gap-1">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  y === selectedYear ? 'bg-violet text-white' : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {byYear[selectedYear] ? (
          isICO ? (
            <IcoYearTable
              year={selectedYear}
              payslips={byYear[selectedYear]}
              benefitType={benefitType}
              sportRequests={sportRequests}
              expenseRequests={myExpenses}
            />
          ) : (
            <YearPanel
              year={selectedYear}
              payslips={byYear[selectedYear]}
              isICO={isICO}
              benefitType={benefitType}
              sportRequests={sportRequests}
              expenseRequests={myExpenses}
            />
          )
        ) : (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">Zatím nejsou k dispozici žádné záznamy.</div>
        )}
      </div>

    </div>
  )
}
