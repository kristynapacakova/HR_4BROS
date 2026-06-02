import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate } from '@/lib/utils'
import { FileText, Download, Upload, FileCheck } from 'lucide-react'
import { DEMO_DOCUMENTS, DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'

const docTypeLabels: Record<string, string> = {
  CONTRACT: 'Smlouva',
  ID: 'Doklad totožnosti',
  PAYSLIP: 'Výplatní páska',
  OTHER: 'Ostatní',
}

const docTypeColors: Record<string, string> = {
  CONTRACT: 'bg-blue-50 text-blue-600',
  ID: 'bg-purple-50 text-violet',
  PAYSLIP: 'bg-green-50 text-green-600',
  OTHER: 'bg-slate-50 text-slate-600',
}

export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER
  const documents = DEMO_DOCUMENTS

  return (
    <AppShell
      title="Dokumenty"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Upload section */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline font-semibold text-navy mb-4">Nahrát dokument</h3>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-violet transition-colors">
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">Přetáhněte soubor nebo klikněte pro výběr</p>
            <p className="text-xs text-slate-400">PDF, JPG, PNG — max 10 MB</p>
            <p className="text-xs text-amber-600 mt-2">Demo verze — nahrávání není dostupné</p>
          </div>
        </div>

        {/* Documents list */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Moje dokumenty</h3>
          </div>
          <ul className="divide-y divide-slate-50">
            {documents.map((doc) => (
              <li key={doc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className={`p-2.5 rounded-lg ${docTypeColors[doc.type] || 'bg-slate-50 text-slate-500'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">{docTypeLabels[doc.type] || doc.type}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">Nahráno {formatDate(doc.uploadedAt)}</span>
                    {doc.signedAt && (
                      <>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> Podepsáno
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="flex-shrink-0 p-2 text-slate-300 rounded-lg" title="Stáhnout (demo)">
                  <Download className="w-4 h-4" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
