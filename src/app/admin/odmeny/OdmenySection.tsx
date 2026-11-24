'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconBanknote, IconContract, IconReceipt } from '@/components/BrandIcons'
import { OdmenyTabs, type PayslipRow } from './OdmenyTabs'
import { InvoiceOverview } from '../faktury/InvoiceOverview'
import { ExpenseAdmin } from '../vydaje/ExpenseAdmin'
import { PayScheduleSettings } from './PayScheduleSettings'
import type { IcoInvoiceRecord, ExpenseRequest } from '@/lib/mock-data'

const SUB_TABS = [
  { id: 'odmeny', label: 'Přehled odměn', icon: IconBanknote },
  { id: 'faktury', label: 'Přehled faktur OSVČ', icon: IconContract },
  { id: 'doklady', label: 'Doklady k proplacení', icon: IconReceipt },
] as const
type SubTabId = typeof SUB_TABS[number]['id']

export function OdmenySection({
  payslipRows, icoEmployees, invoices, expenseRequests,
}: {
  payslipRows: PayslipRow[]
  icoEmployees: { id: string; name: string; email?: string }[]
  invoices: IcoInvoiceRecord[]
  expenseRequests: ExpenseRequest[]
}) {
  const searchParams = useSearchParams()
  const requestedSub = searchParams.get('sub')
  const initialSub = SUB_TABS.some(t => t.id === requestedSub) ? (requestedSub as SubTabId) : 'odmeny'
  const [sub, setSub] = useState<SubTabId>(initialSub)

  return (
    <div>
      <div className="flex flex-wrap gap-1 bg-white border border-[rgba(13,33,79,0.14)] p-1 mb-6 w-fit">
        {SUB_TABS.map(t => {
          const Icon = t.icon
          const active = sub === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                active ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {sub === 'odmeny' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Roční přehled odměn po lidech (HPP, DPP, DPČ i OSVČ). U OSVČ je částka fakturace — čistá = hrubá.</p>
          <OdmenyTabs payslips={payslipRows} />
        </div>
      )}

      {sub === 'faktury' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Faktura za nájem kancelářského místa a občerstvení chodí od OSVČ na firemní mail a časem se sem bude tahat
            automaticky z Fakturoidu (napárovaného na banku), včetně toho, jestli je zaplacená. Zatím je to mock —
            stav plateb nastavuje HR ručně přímo tady.
          </p>
          <PayScheduleSettings />
          <InvoiceOverview employees={icoEmployees} invoices={invoices} isHrReviewer />
        </div>
      )}

      {sub === 'doklady' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Doklady, které lidé nahráli v záložce Moje odměna — příspěvky na sport, náklady ke klientům, cestovné
            apod. Po schválení se částka promítne do jejich odměny/faktury za daný měsíc.
          </p>
          <ExpenseAdmin seedRequests={expenseRequests} />
        </div>
      )}
    </div>
  )
}
