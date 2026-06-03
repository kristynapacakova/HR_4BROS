import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { FileText, Download, FileCheck, FileSignature, ShieldCheck, FileKey } from 'lucide-react'
import { DEMO_DOCUMENTS, DEMO_USER, DEMO_ADMIN, DEMO_CONTRACTS, CONTRACT_TEMPLATES } from '@/lib/mock-data'
import { PayslipYearPicker } from './PayslipYearPicker'
import { DocumentsSigningClient } from './DocumentsSigningClient'


const TAG_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  SMLOUVA: { label: 'Smlouva',  color: 'bg-blue-50 text-blue-700',   Icon: FileSignature },
  DODATEK: { label: 'Dodatek',  color: 'bg-violet/10 text-violet',   Icon: FileText },
  GDPR:    { label: 'GDPR',     color: 'bg-green-50 text-green-700', Icon: ShieldCheck },
  NDA:     { label: 'NDA',      color: 'bg-amber-50 text-amber-700', Icon: FileKey },
}

const TAG_ORDER = ['SMLOUVA', 'DODATEK', 'GDPR', 'NDA']

type Doc = typeof DEMO_DOCUMENTS[number]

function ContractRow({ doc }: { doc: Doc }) {
  const cfg = TAG_CONFIG[doc.tag ?? ''] ?? { label: doc.tag ?? '—', color: 'bg-slate-50 text-slate-600', Icon: FileText }
  const { Icon } = cfg
  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
      <div className={`p-2.5 rounded-lg flex-shrink-0 ${cfg.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-navy truncate">{doc.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
          {doc.signedAt
            ? <span className="text-xs text-green-600 flex items-center gap-1"><FileCheck className="w-3 h-3" />Podepsáno</span>
            : <span className="text-xs text-slate-400">Čeká na podpis</span>
          }
        </div>
      </div>
      <button className="flex-shrink-0 p-2 text-slate-300 hover:text-navy rounded-lg transition-colors" title="Stáhnout (demo)">
        <Download className="w-4 h-4" />
      </button>
    </div>
  )
}


export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER
  const isHPP = user.employmentType === 'HPP'

  const contracts = DEMO_DOCUMENTS
    .filter(d => d.type === 'CONTRACT')
    .sort((a, b) => TAG_ORDER.indexOf(a.tag ?? '') - TAG_ORDER.indexOf(b.tag ?? ''))

  // Group payslips by year, sorted newest first
  const payslips = DEMO_DOCUMENTS
    .filter(d => d.type === 'PAYSLIP')
    .sort((a, b) => {
      const ad = a as typeof a & { month?: number; year?: number }
      const bd = b as typeof b & { month?: number; year?: number }
      if ((bd.year ?? 0) !== (ad.year ?? 0)) return (bd.year ?? 0) - (ad.year ?? 0)
      return (bd.month ?? 0) - (ad.month ?? 0)
    })

  const payslipsByYear = payslips.reduce<Record<number, typeof payslips>>((acc, p) => {
    const y = (p as typeof p & { year?: number }).year ?? 0
    if (!acc[y]) acc[y] = []
    acc[y].push(p)
    return acc
  }, {})

  const payslipYears = Object.keys(payslipsByYear).map(Number).sort((a, b) => b - a)

  return (
    <AppShell
      title="Dokumenty a smlouvy"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Smlouvy čekající na podpis zaměstnance */}
        <DocumentsSigningClient
          contracts={DEMO_CONTRACTS.filter(c => c.status === 'PENDING_EMPLOYEE' || c.status === 'SIGNED')}
          templates={CONTRACT_TEMPLATES}
        />

        {/* Smlouvy */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-headline font-semibold text-navy">Smlouvy</h3>
              <p className="text-xs text-slate-400 mt-0.5">{contracts.length} dokumentů</p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {TAG_ORDER.map(tag => {
                const cfg = TAG_CONFIG[tag]
                return (
                  <span key={tag} className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.color}`}>{cfg.label}</span>
                )
              })}
            </div>
          </div>
          {contracts.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">Žádné dokumenty</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {contracts.map(doc => <ContractRow key={doc.id} doc={doc} />)}
            </div>
          )}
        </div>

        {/* Výplatní pásky — only HPP */}
        {isHPP && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-headline font-semibold text-navy">Výplatní pásky</h3>
              <p className="text-xs text-slate-400 mt-0.5">{payslips.length} dokumentů</p>
            </div>
            <PayslipYearPicker
              payslipsByYear={payslipsByYear as Record<number, { id: string; name: string; month?: number; year?: number }[]>}
              years={payslipYears}
            />
          </div>
        )}

      </div>
    </AppShell>
  )
}
