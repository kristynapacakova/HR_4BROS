'use client'

interface PayslipRow {
  id: string
  name: string
  email: string
  employmentType: string
  grossAmount: number
  netAmount: number
  month: number
  year: number
  currency: string
}

interface OdmenyTabsProps {
  payslips: PayslipRow[]
}

const MONTH_NAMES = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function OdmenyTabs({ payslips }: OdmenyTabsProps) {
  return (
    <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-headline font-semibold text-navy">Přehled výplat ({payslips.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Zaměstnanec</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Typ</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Období</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Hrubá</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Čistá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payslips.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-navy">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    row.employmentType === 'HPP' ? 'bg-green-50 text-green-700' :
                    row.employmentType === 'DPP' ? 'bg-blue-50 text-blue-700' :
                    'bg-sky-50 text-sky-700'
                  }`}>
                    {row.employmentType}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{MONTH_NAMES[row.month - 1]} {row.year}</td>
                <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.grossAmount, row.currency)}</td>
                <td className="px-6 py-4 text-right font-semibold text-navy">{formatCurrency(row.netAmount, row.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
