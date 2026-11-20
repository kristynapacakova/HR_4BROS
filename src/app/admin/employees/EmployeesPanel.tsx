import { CreateEmployeeForm } from './CreateEmployeeForm'
import { TeamLeadCell } from './TeamLeadCell'
import { RoleCell, LeaveDaysCell, IcoFieldsCell } from './PersonFieldsCell'
import { SENIORITY_LEVELS, DEMO_EMPLOYEES } from '@/lib/mock-data'

type DemoEmployee = typeof DEMO_EMPLOYEES[number]

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

function tenure(start: Date): string {
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (months < 12) return `${months}m`
  const y = Math.floor(months / 12), m = months % 12
  return m > 0 ? `${y}r ${m}m` : `${y}r`
}

const CONTRACT_BADGE: Record<string, string> = {
  HPP: 'bg-navy/10 text-navy',
  DPP: 'bg-mint-tint text-mint-dark',
  DPC: 'bg-violet/10 text-violet',
  ICO: 'bg-gold-tint text-gold-dark',
  STAZ: 'bg-violet/20 text-violet-dark',
}

export function EmployeesPanel({ employees }: { employees: DemoEmployee[] }) {
  return (
    <div className="space-y-6">

      {/* Create employee */}
      <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] p-6">
        <h3 className="font-headline font-semibold text-navy mb-4">Přidat uživatele</h3>
        <CreateEmployeeForm />
      </div>

      {/* Table */}
      <div className="bg-white shadow-[inset_0_0_0_1px_rgba(13,33,79,0.14)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-headline font-semibold text-navy">Přehled uživatelů ({employees.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Jméno</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Pozice / Level</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Úvazek</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Mzda / měs</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Efektivita</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Ve firmě</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Team lead</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Dovolená (dní/rok)</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">OSVČ — IČO / kancelář / obč.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp) => {
                const senLabel = SENIORITY_LEVELS.find(s => s.value === emp.seniority)?.label
                const efficiency = emp.monthlyHours && emp.clientHours
                  ? Math.round((emp.clientHours / emp.monthlyHours) * 100)
                  : null
                const isICO = emp.employmentType === 'ICO'

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {emp.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '??'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-navy">{emp.name || '—'}</p>
                          <p className="text-xs text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-navy font-medium">{emp.position || '—'}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {senLabel && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{senLabel}</span>
                        )}
                        {emp.employmentType && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${CONTRACT_BADGE[emp.employmentType] ?? 'bg-slate-50 text-slate-600'}`}>
                            {emp.employmentType === 'ICO' ? 'IČO' : emp.employmentType}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {emp.monthlyHours ? (
                        <div>
                          <p className="text-navy font-medium">{emp.monthlyHours} h</p>
                          {emp.clientHours && <p className="text-xs text-slate-400">kl. {emp.clientHours} h</p>}
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>

                    <td className="px-5 py-4">
                      {isICO && emp.hourlyRate ? (
                        <div>
                          <p className="text-navy font-medium">{fmt(emp.hourlyRate)}/h</p>
                          {emp.clientHours && <p className="text-xs text-slate-400">{fmt(emp.hourlyRate * emp.clientHours)}/měs</p>}
                        </div>
                      ) : emp.monthlySalary ? (
                        <p className="text-navy font-medium">{fmt(emp.monthlySalary)}</p>
                      ) : <span className="text-slate-400">—</span>}
                    </td>

                    <td className="px-5 py-4">
                      {efficiency !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${efficiency >= 80 ? 'bg-green-400' : efficiency >= 50 ? 'bg-violet' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(efficiency, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-navy">{efficiency} %</span>
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>

                    <td className="px-5 py-4 text-slate-600">{tenure(emp.startDate)}</td>
                    <td className="px-5 py-4"><RoleCell person={emp} /></td>
                    <td className="px-5 py-4">
                      <TeamLeadCell teamMemberId={emp.id} baseTeamLeadId={emp.teamLeadId} />
                    </td>
                    <td className="px-5 py-4"><LeaveDaysCell person={emp} /></td>
                    <td className="px-5 py-4"><IcoFieldsCell person={emp} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
