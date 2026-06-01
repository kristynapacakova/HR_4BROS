import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AppShell } from '@/components/layout/AppShell'
import { formatDate } from '@/lib/utils'
import { FileText, Download, Upload, FileCheck } from 'lucide-react'

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

  const userId = session.user.id
  const isAdmin = session.user.role === 'ADMIN'

  const documents = await db.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AppShell
      title="Dokumenty"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Upload section */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-headline font-semibold text-navy mb-4">Nahrát dokument</h3>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-violet transition-colors">
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">Přetáhněte soubor nebo klikněte pro výběr</p>
            <p className="text-xs text-slate-400">PDF, JPG, PNG — max 10 MB</p>
            <button className="mt-4 bg-violet hover:bg-violet-dark text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors shadow-sm">
              Vybrat soubor
            </button>
          </div>
        </div>

        {/* Documents list */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-headline font-semibold text-navy">Moje dokumenty</h3>
          </div>
          {documents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Zatím nemáte žádné dokumenty</p>
              <p className="text-slate-300 text-xs mt-1">Dokumenty přiřazené HR oddělením se zobrazí zde</p>
            </div>
          ) : (
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
                      <span className="text-xs text-slate-400">Nahráno {formatDate(doc.createdAt)}</span>
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
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                    title="Stáhnout"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
